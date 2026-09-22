import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user/entities/user.entity';
import { Family } from './family/entities/family.entity';
import { FamilyNeed, NeedCategory } from './family/entities/family-need.entity';
import { Aid } from './aid/entities/aid.entity';
import { AidType } from './aid/aid.types';
import { Visit } from './visit/entities/visit.entity';
import { AidDistribution } from './aid-distribution/entities/aid-distribution.entity';
import { News } from './news/entities/news.entity';
import { Location } from './location/entities/location.entity';
import { Task } from './task/entities/task.entity';
import { Deposit, HumidityLevel } from './deposit/entities/deposit.entity';
import { VisitAidStat } from './dashboard/entities/visit-aid-stat.entity';
import dataSource from './data-source';

const DAY = 86_400_000;
const RESET = process.argv.includes('--reset');

const SEED_USERS = [
  {
    name: 'Leila Mansour',
    email: 'admin@omnia.org',
    password: 'Admin123!',
    role: UserRole.ADMIN,
    phone: '+216-71-123-001',
  },
  {
    name: 'Ahmed Ben Youssef',
    email: 'worker@omnia.org',
    password: 'Worker123!',
    role: UserRole.EMPLOYEE,
    phone: '+216-98-221-104',
  },
  {
    name: 'Sarra Trabelsi',
    email: 'sarah@omnia.org',
    password: 'Worker123!',
    role: UserRole.EMPLOYEE,
    phone: '+216-97-334-218',
  },
  {
    name: 'Karim Haddad',
    email: 'user@omnia.org',
    password: 'User123!',
    role: UserRole.USER,
    phone: '+216-22-445-330',
  },
];

const CITIES = [
  { city: 'Tunis', region: 'Grand Tunis', lat: 36.8065, lng: 10.1815 },
  { city: 'Le Bardo', region: 'Grand Tunis', lat: 36.8097, lng: 10.134 },
  { city: 'Ariana', region: 'Grand Tunis', lat: 36.8625, lng: 10.1956 },
  { city: 'La Manouba', region: 'Grand Tunis', lat: 36.8081, lng: 10.0972 },
  { city: 'Ben Arous', region: 'Grand Tunis', lat: 36.7533, lng: 10.2217 },
  { city: 'La Marsa', region: 'Grand Tunis', lat: 36.8892, lng: 10.3248 },
  { city: 'Carthage', region: 'Grand Tunis', lat: 36.8529, lng: 10.3236 },
  { city: 'Nabeul', region: 'Cap Bon', lat: 36.4513, lng: 10.7357 },
  { city: 'Hammamet', region: 'Cap Bon', lat: 36.4, lng: 10.6167 },
  { city: 'Bizerte', region: 'Nord', lat: 37.2744, lng: 9.8739 },
  { city: 'Béja', region: 'Nord-Ouest', lat: 36.7256, lng: 9.1817 },
  { city: 'Sousse', region: 'Sahel', lat: 35.8256, lng: 10.6369 },
  { city: 'Monastir', region: 'Sahel', lat: 35.778, lng: 10.8262 },
  { city: 'Kairouan', region: 'Centre', lat: 35.6781, lng: 10.0963 },
  { city: 'Sfax', region: 'Sud-Est', lat: 34.7406, lng: 10.7603 },
  { city: 'Gabès', region: 'Sud-Est', lat: 33.8815, lng: 10.0982 },
  { city: 'Médenine', region: 'Sud-Est', lat: 33.3547, lng: 10.5054 },
  { city: 'Djerba', region: 'Sud-Est', lat: 33.8076, lng: 10.8458 },
  { city: 'Gafsa', region: 'Sud-Ouest', lat: 34.425, lng: 8.7842 },
  { city: 'Tozeur', region: 'Sud-Ouest', lat: 33.9197, lng: 8.1335 },
];

const FAMILY_DATA = [
  { lastName: 'Ben Ali', address: '12 Rue El Jazira, Médina', members: 7, phone: '98765432', disabled: true, elderly: true, pupil: true, notes: 'Famille très précaire, mère veuve. Besoin urgent en denrées et médicaments.' },
  { lastName: 'Trabelsi', address: '45 Avenue Habib Bourguiba', members: 5, phone: '97654321', disabled: false, elderly: true, pupil: true, notes: 'Grand-mère seule avec petits-enfants le jour.' },
  { lastName: 'Gharbi', address: '8 Rue du Commerce', members: 6, phone: '96543210', disabled: true, elderly: false, pupil: true, notes: 'Père en situation de handicap, suivi médical régulier.' },
  { lastName: 'Masmoudi', address: 'Cité El Omrane, immeuble B', members: 4, phone: '95432109', disabled: false, elderly: true, pupil: false, notes: 'Couple âgé, loyer en retard.' },
  { lastName: 'Karray', address: '22 Rue Sidi Bou Said', members: 3, phone: '94321098', disabled: false, elderly: false, pupil: true, notes: 'Un enfant en primaire, revenus instables.' },
  { lastName: 'Jebali', address: 'Cité Ibn Khaldoun, bloc 14', members: 8, phone: '93210987', disabled: true, elderly: true, pupil: true, notes: 'Famille nombreuse, plusieurs handicaps. Priorité élevée.' },
  { lastName: 'Haddad', address: '3 Rue El Khaldounia', members: 2, phone: '92109876', disabled: false, elderly: true, pupil: false, notes: 'Couple retraité, isolation hivernale insuffisante.' },
  { lastName: 'Sahli', address: 'Cité Ennasr 2', members: 6, phone: '91098765', disabled: true, elderly: false, pupil: true, notes: 'Père en situation de handicap, mère sans emploi.' },
  { lastName: 'Bouazizi', address: '18 Rue El Horria', members: 5, phone: '90987654', disabled: false, elderly: true, pupil: true, notes: 'Logement insalubre, humidité importante.' },
  { lastName: 'Chaabane', address: 'Quartier Sidi Mansour', members: 4, phone: '22334455', disabled: false, elderly: false, pupil: true, notes: 'Rentrée scolaire à financer.' },
  { lastName: 'Dridi', address: '67 Avenue de la Liberté', members: 7, phone: '22445566', disabled: true, elderly: true, pupil: true, notes: 'Situation critique, logement insalubre.' },
  { lastName: 'Ferchichi', address: '9 Rue El Fath', members: 3, phone: '22556677', disabled: false, elderly: true, pupil: false, notes: 'Besoins médicaux chroniques.' },
  { lastName: 'Guesmi', address: 'Cité El Intilaka', members: 6, phone: '22667788', disabled: false, elderly: false, pupil: true, notes: 'Trois enfants scolarisés.' },
  { lastName: 'Hammami', address: '14 Rue des Artisans', members: 5, phone: '22778899', disabled: true, elderly: false, pupil: true, notes: 'Famille nouvellement accompagnée.' },
  { lastName: 'Khelifi', address: 'Avenue Farhat Hached', members: 4, phone: '22889900', disabled: false, elderly: true, pupil: false, notes: 'Aide au loyer demandée.' },
  { lastName: 'Laroussi', address: 'Cité Ezzouhour, maison 22', members: 9, phone: '22990011', disabled: true, elderly: true, pupil: true, notes: 'Plus grande famille accompagnée, besoins multiples.' },
  { lastName: 'Mejri', address: '5 Rue El Monastiri', members: 3, phone: '23001122', disabled: false, elderly: false, pupil: true, notes: 'Kit scolaire pour le collège.' },
  { lastName: 'Nouri', address: 'Quartier Bab Souika', members: 5, phone: '23112233', disabled: false, elderly: true, pupil: true, notes: 'Grand-père à charge.' },
  { lastName: 'Oueslati', address: 'Rue de la République', members: 4, phone: '23223344', disabled: true, elderly: false, pupil: false, notes: 'Suivi diabète et hypertension.' },
  { lastName: 'Riahi', address: 'Cité El Amel', members: 2, phone: '23334455', disabled: false, elderly: false, pupil: false, notes: 'Jeune couple, emploi précaire.' },
  { lastName: 'Slimane', address: 'Avenue 14 Janvier', members: 6, phone: '23445566', disabled: false, elderly: true, pupil: true, notes: 'Besoins alimentaires hebdomadaires.' },
  { lastName: 'Tounsi', address: 'Rue des Palmiers', members: 8, phone: '23556677', disabled: true, elderly: false, pupil: true, notes: 'Deux enfants en situation de handicap.' },
  { lastName: 'Yahyaoui', address: 'Quartier El Medina', members: 3, phone: '23667788', disabled: false, elderly: true, pupil: false, notes: 'Veuf, mobilité réduite.' },
  { lastName: 'Zoghlami', address: 'Cité Olympique', members: 5, phone: '23778899', disabled: false, elderly: false, pupil: true, notes: 'Aide scolaire et hygiène.' },
];

const AID_DATA: Array<{
  name: string;
  type: AidType;
  description: string;
  quantity: number;
  refrigeration?: boolean;
}> = [
  { name: 'Colis Alimentaire Ramadan', type: AidType.FOOD, description: 'Huile, sucre, farine, lait, dattes pour le mois sacré', quantity: 420 },
  { name: 'Panier Hebdomadaire', type: AidType.FOOD, description: 'Fruits, légumes et protéines pour une semaine', quantity: 280 },
  { name: 'Kit Médicaments Essentiels', type: AidType.MEDICINE, description: 'Paracétamol, antibiotiques de base, pansements', quantity: 160, refrigeration: true },
  { name: 'Kit Diabète', type: AidType.MEDICINE, description: 'Insuline, bandelettes de test, seringues', quantity: 90, refrigeration: true },
  { name: 'Aide Scolaire Complète', type: AidType.SOCIAL, description: 'Cartable, cahiers, stylos, livres scolaires', quantity: 210 },
  { name: 'Fournitures Universitaires', type: AidType.SOCIAL, description: 'Classeur, calculatrice, livres techniques', quantity: 75 },
  { name: 'Couvertures Hiver', type: AidType.OTHER, description: 'Couvertures polaires et vêtements chauds', quantity: 190 },
  { name: 'Kit Hygiène', type: AidType.OTHER, description: 'Savon, dentifrice, protections hygiéniques, couches', quantity: 240 },
  { name: 'Aide Financière Urgente', type: AidType.FINANCIAL, description: 'Soutien ponctuel pour loyer ou factures', quantity: 50 },
  { name: 'Aide au Loyer', type: AidType.FINANCIAL, description: 'Prise en charge partielle du loyer mensuel', quantity: 40 },
  { name: 'Aide Électroménager', type: AidType.OTHER, description: 'Réfrigérateur, cuisinière, machine à laver', quantity: 18 },
  { name: 'Soutien Psychologique', type: AidType.SOCIAL, description: 'Séances avec psychologue pour enfants et adultes', quantity: 60 },
];

const VISIT_NOTES = [
  'Distribution réussie, famille très reconnaissante.',
  'Besoin médical identifié, suivi prévu la semaine prochaine.',
  'Famille stable, aucun nouveau besoin détecté.',
  'Urgence alimentaire, nouvelle distribution planifiée.',
  'Enfant scolarisé grâce au kit scolaire, résultats encourageants.',
  'Situation améliorée depuis la dernière visite.',
  'Besoin de renouvellement des médicaments chroniques.',
  'Logement amélioré grâce à l’aide financière.',
  'Famille en deuil, soutien psychologique fourni.',
  'Nouveau-né identifié, besoins en couches et lait.',
];

const NEWS_ITEMS = [
  'Lancement de la campagne Ramadan 2026 — 500 colis alimentaires prévus pour les familles les plus vulnérables.',
  'Nouveau partenariat avec la clinique du Sahel pour les soins médicaux gratuits aux familles accompagnées.',
  'Recrutement de 10 nouveaux bénévoles — rejoignez notre équipe de terrain !',
  'Bilan positif du premier semestre : 24 familles accompagnées, 40 visites réalisées, 95% de taux de satisfaction.',
  'Inauguration du nouveau dépôt de stockage à Sfax pour améliorer la logistique sud du pays.',
  'Ouverture d’un point d’écoute à Kairouan pour le suivi psychosocial.',
  'Collecte hivernale : 190 couvertures déjà distribuées dans le Nord-Ouest.',
  'Mise en ligne du tableau de bord public de traçabilité des dons.',
];

const TASKS = [
  { title: 'Valider les colis Ramadan du dépôt de Tunis', completed: false },
  { title: 'Mettre à jour les scores de vulnérabilité du Grand Tunis', completed: true },
  { title: 'Planifier la tournée Sfax — Gabès', completed: false },
  { title: 'Relancer les bénévoles pour la visite de Kairouan', completed: false },
  { title: 'Archiver les distributions du mois précédent', completed: true },
  { title: 'Préparer le kit scolaire de la rentrée', completed: false },
];

type Repos = {
  user: Repository<User>;
  family: Repository<Family>;
  familyNeed: Repository<FamilyNeed>;
  location: Repository<Location>;
  aid: Repository<Aid>;
  visit: Repository<Visit>;
  dist: Repository<AidDistribution>;
  news: Repository<News>;
  task: Repository<Task>;
  deposit: Repository<Deposit>;
  visitAidStat: Repository<VisitAidStat>;
};

async function seed() {
  const ds = dataSource as DataSource;
  await ds.initialize();
  const opts = ds.options as { host?: string; port?: number; database?: string; username?: string };
  console.log(`Connexion MySQL ${opts.username}@${opts.host}:${opts.port}/${opts.database}`);
  await ensureCompatibleSchema(ds);

  const repos: Repos = {
    user: ds.getRepository(User),
    family: ds.getRepository(Family),
    familyNeed: ds.getRepository(FamilyNeed),
    location: ds.getRepository(Location),
    aid: ds.getRepository(Aid),
    visit: ds.getRepository(Visit),
    dist: ds.getRepository(AidDistribution),
    news: ds.getRepository(News),
    task: ds.getRepository(Task),
    deposit: ds.getRepository(Deposit),
    visitAidStat: ds.getRepository(VisitAidStat),
  };

  if (RESET) {
    await resetSeededTables(ds);
    console.log('Base vidée — reseed en cours.');
  }

  const users = await seedUsers(repos.user);
  const admin = users.find((u) => u.role === UserRole.ADMIN)!;
  const workers = users.filter((u) => u.role === UserRole.EMPLOYEE);
  const donor = users.find((u) => u.role === UserRole.USER)!;

  const deposits = await seedDeposits(repos.deposit);
  const aids = await seedAids(repos.aid, deposits);
  const families = await seedFamilies(repos);
  const visits = await seedVisits(repos.visit, families, workers);
  await seedDistributions(repos, visits, aids, deposits);
  await seedVisitAidStats(repos);
  await seedNews(repos.news);
  await seedTasks(repos.task);

  console.log('\nSeed terminé avec succès.\n');
  console.table({
    admin: `${admin.email} / Admin123!`,
    worker: `worker@omnia.org / Worker123!`,
    donor: `${donor.email} / User123!`,
    families: families.length,
    visits: visits.length,
    aids: aids.length,
    deposits: deposits.length,
  });
  console.log('Reset: npm run seed:reset');

  await ds.destroy();
}

async function columnExists(ds: DataSource, table: string, column: string) {
  const rows: Array<Record<string, string>> = await ds.query(
    `SHOW COLUMNS FROM \`${table}\` LIKE ?`,
    [column],
  );
  return rows.length > 0;
}

async function ensureCompatibleSchema(ds: DataSource) {
  const existing = await tableNames(ds);

  await addColumnIfMissing(ds, 'user', 'isActive', 'tinyint NOT NULL DEFAULT 1');
  await addColumnIfMissing(ds, 'user', 'isEmailValidated', 'tinyint NOT NULL DEFAULT 0');
  await addColumnIfMissing(ds, 'user', 'createdAt', 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
  await addColumnIfMissing(ds, 'user', 'deletedAt', 'datetime(6) NULL');
  await addColumnIfMissing(ds, 'user', 'currentVisitId', 'varchar(36) NULL');

  await addColumnIfMissing(ds, 'family', 'vulnerabilityScore', 'int NOT NULL DEFAULT 0');
  await addColumnIfMissing(ds, 'family', 'createdAt', 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
  await addColumnIfMissing(ds, 'family', 'deletedAt', 'datetime(6) NULL');
  await addColumnIfMissing(ds, 'family', 'address', 'varchar(255) NULL');

  await addColumnIfMissing(ds, 'location', 'createdAt', 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
  await addColumnIfMissing(ds, 'location', 'deletedAt', 'datetime(6) NULL');

  await addColumnIfMissing(ds, 'aid', 'quantity', 'int NOT NULL DEFAULT 0');
  await addColumnIfMissing(ds, 'aid', 'requiredMinTemperatureC', 'double NULL');
  await addColumnIfMissing(ds, 'aid', 'requiredMaxTemperatureC', 'double NULL');
  await addColumnIfMissing(ds, 'aid', 'requiredHumidityLevel', "enum('LOW','MEDIUM','HIGH') NULL");
  await addColumnIfMissing(ds, 'aid', 'requiresRefrigeration', 'tinyint NOT NULL DEFAULT 0');
  await addColumnIfMissing(ds, 'aid', 'depositId', 'varchar(36) NULL');
  await addColumnIfMissing(ds, 'aid', 'createdAt', 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
  await addColumnIfMissing(ds, 'aid', 'deletedAt', 'datetime(6) NULL');

  await addColumnIfMissing(ds, 'aid_distribution', 'date', 'datetime NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await addColumnIfMissing(ds, 'aid_distribution', 'sourceDepositId', 'varchar(36) NULL');
  await addColumnIfMissing(ds, 'aid_distribution', 'createdAt', 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
  await addColumnIfMissing(ds, 'aid_distribution', 'deletedAt', 'datetime(6) NULL');

  await addColumnIfMissing(ds, 'visit', 'latitude', 'double NULL');
  await addColumnIfMissing(ds, 'visit', 'longitude', 'double NULL');
  await addColumnIfMissing(ds, 'visit', 'region', 'varchar(255) NULL');
  await addColumnIfMissing(ds, 'visit', 'city', 'varchar(255) NULL');
  await addColumnIfMissing(ds, 'visit', 'statsComputed', 'tinyint NOT NULL DEFAULT 0');
  await addColumnIfMissing(ds, 'visit', 'deletedAt', 'datetime(6) NULL');

  if (!existing.has('deposit')) {
    await ds.query(`
      CREATE TABLE \`deposit\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`address\` varchar(255) NULL,
        \`city\` varchar(120) NULL,
        \`region\` varchar(120) NULL,
        \`latitude\` double NULL,
        \`longitude\` double NULL,
        \`capacity\` int NOT NULL DEFAULT 0,
        \`currentQuantity\` int NOT NULL DEFAULT 0,
        \`minTemperatureC\` double NULL,
        \`maxTemperatureC\` double NULL,
        \`humidityLevel\` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
        \`isRefrigerated\` tinyint NOT NULL DEFAULT 0,
        \`containerImageUrl\` varchar(512) NULL,
        \`capabilities\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  if (!existing.has('family_need')) {
    await ds.query(`
      CREATE TABLE \`family_need\` (
        \`id\` varchar(36) NOT NULL,
        \`category\` enum('FOOD','SHELTER','EDUCATION','MEDICAL','FINANCIAL','EMPLOYMENT','OTHER') NOT NULL,
        \`priority\` int NOT NULL DEFAULT 1,
        \`notes\` text NULL,
        \`lastReviewedAt\` datetime NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`familyId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  if (!existing.has('visit_aid_stat')) {
    await ds.query(`
      CREATE TABLE \`visit_aid_stat\` (
        \`id\` varchar(36) NOT NULL,
        \`aidType\` enum('FOOD','MEDICINE','FINANCIAL','SOCIAL','OTHER') NOT NULL,
        \`totalQuantity\` int NOT NULL DEFAULT 0,
        \`distributionCount\` int NOT NULL DEFAULT 0,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`visitId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  if (!existing.has('visit_families_family')) {
    await ds.query(`
      CREATE TABLE \`visit_families_family\` (
        \`visitId\` varchar(36) NOT NULL,
        \`familyId\` varchar(36) NOT NULL,
        INDEX \`IDX_visit_families_visit\` (\`visitId\`),
        INDEX \`IDX_visit_families_family\` (\`familyId\`),
        PRIMARY KEY (\`visitId\`, \`familyId\`)
      ) ENGINE=InnoDB
    `);
  }

  if (!existing.has('visit_users_user')) {
    await ds.query(`
      CREATE TABLE \`visit_users_user\` (
        \`visitId\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NOT NULL,
        INDEX \`IDX_visit_users_visit\` (\`visitId\`),
        INDEX \`IDX_visit_users_user\` (\`userId\`),
        PRIMARY KEY (\`visitId\`, \`userId\`)
      ) ENGINE=InnoDB
    `);
  }
}

async function addColumnIfMissing(ds: DataSource, table: string, column: string, definition: string) {
  const existing = await tableNames(ds);
  if (!existing.has(table)) return;
  if (await columnExists(ds, table, column)) return;
  await ds.query(`ALTER TABLE \`${table}\` ADD \`${column}\` ${definition}`);
}
async function tableNames(ds: DataSource): Promise<Set<string>> {
  const rows: Array<Record<string, string>> = await ds.query('SHOW TABLES');
  const names = rows.map((row) => Object.values(row)[0]).filter(Boolean);
  return new Set(names);
}

async function resetSeededTables(ds: DataSource) {
  const existing = await tableNames(ds);
  const order = [
    'deposit_storage_stat',
    'visit_aid_stat',
    'aid_distribution',
    'family_need',
    'visit_families_family',
    'visit_users_user',
    'location',
    'family',
    'aid',
    'deposit',
    'news',
    'task',
    'visit',
    'user',
  ];

  await ds.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of order) {
    if (existing.has(table)) {
      await ds.query(`TRUNCATE TABLE \`${table}\``);
    }
  }
  await ds.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(plain, salt);
  return { salt, password };
}

async function seedUsers(userRepo: Repository<User>) {
  const saved: User[] = [];
  for (const profile of SEED_USERS) {
    const { salt, password } = await hashPassword(profile.password);
    const email = profile.email.trim().toLowerCase();
    let user = await userRepo.findOne({ where: { email } });
    if (!user) {
      user = userRepo.create({
        name: profile.name,
        email,
        phone: profile.phone,
        role: profile.role,
        password,
        salt,
        isActive: true,
        isEmailValidated: true,
      });
    } else {
      user.name = profile.name;
      user.phone = profile.phone;
      user.role = profile.role;
      user.password = password;
      user.salt = salt;
      user.isActive = true;
      user.isEmailValidated = true;
    }
    saved.push(await userRepo.save(user));
  }
  console.log(`${saved.length} utilisateurs (ADMIN / EMPLOYEE / USER)`);
  return saved;
}

async function seedDeposits(depositRepo: Repository<Deposit>) {
  const existing = await depositRepo.count();
  if (existing > 0) {
    const deposits = await depositRepo.find();
    console.log(`${deposits.length} dépôts existants`);
    return deposits;
  }

  const created = await depositRepo.save([
    depositRepo.create({
      name: 'Dépôt Central Tunis',
      description: 'Hub logistique du Grand Tunis',
      address: 'Zone industrielle Charguia',
      city: 'Tunis',
      region: 'Grand Tunis',
      latitude: 36.839,
      longitude: 10.204,
      capacity: 2500,
      currentQuantity: 980,
      isRefrigerated: true,
      humidityLevel: HumidityLevel.LOW,
      minTemperatureC: 2,
      maxTemperatureC: 8,
    }),
    depositRepo.create({
      name: 'Entrepôt Sahel Sousse',
      description: 'Couverture du Sahel',
      address: 'Route de Skanes',
      city: 'Sousse',
      region: 'Sahel',
      latitude: 35.836,
      longitude: 10.612,
      capacity: 1600,
      currentQuantity: 640,
      isRefrigerated: false,
      humidityLevel: HumidityLevel.MEDIUM,
      minTemperatureC: 8,
      maxTemperatureC: 28,
    }),
    depositRepo.create({
      name: 'Hub Sud Sfax',
      description: 'Logistique sud et sud-est',
      address: 'Sidi Mansour',
      city: 'Sfax',
      region: 'Sud-Est',
      latitude: 34.761,
      longitude: 10.76,
      capacity: 1900,
      currentQuantity: 720,
      isRefrigerated: true,
      humidityLevel: HumidityLevel.MEDIUM,
      minTemperatureC: 2,
      maxTemperatureC: 12,
    }),
  ]);
  console.log(`${created.length} dépôts créés`);
  return created;
}

async function seedAids(aidRepo: Repository<Aid>, deposits: Deposit[]) {
  const existing = await aidRepo.count();
  if (existing > 0) {
    const aids = await aidRepo.find({ relations: ['deposit'] });
    console.log(`${aids.length} aides existantes`);
    return aids;
  }

  const created: Aid[] = [];
  for (let i = 0; i < AID_DATA.length; i++) {
    const item = AID_DATA[i];
    const deposit = item.refrigeration
      ? deposits.find((d) => d.isRefrigerated) ?? deposits[0]
      : deposits[i % deposits.length];
    const aid = aidRepo.create({
      name: item.name,
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      requiresRefrigeration: !!item.refrigeration,
      requiredHumidityLevel: item.refrigeration ? HumidityLevel.LOW : HumidityLevel.MEDIUM,
      requiredMinTemperatureC: item.refrigeration ? 2 : null,
      requiredMaxTemperatureC: item.refrigeration ? 8 : null,
      deposit,
    });
    created.push(await aidRepo.save(aid));
  }
  console.log(`${created.length} aides créées`);
  return created;
}

function cityForIndex(i: number) {
  return CITIES[i % CITIES.length];
}

function jitter(base: number, i: number, axis: number) {
  const n = ((i * 17 + axis * 13) % 41) - 20;
  return Number((base + n / 1000).toFixed(6));
}

async function seedFamilies(repos: Repos) {
  const existing = await repos.family.count();
  if (existing > 0) {
    const families = await repos.family.find({ relations: ['location'] });
    console.log(`${families.length} familles existantes`);
    return families;
  }

  const created: Family[] = [];
  for (let i = 0; i < FAMILY_DATA.length; i++) {
    const f = FAMILY_DATA[i];
    const city = cityForIndex(i);
    const family = await repos.family.save(
      repos.family.create({
        lastName: f.lastName,
        address: `${f.address}, ${city.city}`,
        numberOfMembers: f.members,
        phone: f.phone,
        containsDisabledMember: f.disabled,
        containsElderlyMember: f.elderly,
        containspupilMember: f.pupil,
        notes: f.notes,
      }),
    );

    const location = await repos.location.save(
      repos.location.create({
        latitude: jitter(city.lat, i, 0),
        longitude: jitter(city.lng, i, 1),
        city: city.city,
        region: city.region,
        description: `Quartier résidentiel — ${city.city}`,
        family,
      }),
    );
    family.location = location;

    const needs = buildNeedsForFamily(f);
    await repos.familyNeed.save(
      needs.map((need) =>
        repos.familyNeed.create({
          family,
          category: need.category,
          priority: need.priority,
          notes: need.notes,
          lastReviewedAt: new Date(Date.now() - (i % 12) * DAY),
        }),
      ),
    );

    created.push(family);
  }
  console.log(`${created.length} familles + localisations + besoins`);
  return created;
}

function buildNeedsForFamily(f: (typeof FAMILY_DATA)[number]) {
  const needs: Array<{ category: NeedCategory; priority: number; notes: string }> = [
    { category: NeedCategory.FOOD, priority: f.members >= 6 ? 5 : 3, notes: 'Denrées de base' },
  ];
  if (f.disabled) {
    needs.push({ category: NeedCategory.MEDICAL, priority: 5, notes: 'Suivi handicap / médicaments' });
  }
  if (f.elderly) {
    needs.push({ category: NeedCategory.MEDICAL, priority: 4, notes: 'Soins chroniques' });
  }
  if (f.pupil) {
    needs.push({ category: NeedCategory.EDUCATION, priority: 4, notes: 'Fournitures scolaires' });
  }
  if (f.members >= 7) {
    needs.push({ category: NeedCategory.SHELTER, priority: 4, notes: 'Logement trop petit / insalubre' });
  }
  if (f.members <= 3 && !f.disabled) {
    needs.push({ category: NeedCategory.EMPLOYMENT, priority: 2, notes: 'Insertion professionnelle' });
  }
  return needs;
}

async function seedVisits(visitRepo: Repository<Visit>, families: Family[], workers: User[]) {
  const existing = await visitRepo.count();
  if (existing > 0) {
    const visits = await visitRepo.find({ relations: ['families', 'users'] });
    console.log(`${visits.length} visites existantes`);
    return visits;
  }

  const created: Visit[] = [];
  const worker = (i: number) => workers[i % workers.length];

  for (let i = 0; i < 28; i++) {
    const city = cityForIndex(i);
    const startDate = new Date(Date.now() - (28 - i) * 6 * DAY);
    const endDate = new Date(startDate.getTime() + 3 * 3600 * 1000);
    const visitFamilies = pickFamilies(families, i, (i % 3) + 1);
    const visit = visitRepo.create({
      startDate,
      endDate,
      latitude: jitter(city.lat, i, 2),
      longitude: jitter(city.lng, i, 3),
      city: city.city,
      region: city.region,
      isActive: false,
      isCompleted: true,
      statsComputed: false,
      notes: `[LIVRÉE] ${VISIT_NOTES[i % VISIT_NOTES.length]}`,
      families: visitFamilies,
      users: [worker(i)],
    });
    created.push(await visitRepo.save(visit));
  }

  for (let i = 0; i < 4; i++) {
    const city = cityForIndex(i + 3);
    const startDate = new Date(Date.now() - i * 2 * 3600 * 1000);
    const visitFamilies = pickFamilies(families, i + 8, 2);
    const visit = visitRepo.create({
      startDate,
      endDate: undefined,
      latitude: jitter(city.lat, i + 40, 2),
      longitude: jitter(city.lng, i + 40, 3),
      city: city.city,
      region: city.region,
      isActive: true,
      isCompleted: false,
      notes: `[EN COURS] Visite terrain en cours — ${city.city}.`,
      families: visitFamilies,
      users: [worker(i + 1)],
    });
    created.push(await visitRepo.save(visit));
  }

  for (let i = 0; i < 8; i++) {
    const city = cityForIndex(i + 10);
    const startDate = new Date(Date.now() + (i + 1) * 3 * DAY);
    const visitFamilies = pickFamilies(families, i + 12, 2);
    const visit = visitRepo.create({
      startDate,
      endDate: undefined,
      latitude: jitter(city.lat, i + 80, 2),
      longitude: jitter(city.lng, i + 80, 3),
      city: city.city,
      region: city.region,
      isActive: false,
      isCompleted: false,
      notes: `[PLANIFIÉE] Tournée ${city.city} — confirmation téléphonique reçue.`,
      families: visitFamilies,
      users: [worker(i)],
    });
    created.push(await visitRepo.save(visit));
  }

  console.log(`${created.length} visites (livrées / en cours / planifiées)`);
  return created;
}

function pickFamilies(families: Family[], seed: number, count: number) {
  const picked: Family[] = [];
  for (let j = 0; j < count; j++) {
    picked.push(families[(seed + j * 5) % families.length]);
  }
  return picked;
}

async function seedDistributions(
  repos: Repos,
  visits: Visit[],
  aids: Aid[],
  deposits: Deposit[],
) {
  const existing = await repos.dist.count();
  if (existing > 0) {
    console.log(`${existing} distributions existantes`);
    return;
  }

  let created = 0;
  for (let i = 0; i < visits.length; i++) {
    const visit = visits[i];
    const distCount = visit.isCompleted ? (i % 3) + 1 : 1;
    for (let j = 0; j < distCount; j++) {
      const aid = aids[(i + j) % aids.length];
      const status = visit.isCompleted ? 'LIVRÉE' : visit.isActive ? 'EN COURS' : 'PLANIFIÉE';
      const unit =
        aid.type === AidType.FOOD ? 'kg' : aid.type === AidType.FINANCIAL ? 'TND' : 'unités';
      await repos.dist.save(
        repos.dist.create({
          quantity: 4 + ((i * 3 + j) % 22),
          unit,
          notes: `Statut: ${status} — ${aid.name} pour visite ${visit.city ?? ''}`.trim(),
          aid,
          visit,
          sourceDeposit: aid.deposit ?? deposits[i % deposits.length],
        }),
      );
      created++;
    }
  }
  console.log(`${created} distributions (statuts via visites)`);
}

async function seedVisitAidStats(repos: Repos) {
  const existing = await repos.visitAidStat.count();
  if (existing > 0) {
    console.log(`${existing} stats de visite existantes`);
    return;
  }

  const completed = await repos.visit.find({
    where: { isCompleted: true },
    relations: ['aidDistributions', 'aidDistributions.aid'],
  });

  let created = 0;
  for (const visit of completed) {
    const totals = new Map<AidType, { quantity: number; count: number }>();
    for (const dist of visit.aidDistributions ?? []) {
      const type = dist.aid?.type ?? AidType.OTHER;
      const snap = totals.get(type) ?? { quantity: 0, count: 0 };
      snap.quantity += dist.quantity ?? 0;
      snap.count += 1;
      totals.set(type, snap);
    }
    for (const [aidType, data] of totals) {
      await repos.visitAidStat.save(
        repos.visitAidStat.create({
          visit,
          aidType,
          totalQuantity: data.quantity,
          distributionCount: data.count,
        }),
      );
      created++;
    }
    visit.statsComputed = true;
    await repos.visit.save(visit);
  }
  console.log(`${created} agrégats de visite`);
}

async function seedNews(newsRepo: Repository<News>) {
  const existing = await newsRepo.count();
  if (existing > 0) {
    console.log(`${existing} actualités existantes`);
    return;
  }
  await newsRepo.save(NEWS_ITEMS.map((content) => newsRepo.create({ content })));
  console.log(`${NEWS_ITEMS.length} actualités`);
}

async function seedTasks(taskRepo: Repository<Task>) {
  const existing = await taskRepo.count();
  if (existing > 0) {
    console.log(`${existing} tâches existantes`);
    return;
  }
  await taskRepo.save(TASKS.map((t) => taskRepo.create(t)));
  console.log(`${TASKS.length} tâches`);
}

seed().catch((err) => {
  console.error('Seed échoué :', err);
  process.exit(1);
});
