import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user/entities/user.entity';
import { Family } from './family/entities/family.entity';
import { Aid, AidType } from './aid/entities/aid.entity';
import { Visit } from './visit/entities/visit.entity';
import { AidDistribution } from './aid-distribution/entities/aid-distribution.entity';
import { News } from './news/entities/news.entity';
import { Location } from './location/entities/location.entity';
import dataSource from './data-source';

const DAY = 86400000;
const cities = [
  { city: 'Tunis', region: 'Grand Tunis', lat: 36.8065, lng: 10.1815 },
  { city: 'Le Bardo', region: 'Grand Tunis', lat: 36.8097, lng: 10.1340 },
  { city: 'Ariana', region: 'Grand Tunis', lat: 36.8615, lng: 10.1610 },
  { city: 'La Manouba', region: 'Grand Tunis', lat: 36.8446, lng: 10.1007 },
  { city: 'Ben Arous', region: 'Grand Tunis', lat: 36.7536, lng: 10.2313 },
  { city: 'Sfax', region: 'Sud-Est', lat: 34.7406, lng: 10.7603 },
  { city: 'Sousse', region: 'Sahel', lat: 35.8256, lng: 10.6369 },
  { city: 'Monastir', region: 'Sahel', lat: 35.7643, lng: 10.8113 },
  { city: 'Kairouan', region: 'Centre', lat: 35.6781, lng: 10.0963 },
  { city: 'Nabeul', region: 'Cap Bon', lat: 36.4561, lng: 10.7376 },
  { city: 'Hammamet', region: 'Cap Bon', lat: 36.4017, lng: 10.6154 },
  { city: 'Bizerte', region: 'Nord', lat: 37.2744, lng: 9.8739 },
  { city: 'Béja', region: 'Nord-Ouest', lat: 36.7317, lng: 9.1817 },
  { city: 'Gafsa', region: 'Sud-Ouest', lat: 34.4250, lng: 8.7842 },
  { city: 'Gabès', region: 'Sud-Est', lat: 33.8815, lng: 10.0982 },
  { city: 'Médenine', region: 'Sud-Est', lat: 33.3547, lng: 10.5054 },
  { city: 'Djerba', region: 'Sud-Est', lat: 33.8076, lng: 10.8458 },
  { city: 'Tozeur', region: 'Sud-Ouest', lat: 33.9194, lng: 8.1336 },
];

const familyData = [
  { lastName: 'Ben Ali', address: 'Rue El Jazira, Médina', members: 7, phone: '98765432', disabled: true, elderly: true, pupil: true, notes: 'Famille très précaire, mère veuve. Besoin urgent en denrées et médicaments.' },
  { lastName: 'Trabelsi', address: 'Avenue Habib Bourguiba', members: 5, phone: '97654321', disabled: false, elderly: true, pupil: true, notes: 'Grand-mère seule avec petits-enfants le jour.' },
  { lastName: 'Gharbi', address: 'Rue du Commerce', members: 6, phone: '96543210', disabled: true, elderly: false, pupil: true },
  { lastName: 'Masmoudi', address: 'Quartier El Omrane', members: 4, phone: '95432109', disabled: false, elderly: true, pupil: false },
  { lastName: 'Karray', address: 'Rue Sidi Bou Said', members: 3, phone: '94321098', disabled: false, elderly: false, pupil: true },
  { lastName: 'Jebali', address: 'Cité Ibn Khaldoun', members: 8, phone: '93210987', disabled: true, elderly: true, pupil: false, notes: 'Famille nombreuse, plusieurs handicaps. Priorité élevée.' },
  { lastName: 'Haddad', address: 'Rue El Khaldounia', members: 2, phone: '92109876', disabled: false, elderly: true, pupil: false },
  { lastName: 'Sahli', address: 'Cité Ennasr', members: 6, phone: '91098765', disabled: true, elderly: false, pupil: true, notes: 'Père en situation de handicap, mère sans emploi.' },
  { lastName: 'Bouazizi', address: 'Rue El Horria', members: 5, phone: '90987654', disabled: false, elderly: true, pupil: true },
  { lastName: 'Chaabane', address: 'Quartier Sidi Mansour', members: 4, phone: '22334455', disabled: false, elderly: false, pupil: true },
  { lastName: 'Dridi', address: 'Avenue de la Liberté', members: 7, phone: '22445566', disabled: true, elderly: true, pupil: true, notes: 'Situation critique, logement insalubre.' },
  { lastName: 'Ferchichi', address: 'Rue El Fath', members: 3, phone: '22556677', disabled: false, elderly: true, pupil: false },
  { lastName: 'Guesmi', address: 'Cité El Intilaka', members: 6, phone: '22667788', disabled: false, elderly: false, pupil: true },
  { lastName: 'Hammami', address: 'Rue des Artisans', members: 5, phone: '22778899', disabled: true, elderly: false, pupil: true, notes: 'Famille nouvellement accompagnée.' },
  { lastName: 'Khelifi', address: 'Avenue Farhat Hached', members: 4, phone: '22889900', disabled: false, elderly: true, pupil: false },
  { lastName: 'Laroussi', address: 'Cité Ezzouhour', members: 9, phone: '22990011', disabled: true, elderly: true, pupil: true, notes: 'Plus grande famille accompagnée, besoins multiples.' },
  { lastName: 'Mejri', address: 'Rue El Monastiri', members: 3, phone: '23001122', disabled: false, elderly: false, pupil: true },
  { lastName: 'Nouri', address: 'Quartier Bab Souika', members: 5, phone: '23112233', disabled: false, elderly: true, pupil: true },
];

const aidData = [
  { name: 'Colis Alimentaire Ramadan', type: AidType.FOOD, description: 'Denrées alimentaires de base pour le mois sacré : huile, sucre, farine, lait, dattes' },
  { name: 'Panier Hebdomadaire', type: AidType.FOOD, description: 'Fruits, légumes, protéines pour une semaine' },
  { name: 'Kit Médicaments Essentiels', type: AidType.MEDICINE, description: 'Paracétamol, antibiotiques de base, pansements, désinfectant' },
  { name: 'Kit Diabète', type: AidType.MEDICINE, description: 'Insuline, bandelettes de test, seringues' },
  { name: 'Aide Scolaire Complète', type: AidType.SOCIAL, description: 'Cartable, cahiers, stylos, livres scolaires' },
  { name: 'Fournitures Universitaires', type: AidType.SOCIAL, description: 'Classeur, calculatrice scientifique, livres techniques' },
  { name: 'Couvertures Hiver', type: AidType.OTHER, description: 'Couvertures polaires et vêtements chauds' },
  { name: 'Kit Hygiène', type: AidType.OTHER, description: 'Savon, dentifrice, protections hygiéniques, couches' },
  { name: 'Aide Financière Urgente', type: AidType.FINANCIAL, description: 'Soutien financier ponctuel pour loyer ou factures' },
  { name: 'Aide au Loyer', type: AidType.FINANCIAL, description: 'Prise en charge partielle du loyer mensuel' },
  { name: 'Aide Électroménager', type: AidType.OTHER, description: 'Réfrigérateur, cuisinière, machine à laver' },
  { name: 'Soutien Psychologique', type: AidType.SOCIAL, description: 'Séances avec psychologue pour enfants et adultes' },
];

const visitNotes = [
  'Distribution réussie, famille très reconnaissante.',
  'Besoin médical identifié, suivi prévu la semaine prochaine.',
  'Famille stable, aucun nouveau besoin détecté.',
  'Urgence alimentaire, nouvelle distribution planifiée.',
  'Enfant scolarisé grâce au kit scolaire, résultats encourageants.',
  'Situation améliorée depuis la dernière visite.',
  'Besoin de renouvellement des médicaments chroniques.',
  'Logement amélioré grâce à l\'aide financière.',
  'Famille en deuil, soutien psychologique fourni.',
  'Nouveau-né identifié, besoins en couches et lait.',
  'Visite en cours, évaluation en cours.',
  'Visite planifiée, confirmation par téléphone reçue.',
  'Famille absente lors du premier passage, RDV repris.',
  'Suivi post-Ramadan, bilan positif.',
  'Besoins scolaires pour la rentrée identifiés.',
];

async function seed() {
  const ds = dataSource as DataSource;
  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const familyRepo = ds.getRepository(Family);
  const aidRepo = ds.getRepository(Aid);
  const visitRepo = ds.getRepository(Visit);
  const distRepo = ds.getRepository(AidDistribution);
  const newsRepo = ds.getRepository(News);
  const locationRepo = ds.getRepository(Location);

  const admin = await seedAdmin(userRepo);
  const workers = await seedWorkers(userRepo);
  const families = await seedFamilies(familyRepo, locationRepo);
  const aids = await seedAids(aidRepo);
  const visits = await seedVisits(visitRepo, families, workers);
  await seedDistributions(distRepo, visits, aids);
  await seedNews(newsRepo);

  console.log('Seed terminé avec succès');
  await ds.destroy();
}

async function seedAdmin(userRepo: any) {
  const existing = await userRepo.findOne({ where: { email: 'admin@omnia.org' } });
  if (existing) {
    console.log('Admin existe déjà');
    return existing;
  }
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('admin123', salt);
  const admin = userRepo.create({
    name: 'Administrateur Omnia',
    email: 'admin@omnia.org',
    password: hashed,
    salt,
    role: UserRole.ADMIN,
    isActive: true,
    isEmailValidated: true,
  });
  await userRepo.save(admin);
  console.log('Admin créé : admin@omnia.org / admin123');
  return admin;
}

async function seedWorkers(userRepo: any) {
  const workerData = [
    { name: 'Ahmed Bénévole', email: 'worker@omnia.org', password: 'worker123' },
    { name: 'Sarah Bénévole', email: 'sarah@omnia.org', password: 'sarah123' },
  ];
  const workers: User[] = [];
  for (const w of workerData) {
    const existing = await userRepo.findOne({ where: { email: w.email } });
    if (existing) {
      workers.push(existing);
      continue;
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(w.password, salt);
    const user = userRepo.create({
      name: w.name,
      email: w.email,
      password: hashed,
      salt,
      role: UserRole.EMPLOYEE,
      isActive: true,
      isEmailValidated: true,
    });
    await userRepo.save(user);
    workers.push(user);
  }
  console.log(`${workers.length} bénévoles créés`);
  return workers;
}

async function seedFamilies(familyRepo: any, locationRepo: any) {
  const count = await familyRepo.count();
  if (count > 0) {
    const families = await familyRepo.find();
    console.log(`${families.length} familles existantes`);
    return families;
  }
  const created: Family[] = [];
  for (let i = 0; i < familyData.length; i++) {
    const f = familyData[i];
    const city = cities[i % cities.length];
    const family = familyRepo.create({
      lastName: f.lastName,
      address: `${f.address}, ${city.city}`,
      numberOfMembers: f.members,
      phone: f.phone,
      containsDisabledMember: f.disabled,
      containsElderlyMember: f.elderly,
      containspupilMember: f.pupil,
      notes: f.notes || null,
    });
    await familyRepo.save(family);
    const location = locationRepo.create({
      latitude: city.lat + (Math.random() - 0.5) * 0.02,
      longitude: city.lng + (Math.random() - 0.5) * 0.02,
      city: city.city,
      region: city.region,
      description: `Zone résidentielle ${city.city}`,
      family,
    });
    await locationRepo.save(location);
    created.push(family);
  }
  console.log(`${created.length} familles créées avec localisations`);
  return created;
}

async function seedAids(aidRepo: any) {
  const count = await aidRepo.count();
  if (count > 0) {
    const aids = await aidRepo.find();
    console.log(`${aids.length} aides existantes`);
    return aids;
  }
  const created: Aid[] = [];
  for (const a of aidData) {
    const aid = aidRepo.create({
      name: a.name,
      type: a.type,
      description: a.description,
      quantity: Math.floor(Math.random() * 500) + 50,
    });
    await aidRepo.save(aid);
    created.push(aid);
  }
  console.log(`${created.length} aides créées`);
  return created;
}

async function seedVisits(visitRepo: any, families: Family[], workers: User[]) {
  const count = await visitRepo.count();
  if (count > 0) {
    const visits = await visitRepo.find({ relations: ['families', 'users'] });
    console.log(`${visits.length} visites existantes`);
    return visits;
  }
  const created: Visit[] = [];
  for (let i = 0; i < 35; i++) {
    const isFuture = i >= 28;
    const daysOffset = isFuture ? (i - 28) * 3 + 1 : (i - 27) * 6;
    const startDate = new Date(Date.now() + daysOffset * DAY);
    const endDate = isFuture ? null : new Date(startDate.getTime() + 2 * 3600 * 1000);
    const city = cities[i % cities.length];
    const numFamilies = (i % 3) + 1;
    const visitFamilies: Family[] = [];
    for (let j = 0; j < numFamilies; j++) {
      visitFamilies.push(families[(i + j) % families.length]);
    }
    const visit = visitRepo.create({
      startDate,
      endDate,
      latitude: city.lat + (Math.random() - 0.5) * 0.01,
      longitude: city.lng + (Math.random() - 0.5) * 0.01,
      city: city.city,
      region: city.region,
      isActive: !isFuture && Math.random() < 0.15,
      isCompleted: !isFuture,
      notes: visitNotes[i % visitNotes.length],
      families: visitFamilies,
      users: [workers[i % workers.length]],
    });
    await visitRepo.save(visit);
    created.push(visit);
  }
  console.log(`${created.length} visites créées`);
  return created;
}

async function seedDistributions(distRepo: any, visits: Visit[], aids: Aid[]) {
  const count = await distRepo.count();
  if (count > 0) {
    console.log(`${count} distributions existantes`);
    return;
  }
  let created = 0;
  const completedVisits = visits.filter((v: Visit) => v.isCompleted);
  for (let i = 0; i < 25 && i < completedVisits.length; i++) {
    const numDists = (i % 3) + 1;
    for (let j = 0; j < numDists; j++) {
      const aid = aids[(i + j) % aids.length];
      const dist = distRepo.create({
        quantity: Math.floor(Math.random() * 20) + 1,
        unit: aid.type === AidType.FOOD ? 'kg' : aid.type === AidType.FINANCIAL ? 'TND' : 'unités',
        notes: `Distribution pour ${aid.name}`,
        aid,
        visit: completedVisits[i],
      });
      await distRepo.save(dist);
      created++;
    }
  }
  console.log(`${created} distributions créées`);
}

async function seedNews(newsRepo: any) {
  const count = await newsRepo.count();
  if (count > 0) {
    console.log(`${count} actualités existantes`);
    return;
  }
  const news = newsRepo.create([
    { content: 'Lancement de la campagne Ramadan 2026 — 500 colis alimentaires prévus pour les familles les plus vulnérables.' },
    { content: 'Nouveau partenariat avec la clinique du Sahel pour les soins médicaux gratuits aux familles accompagnées.' },
    { content: 'Recrutement de 10 nouveaux bénévoles — rejoignez notre équipe de terrain !' },
    { content: 'Bilan positif du premier semestre : 18 familles accompagnées, 35 visites réalisées, 95% de taux de satisfaction.' },
    { content: 'Inauguration du nouveau dépôt de stockage à Sfax pour améliorer la logistique sud du pays.' },
  ]);
  await newsRepo.save(news);
  console.log(`${news.length} actualités créées`);
}

seed().catch((err) => {
  console.error('Seed échoué :', err);
  process.exit(1);
});
