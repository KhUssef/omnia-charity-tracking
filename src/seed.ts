import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user/entities/user.entity';
import { Family } from './family/entities/family.entity';
import { Aid, AidType } from './aid/entities/aid.entity';
import { Visit } from './visit/entities/visit.entity';
import { AidDistribution } from './aid-distribution/entities/aid-distribution.entity';
import { News } from './news/entities/news.entity';
import dataSource from './data-source';

async function seed() {
  const ds = dataSource as DataSource;
  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const familyRepo = ds.getRepository(Family);
  const aidRepo = ds.getRepository(Aid);
  const visitRepo = ds.getRepository(Visit);
  const distRepo = ds.getRepository(AidDistribution);
  const newsRepo = ds.getRepository(News);

  // Compte admin de test
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@omnia.org' } });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const admin = userRepo.create({
      name: 'Administrateur',
      email: 'admin@omnia.org',
      password: hashedPassword,
      salt,
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepo.save(admin);
    console.log('Admin créé : admin@omnia.org / admin123');
  }

  // Compte worker de test
  const existingWorker = await userRepo.findOne({ where: { email: 'worker@omnia.org' } });
  if (!existingWorker) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('worker123', salt);
    const worker = userRepo.create({
      name: 'Bénévole Test',
      email: 'worker@omnia.org',
      password: hashedPassword,
      salt,
      role: UserRole.WORKER,
      isActive: true,
    });
    await userRepo.save(worker);
    console.log('Worker créé : worker@omnia.org / worker123');
  }

  // Familles de test
  if ((await familyRepo.count()) === 0) {
    const families = familyRepo.create([
      { lastName: 'Ben Ali', address: 'Tunis, Médina', numberOfMembers: 7, phone: '98765432', containsDisabledMember: true, containsElderlyMember: true, containspupilMember: true, notes: 'Situation critique, besoin urgent.' },
      { lastName: 'Trabelsi', address: 'Tunis, Le Bardo', numberOfMembers: 5, phone: '97654321', containsDisabledMember: false, containsElderlyMember: true, containspupilMember: true, notes: 'Personne âgée seule le jour.' },
      { lastName: 'Gharbi', address: 'Sousse, Sahel', numberOfMembers: 6, phone: '96543210', containsDisabledMember: true, containsElderlyMember: false, containspupilMember: true },
      { lastName: 'Masmoudi', address: 'Nabeul, Centre', numberOfMembers: 4, phone: '95432109', containsDisabledMember: false, containsElderlyMember: true, containspupilMember: false },
      { lastName: 'Karray', address: 'Bizerte, Ville', numberOfMembers: 3, phone: '94321098', containsDisabledMember: false, containsElderlyMember: false, containspupilMember: true },
      { lastName: 'Jebali', address: 'Sfax, Sud', numberOfMembers: 8, phone: '93210987', containsDisabledMember: true, containsElderlyMember: true, containspupilMember: false, notes: 'Famille nombreuse, plusieurs handicaps.' },
      { lastName: 'Haddad', address: 'Tunis, Ariana', numberOfMembers: 2, phone: '92109876', containsDisabledMember: false, containsElderlyMember: true, containspupilMember: false },
    ]);
    await familyRepo.save(families);
    console.log(`${families.length} familles créées`);
  }

  // Aides de test
  if ((await aidRepo.count()) === 0) {
    const aids = aidRepo.create([
      { name: 'Colis Alimentaire Ramadan', type: AidType.FOOD, description: 'Denrées alimentaires de base pour le mois sacré' },
      { name: 'Kit Médicaments', type: AidType.MEDICINE, description: 'Médicaments essentiels et premiers soins' },
      { name: 'Aide Scolaire', type: AidType.SOCIAL, description: 'Fournitures scolaires pour enfants' },
      { name: 'Couvertures Hiver', type: AidType.OTHER, description: 'Couvertures et vêtements chauds' },
      { name: 'Aide Financière Urgente', type: AidType.FINANCIAL, description: 'Soutien financier ponctuel' },
    ]);
    await aidRepo.save(aids);
    console.log(`${aids.length} aides créées`);
  }

  // Visites de test
  if ((await visitRepo.count()) === 0) {
    const families = await familyRepo.find();
    const workers = await userRepo.find({ where: { role: UserRole.WORKER } });
    const worker = workers[0];

    const visits = visitRepo.create([
      { startDate: new Date(Date.now() - 86400000 * 2), isActive: false, isCompleted: true, notes: 'Distribution réussie, famille très reconnaissante.', family: families[0], user: worker },
      { startDate: new Date(Date.now() - 86400000 * 5), isActive: false, isCompleted: true, notes: 'Besoin médical identifié, suivi prévu.', family: families[1], user: worker },
      { startDate: new Date(), isActive: true, isCompleted: false, notes: 'Visite en cours.', family: families[2], user: worker },
      { startDate: new Date(Date.now() + 86400000), isActive: false, isCompleted: false, notes: 'Visite planifiée.', family: families[3], user: worker },
    ]);
    await visitRepo.save(visits);
    console.log(`${visits.length} visites créées`);
  }

  // Distributions de test
  if ((await distRepo.count()) === 0) {
    const visits = await visitRepo.find({ relations: ['family'] });
    const aids = await aidRepo.find();
    if (visits.length > 0 && aids.length > 0) {
      const distributions = distRepo.create([
        { quantity: 3, date: new Date(Date.now() - 86400000 * 2), aid: aids[0], visit: visits[0] },
        { quantity: 2, date: new Date(Date.now() - 86400000 * 5), aid: aids[1], visit: visits[1] },
        { quantity: 1, date: new Date(), aid: aids[2], visit: visits[2] },
      ]);
      await distRepo.save(distributions);
      console.log(`${distributions.length} distributions créées`);
    }
  }

  // News de test
  if ((await newsRepo.count()) === 0) {
    const news = newsRepo.create([
      { content: 'Lancement de la campagne Ramadan 2024 — 500 colis alimentaires prévus' },
      { content: 'Nouveau partenariat avec la clinique du Sahel pour les soins médicaux' },
      { content: 'Recrutement de 10 nouveaux bénévoles bienvenue !' },
    ]);
    await newsRepo.save(news);
    console.log(`${news.length} actualités créées`);
  }

  console.log('Seed terminé avec succès');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed échoué :', err);
  process.exit(1);
});
