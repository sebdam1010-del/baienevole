const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // Create admin user
  const bcrypt = require('bcrypt');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const volunteerPassword = await bcrypt.hash('volunteer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@baiedessinges.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Baie des Singes',
      role: 'ADMIN',
      phone: '0123456789',
      bio: 'Administrateur de la plateforme',
    },
  });

  console.log('👤 Created admin user:', admin.email);

  // Create volunteer users
  const volunteers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'benevole1@example.com',
        password: volunteerPassword,
        firstName: 'Marie',
        lastName: 'Dupont',
        role: 'VOLUNTEER',
        phone: '0612345678',
        skills: 'Accueil,Billetterie',
        availability: 'Week-ends',
        bio: 'Passionnée de théâtre, disponible les week-ends',
      },
    }),
    prisma.user.create({
      data: {
        email: 'benevole2@example.com',
        password: volunteerPassword,
        firstName: 'Pierre',
        lastName: 'Martin',
        role: 'VOLUNTEER',
        phone: '0698765432',
        skills: 'Technique,Installation',
        availability: 'Soirées',
        bio: 'Technicien bénévole',
      },
    }),
    prisma.user.create({
      data: {
        email: 'benevole3@example.com',
        password: volunteerPassword,
        firstName: 'Sophie',
        lastName: 'Bernard',
        role: 'VOLUNTEER',
        phone: '0687654321',
        skills: 'Restauration,Bar',
        availability: 'Flexible',
        bio: 'Disponible pour la buvette',
      },
    }),
  ]);

  console.log(`👥 Created ${volunteers.length} volunteer users`);

  // Create events
  const now = new Date();
  const events = await Promise.all([
    prisma.event.create({
      data: {
        nom: 'Spectacle de marionnettes',
        description: 'Spectacle pour enfants avec les marionnettes géantes',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        horaireArrivee: '14:00',
        horaireDepart: '17:30',
        nombreSpectatursAttendus: 150,
        nombreBenevolesRequis: 5,
        saison: 29,
        commentaires: 'Prévoir chaises supplémentaires',
      },
    }),
    prisma.event.create({
      data: {
        nom: 'Concert acoustique',
        description: 'Concert en plein air avec artistes locaux',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
        horaireArrivee: '18:30',
        horaireDepart: '22:00',
        nombreSpectatursAttendus: 200,
        nombreBenevolesRequis: 8,
        saison: 29,
        commentaires: 'Annulation si pluie',
      },
    }),
    prisma.event.create({
      data: {
        nom: 'Pièce de théâtre contemporain',
        description: 'Création originale de la compagnie locale',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
        horaireArrivee: '19:00',
        horaireDepart: '22:30',
        nombreSpectatursAttendus: 120,
        nombreBenevolesRequis: 6,
        saison: 29,
        commentaires: 'Entracte prévu',
      },
    }),
  ]);

  console.log(`🎭 Created ${events.length} events`);

  // Create some registrations
  await prisma.eventRegistration.create({
    data: {
      eventId: events[0].id,
      userId: volunteers[0].id,
    },
  });

  await prisma.eventRegistration.create({
    data: {
      eventId: events[0].id,
      userId: volunteers[1].id,
    },
  });

  await prisma.eventRegistration.create({
    data: {
      eventId: events[1].id,
      userId: volunteers[0].id,
    },
  });

  console.log('📝 Created event registrations');

  console.log('🌱 Seeding completed successfully');
  console.log('\n📋 Test credentials:');
  console.log('Admin: admin@baiedessinges.com / admin123');
  console.log('Volunteer: benevole1@example.com / volunteer123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
