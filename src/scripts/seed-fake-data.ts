import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../user/entities/user.entity';
import { Family } from '../family/entities/family.entity';
import { Location } from '../location/entities/location.entity';
import { Visit } from '../visit/entities/visit.entity';
import { Aid } from '../aid/entities/aid.entity';
import { AidType } from '../aid/aid.types';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import { Deposit, HumidityLevel } from '../deposit/entities/deposit.entity';
import { StatsService } from '../dashboard/stats.service';

interface SeedConfig {
	employeeCount: number;
	familyCount: number;
	pastVisitCount: number;
	futureVisitCount: number;
	aidCount: number;
	depositCount: number;
}

const defaultConfig: SeedConfig = {
	employeeCount: readNumericEnv('SEED_EMPLOYEES', 6),
	familyCount: readNumericEnv('SEED_FAMILIES', 28),
	pastVisitCount: readNumericEnv('SEED_PAST_VISITS', 10),
	futureVisitCount: readNumericEnv('SEED_FUTURE_VISITS', 6),
	aidCount: readNumericEnv('SEED_AIDS', 8),
	depositCount: readNumericEnv('SEED_DEPOSITS', 3),
};

const seedPassword = process.env.SEED_PASSWORD ?? 'Password123!';
const fakerSeed = process.env.SEED_RANDOM_SEED ? Number(process.env.SEED_RANDOM_SEED) : undefined;
if (Number.isFinite(fakerSeed)) {
	faker.seed(fakerSeed as number);
	console.log(`Using faker seed: ${fakerSeed}`);
}

const unitOptions = ['kg', 'liters', 'boxes', 'kits', 'packs', 'vouchers', 'blankets'];
const cityPresets = [
	{ city: 'Beirut', region: 'Beirut Governorate', latitude: 33.8938, longitude: 35.5018 },
	{ city: 'Tripoli', region: 'North Governorate', latitude: 34.4367, longitude: 35.8497 },
	{ city: 'Sidon', region: 'South Governorate', latitude: 33.5606, longitude: 35.3981 },
	{ city: 'Tyre', region: 'South Governorate', latitude: 33.273, longitude: 35.1939 },
	{ city: 'Zahle', region: 'Beqaa Governorate', latitude: 33.8467, longitude: 35.902 },
	{ city: 'Byblos', region: 'Mount Lebanon Governorate', latitude: 34.1204, longitude: 35.6485 },
];

const depositPresets = [
	{
		name: 'Central Cold Chain Depot',
		city: 'Beirut',
		region: 'Beirut Governorate',
		capacity: 2500,
		isRefrigerated: true,
		humidityLevel: HumidityLevel.LOW,
		minTemperatureC: 2,
		maxTemperatureC: 8,
	},
	{
		name: 'North Relief Warehouse',
		city: 'Tripoli',
		region: 'North Governorate',
		capacity: 1800,
		isRefrigerated: false,
		humidityLevel: HumidityLevel.MEDIUM,
		minTemperatureC: 10,
		maxTemperatureC: 35,
	},
	{
		name: 'South Coastal Storage',
		city: 'Sidon',
		region: 'South Governorate',
		capacity: 1500,
		isRefrigerated: true,
		humidityLevel: HumidityLevel.HIGH,
		minTemperatureC: -5,
		maxTemperatureC: 12,
	},
];

async function main() {
	const app = await NestFactory.createApplicationContext(AppModule);
	try {
		const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
		const familyRepo = app.get<Repository<Family>>(getRepositoryToken(Family));
		const locationRepo = app.get<Repository<Location>>(getRepositoryToken(Location));
		const visitRepo = app.get<Repository<Visit>>(getRepositoryToken(Visit));
		const aidRepo = app.get<Repository<Aid>>(getRepositoryToken(Aid));
		const aidDistributionRepo = app.get<Repository<AidDistribution>>(getRepositoryToken(AidDistribution));
		const depositRepo = app.get<Repository<Deposit>>(getRepositoryToken(Deposit));
		const statsService = app.get(StatsService);

		const { admin, employees } = await seedUsers(userRepo, defaultConfig.employeeCount);
		const deposits = await seedDeposits(depositRepo, defaultConfig.depositCount);
		const aids = await seedAids(aidRepo, depositRepo, deposits, defaultConfig.aidCount);
		const families = await seedFamilies(familyRepo, locationRepo, defaultConfig.familyCount);
		const { visits, totalDistributions } = await seedVisits({
			visitRepo,
			aidDistributionRepo,
			aids,
			families,
			employees,
			pastVisitCount: defaultConfig.pastVisitCount,
			futureVisitCount: defaultConfig.futureVisitCount,
		});

		await Promise.all(deposits.map((deposit) => statsService.recordDepositSnapshot(deposit.id)));

		await assignCurrentVisits(userRepo, employees, visits);

		console.log('Synthetic data ready!');
		console.table({
			admin: admin.email,
			employees: employees.length,
			deposits: deposits.length,
			families: families.length,
			visits: visits.length,
			upcomingVisits: visits.filter((v) => !v.isCompleted).length,
			aids: aids.length,
			aidDistributions: totalDistributions,
			defaultPassword: seedPassword,
		});
	} catch (err) {
		console.error('Failed to seed fake data:', err);
		process.exitCode = 1;
	} finally {
		await app.close();
	}
}

async function seedUsers(userRepo: Repository<User>, employeeCount: number) {
	const adminProfile = buildUserProfile({
		role: UserRole.ADMIN,
		email: 'admin@demo.local',
	});
	const admin = await upsertUser(userRepo, adminProfile);

	const employees: User[] = [];
	for (let i = 0; i < employeeCount; i++) {
		const employeeProfile = buildUserProfile({
			role: UserRole.EMPLOYEE,
			email: `employee${i + 1}@demo.local`,
		});
		const employee = await upsertUser(userRepo, employeeProfile);
		employees.push(employee);
	}

	return { admin, employees };
}

function buildUserProfile({ role, email }: { role: UserRole; email: string }) {
	return {
		name: faker.person.fullName(),
		email,
		phone: faker.helpers.replaceSymbols('+961-##-###-###'),
		role,
	};
}

async function upsertUser(userRepo: Repository<User>, profile: { name: string; email: string; phone: string; role: UserRole }) {
	let user = await userRepo.findOne({ where: { email: profile.email } });
	const { salt, password } = await hashPassword(seedPassword);
	if (!user) {
		user = userRepo.create({
			...profile,
			password,
			salt,
			isEmailValidated: true,
		});
	} else {
		user.name = profile.name;
		user.phone = profile.phone;
		user.role = profile.role;
		user.password = password;
		user.salt = salt;
		user.isEmailValidated = true;
	}
	return userRepo.save(user);
}

async function hashPassword(plain: string) {
	const salt = await bcrypt.genSalt();
	const password = await bcrypt.hash(plain, salt);
	return { salt, password };
}

async function seedDeposits(depositRepo: Repository<Deposit>, desiredCount: number) {
	const presets = [...depositPresets];
	while (presets.length < desiredCount) {
		const city = faker.helpers.arrayElement(cityPresets);
		presets.push({
			name: `${city.city} Reserve Depot ${presets.length + 1}`,
			city: city.city,
			region: city.region,
			capacity: faker.number.int({ min: 1000, max: 2200 }),
			isRefrigerated: faker.datatype.boolean({ probability: 0.5 }),
			humidityLevel: faker.helpers.arrayElement(Object.values(HumidityLevel)),
			minTemperatureC: faker.number.int({ min: -5, max: 10 }),
			maxTemperatureC: faker.number.int({ min: 15, max: 40 }),
		});
	}

	const selected = presets.slice(0, desiredCount);
	const deposits = selected.map((preset) => {
		const geo = faker.helpers.arrayElement(cityPresets);
		return depositRepo.create({
			...preset,
			address: faker.location.streetAddress(),
			latitude: jitterCoordinate(geo.latitude),
			longitude: jitterCoordinate(geo.longitude),
			containerImageUrl: faker.image.urlPicsumPhotos({ width: 640, height: 360 }),
			currentQuantity: 0,
		});
	});

	return depositRepo.save(deposits);
}

type AidRequirement = {
	requiresRefrigeration: boolean;
	requiredHumidityLevel: HumidityLevel | null;
	requiredMinTemperatureC: number | null;
	requiredMaxTemperatureC: number | null;
};

async function seedAids(
	aidRepo: Repository<Aid>,
	depositRepo: Repository<Deposit>,
	deposits: Deposit[],
	count: number,
) {
	const usageMap = new Map<string, number>();
	const aids: Aid[] = [];

	for (let i = 0; i < count; i++) {
		const type = faker.helpers.arrayElement(Object.values(AidType));
		const quantity = faker.number.int({ min: 120, max: 420 });
		const requirements = buildAidRequirement(type);
		const deposit = pickCompatibleDeposit(deposits, usageMap, requirements, quantity);
		const aid = aidRepo.create({
			name: `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${faker.commerce.product().replace(/\s+/g, ' ')} Kit`,
			type,
			description: faker.commerce.productDescription(),
			quantity,
			requiredMinTemperatureC: requirements.requiredMinTemperatureC,
			requiredMaxTemperatureC: requirements.requiredMaxTemperatureC,
			requiredHumidityLevel: requirements.requiredHumidityLevel,
			requiresRefrigeration: requirements.requiresRefrigeration,
			deposit,
		});
		aids.push(aid);
		usageMap.set(deposit.id, (usageMap.get(deposit.id) ?? 0) + quantity);
	}

	const savedAids = await aidRepo.save(aids);

	for (const deposit of deposits) {
		const used = usageMap.get(deposit.id) ?? 0;
		deposit.currentQuantity = Math.min(used, deposit.capacity);
		await depositRepo.save(deposit);
	}

	return savedAids;
}

function buildAidRequirement(type: AidType): AidRequirement {
	switch (type) {
		case AidType.MEDICINE:
			return {
				requiresRefrigeration: true,
				requiredHumidityLevel: HumidityLevel.LOW,
				requiredMinTemperatureC: 2,
				requiredMaxTemperatureC: 8,
			};
		case AidType.FOOD:
			return {
				requiresRefrigeration: false,
				requiredHumidityLevel: HumidityLevel.MEDIUM,
				requiredMinTemperatureC: 5,
				requiredMaxTemperatureC: 30,
			};
		case AidType.SOCIAL:
		case AidType.FINANCIAL:
		case AidType.OTHER:
		default:
			return {
				requiresRefrigeration: false,
				requiredHumidityLevel: null,
				requiredMinTemperatureC: null,
				requiredMaxTemperatureC: null,
			};
	}
}

function pickCompatibleDeposit(
	deposits: Deposit[],
	usage: Map<string, number>,
	requirements: AidRequirement,
	quantity: number,
) {
	const capacityMatches = deposits.filter((deposit) => {
		if (!depositSupportsRequirement(deposit, requirements)) {
			return false;
		}
		const remaining = deposit.capacity - (usage.get(deposit.id) ?? 0);
		return remaining >= quantity;
	});
	if (capacityMatches.length > 0) {
		return faker.helpers.arrayElement(capacityMatches);
	}

	const requirementMatches = deposits.filter((deposit) => depositSupportsRequirement(deposit, requirements));
	if (requirementMatches.length > 0) {
		return faker.helpers.arrayElement(requirementMatches);
	}

	return faker.helpers.arrayElement(deposits);
}

function depositSupportsRequirement(deposit: Deposit, requirements: AidRequirement) {
	if (requirements.requiresRefrigeration && !deposit.isRefrigerated) {
		return false;
	}
	if (requirements.requiredHumidityLevel && deposit.humidityLevel !== requirements.requiredHumidityLevel) {
		return false;
	}
	if (
		requirements.requiredMinTemperatureC != null &&
		(deposit.minTemperatureC == null || deposit.minTemperatureC > requirements.requiredMinTemperatureC)
	) {
		return false;
	}
	if (
		requirements.requiredMaxTemperatureC != null &&
		(deposit.maxTemperatureC == null || deposit.maxTemperatureC < requirements.requiredMaxTemperatureC)
	) {
		return false;
	}
	return true;
}

async function seedFamilies(
	familyRepo: Repository<Family>,
	locationRepo: Repository<Location>,
	count: number,
) {
	const families: Family[] = [];
	for (let i = 0; i < count; i++) {
		const family = familyRepo.create({
			lastName: faker.person.lastName(),
			phone: faker.helpers.replaceSymbols('+961-7#-###-###'),
			address: faker.location.streetAddress(),
			numberOfMembers: faker.number.int({ min: 2, max: 9 }),
			containsDisabledMember: faker.datatype.boolean({ probability: 0.25 }),
			containsElderlyMember: faker.datatype.boolean({ probability: 0.4 }),
			containspupilMember: faker.datatype.boolean({ probability: 0.55 }),
			notes: faker.lorem.sentence(),
		});
		const savedFamily = await familyRepo.save(family);

		const preset = faker.helpers.arrayElement(cityPresets);
		const location = locationRepo.create({
			latitude: jitterCoordinate(preset.latitude),
			longitude: jitterCoordinate(preset.longitude),
			city: preset.city,
			region: preset.region,
			description: `${faker.location.streetAddress()} - ${faker.location.secondaryAddress()}`,
			family: savedFamily,
		});
		const savedLocation = await locationRepo.save(location);
		savedFamily.location = savedLocation;
		families.push(savedFamily);
	}
	return families;
}

function jitterCoordinate(base: number) {
	const offset = faker.number.int({ min: -40, max: 40 }) / 1000;
	return Number((base + offset).toFixed(6));
}

function randomFutureDate(maxMonthsAhead: number) {
	const now = new Date();
	const upperBound = addMonths(now, maxMonthsAhead);
	return faker.date.between({ from: now, to: upperBound });
}

function randomPastDate(maxMonthsBack: number) {
	const now = new Date();
	const lowerBound = addMonths(now, -maxMonthsBack);
	return faker.date.between({ from: lowerBound, to: now });
}

function addMonths(base: Date, delta: number) {
	const result = new Date(base);
	result.setMonth(result.getMonth() + delta);
	return result;
}

interface VisitSeedParams {
	visitRepo: Repository<Visit>;
	aidDistributionRepo: Repository<AidDistribution>;
	aids: Aid[];
	families: Family[];
	employees: User[];
	pastVisitCount: number;
	futureVisitCount: number;
}

async function seedVisits({
	visitRepo,
	aidDistributionRepo,
	aids,
	families,
	employees,
	pastVisitCount,
	futureVisitCount,
}: VisitSeedParams) {
	const visits: Visit[] = [];
	let totalDistributions = 0;

	const createVisits = async (count: number, inPast: boolean) => {
		for (let i = 0; i < count; i++) {
			const anchorFamily = faker.helpers.arrayElement(families);
			const baseCity = anchorFamily.location
				? {
					city: anchorFamily.location.city ?? faker.location.city(),
					region: anchorFamily.location.region ?? faker.location.state(),
					latitude: anchorFamily.location.latitude,
					longitude: anchorFamily.location.longitude,
				}
				: faker.helpers.arrayElement(cityPresets);

			const startDate = inPast
				? randomPastDate(12)
				: randomFutureDate(3);
			const durationHours = faker.number.int({ min: 2, max: 6 });
			const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
			const visit = visitRepo.create({
				startDate,
				endDate,
				latitude: jitterCoordinate(baseCity.latitude),
				longitude: jitterCoordinate(baseCity.longitude),
				city: baseCity.city,
				region: baseCity.region,
				isActive: !inPast && faker.datatype.boolean({ probability: 0.7 }),
				isCompleted: inPast,
				notes: faker.lorem.paragraph(),
				statsComputed: inPast,
				families: pickRandomSubset(families, 2, 5),
				users: pickRandomSubset(employees, 1, Math.min(3, employees.length)),
			});

			const savedVisit = await visitRepo.save(visit);
			visits.push(savedVisit);
			totalDistributions += await createAidDistributionsForVisit({
				aidDistributionRepo,
				visit: savedVisit,
				aids,
			});
		}
	};

	await createVisits(pastVisitCount, true);
	await createVisits(futureVisitCount, false);

	return { visits, totalDistributions };
}

function pickRandomSubset<T>(items: T[], min: number, max: number): T[] {
	if (!items.length) {
		return [];
	}
	const safeMax = Math.min(Math.max(min, max), items.length);
	const safeMin = Math.min(min, safeMax);
	const count = faker.number.int({ min: Math.max(1, safeMin), max: Math.max(1, safeMax) });
	return faker.helpers.arrayElements(items, count);
}

async function createAidDistributionsForVisit({
	aidDistributionRepo,
	visit,
	aids,
}: {
	aidDistributionRepo: Repository<AidDistribution>;
	visit: Visit;
	aids: Aid[];
}) {
	const distributionCount = faker.number.int({ min: 6, max: 15 });
	const distributions = Array.from({ length: distributionCount }).map(() => {
		const aid = faker.helpers.arrayElement(aids);
		return aidDistributionRepo.create({
			visit,
			aid,
			quantity: faker.number.int({ min: 5, max: 250 }),
			unit: faker.helpers.arrayElement(unitOptions),
			notes: faker.commerce.productDescription(),
			sourceDeposit: aid.deposit ?? null,
		});
	});
	await aidDistributionRepo.save(distributions);
	return distributionCount;
}

async function assignCurrentVisits(userRepo: Repository<User>, employees: User[], visits: Visit[]) {
	const futureVisits = visits.filter((visit) => !visit.isCompleted);
	if (!futureVisits.length) {
		return;
	}
	for (let i = 0; i < employees.length; i++) {
		employees[i].currentVisit = futureVisits[i % futureVisits.length];
	}
	await userRepo.save(employees);
}

function readNumericEnv(key: string, fallback: number) {
	const value = Number(process.env[key]);
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

main().catch((err) => {
	console.error('Unexpected error while seeding data:', err);
	process.exit(1);
});
