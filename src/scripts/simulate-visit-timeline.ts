import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../visit/entities/visit.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import { Aid } from '../aid/entities/aid.entity';
import { Family } from '../family/entities/family.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { DashboardCronService } from '../dashboard/dashboard-cron.service';
import { Deposit } from '../deposit/entities/deposit.entity';
import { StatsService } from '../dashboard/stats.service';

interface SimulationConfig {
  totalVisits: number;
  daysBetweenVisits: number;
  minDistributions: number;
  maxDistributions: number;
  fakerSeed?: number;
  baseDate: Date;
}

const simulationConfig: SimulationConfig = {
  totalVisits: readNumericEnv('SIM_VISITS', 8),
  daysBetweenVisits: readNumericEnv('SIM_DAYS_BETWEEN', 10),
  minDistributions: readNumericEnv('SIM_MIN_DISTRIBUTIONS', 5),
  maxDistributions: readNumericEnv('SIM_MAX_DISTRIBUTIONS', 12),
  fakerSeed: process.env.SIM_RANDOM_SEED ? Number(process.env.SIM_RANDOM_SEED) : undefined,
  baseDate: process.env.SIM_BASE_DATE ? new Date(process.env.SIM_BASE_DATE) : subtractMonths(new Date(), 6),
};

if (Number.isFinite(simulationConfig.fakerSeed)) {
  faker.seed(simulationConfig.fakerSeed as number);
  console.log(`Using faker random seed: ${simulationConfig.fakerSeed}`);
}

const unitOptions = ['kg', 'liters', 'boxes', 'kits', 'packs', 'vouchers', 'blankets'];

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const visitRepo = app.get<Repository<Visit>>(getRepositoryToken(Visit));
    const familyRepo = app.get<Repository<Family>>(getRepositoryToken(Family));
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const aidRepo = app.get<Repository<Aid>>(getRepositoryToken(Aid));
    const aidDistributionRepo = app.get<Repository<AidDistribution>>(getRepositoryToken(AidDistribution));
    const depositRepo = app.get<Repository<Deposit>>(getRepositoryToken(Deposit));
    const statsService = app.get(StatsService);
    const dashboardCron = app.get(DashboardCronService);

    const families = await familyRepo.find({ relations: ['location'] });
    const employees = await userRepo.find({ where: { role: UserRole.EMPLOYEE } });
    const aids = await aidRepo.find({ relations: ['deposit'] });

    if (families.length === 0) {
      throw new Error('No families found. Seed families before running the simulator.');
    }
    if (employees.length === 0) {
      throw new Error('No employees found. Seed employees before running the simulator.');
    }
    if (aids.length === 0) {
      throw new Error('No aids found. Seed aids before running the simulator.');
    }

    const results = [] as Array<{ visitId: string; distributions: number; startDate: Date; endDate: Date }>;

    let currentStart = new Date(simulationConfig.baseDate);
    for (let i = 0; i < simulationConfig.totalVisits; i++) {
      const durationHours = faker.number.int({ min: 2, max: 6 });
      const startDate = new Date(currentStart);
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

      const anchorFamily = faker.helpers.arrayElement(families);
      const anchorLocation = anchorFamily.location;

      const visit = visitRepo.create({
        startDate,
        endDate,
        latitude: anchorLocation?.latitude ?? jitterCoordinate(33.8938),
        longitude: anchorLocation?.longitude ?? jitterCoordinate(35.5018),
        city: anchorLocation?.city ?? faker.location.city(),
        region: anchorLocation?.region ?? faker.location.state(),
        isActive: true,
        isCompleted: false,
        statsComputed: false,
        families: pickRandomSubset(families, 2, 4),
        users: pickRandomSubset(employees, 1, Math.min(3, employees.length)),
        notes: `Simulated visit #${i + 1}`,
      });

      const savedVisit = await visitRepo.save(visit);
      const distributions = await simulateAidDrops({
        aidDistributionRepo,
        aidRepo,
        depositRepo,
        statsService,
        visit: savedVisit,
        aids,
        startDate,
        endDate,
      });

      savedVisit.isActive = false;
      savedVisit.isCompleted = true;
      savedVisit.statsComputed = false;
      await visitRepo.save(savedVisit);

      await dashboardCron.rebuildVisitAidStats();

      await userRepo
        .createQueryBuilder()
        .update()
        .set({ currentVisit: null })
        .where('currentVisitId = :visitId', { visitId: savedVisit.id })
        .execute();

      results.push({ visitId: savedVisit.id, distributions, startDate, endDate });

      currentStart = addDays(startDate, simulationConfig.daysBetweenVisits);
    }

    console.table(
      results.map((result, index) => ({
        visit: index + 1,
        visitId: result.visitId,
        start: result.startDate.toISOString(),
        end: result.endDate.toISOString(),
        distributions: result.distributions,
      })),
    );
    console.log('Timeline simulation finished. Visit stats refreshed after each visit.');
  } catch (error) {
    console.error('Failed to simulate visit timeline:', error);
    process.exitCode = 1;
  } finally {
    // Ensure Nest context shuts down even on failures
    await app.close();
  }
}

async function simulateAidDrops({
  aidDistributionRepo,
  aidRepo,
  depositRepo,
  statsService,
  visit,
  aids,
  startDate,
  endDate,
}: {
  aidDistributionRepo: Repository<AidDistribution>;
  aidRepo: Repository<Aid>;
  depositRepo: Repository<Deposit>;
  statsService: StatsService;
  visit: Visit;
  aids: Aid[];
  startDate: Date;
  endDate: Date;
}) {
  const distributionCount = faker.number.int({
    min: simulationConfig.minDistributions,
    max: simulationConfig.maxDistributions,
  });

  const windowMs = endDate.getTime() - startDate.getTime();
  const increments = windowMs / Math.max(distributionCount, 1);

  let successfulDistributions = 0;
  const touchedDeposits = new Set<string>();

  for (let i = 0; i < distributionCount; i++) {
    const aid = faker.helpers.arrayElement(aids);
    if (!aid.deposit) {
      continue;
    }
    const maxAvailable = Math.min(
      aid.quantity,
      aid.deposit.currentQuantity,
      faker.number.int({ min: 20, max: 200 }),
    );
    if (maxAvailable <= 0) {
      continue;
    }
    const quantity = Math.max(1, maxAvailable);

    const distribution = aidDistributionRepo.create({
      visit,
      aid,
      quantity,
      unit: faker.helpers.arrayElement(unitOptions),
      notes: faker.commerce.productDescription(),
      sourceDeposit: aid.deposit,
    });

    const savedDistribution = await aidDistributionRepo.save(distribution);
    aid.quantity -= quantity;
    aid.deposit.currentQuantity -= quantity;
    await aidRepo.save(aid);
    await depositRepo.save(aid.deposit);
    touchedDeposits.add(aid.deposit.id);

    const slotStart = startDate.getTime() + increments * i;
    const jitterMinutes = faker.number.int({ min: 5, max: 55 });
    const timestampMs = Math.min(slotStart + jitterMinutes * 60000, endDate.getTime());
    const distributionTimestamp = new Date(timestampMs);
    await overrideCreatedAt(aidDistributionRepo, savedDistribution.id, distributionTimestamp);
    successfulDistributions++;
  }

  await Promise.all(Array.from(touchedDeposits).map((id) => statsService.recordDepositSnapshot(id)));

  return successfulDistributions;
}

async function overrideCreatedAt(repo: Repository<AidDistribution>, id: string, timestamp: Date) {
  await repo
    .createQueryBuilder()
    .update()
    .set({ createdAt: timestamp } as any)
    .where('id = :id', { id })
    .execute();
}

function pickRandomSubset<T>(items: T[], min: number, max: number) {
  if (!items.length) {
    return [];
  }
  const safeMax = Math.min(Math.max(min, max), items.length);
  const safeMin = Math.max(1, Math.min(min, safeMax));
  const count = faker.number.int({ min: safeMin, max: safeMax });
  return faker.helpers.arrayElements(items, count);
}

function jitterCoordinate(base: number) {
  const offset = faker.number.int({ min: -40, max: 40 }) / 1000;
  return Number((base + offset).toFixed(6));
}

function subtractMonths(date: Date, months: number) {
  const clone = new Date(date);
  clone.setMonth(clone.getMonth() - months);
  return clone;
}

function addDays(date: Date, days: number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function readNumericEnv(key: string, fallback: number) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

main().catch((err) => {
  console.error('Unexpected error during visit timeline simulation:', err);
  process.exit(1);
});
