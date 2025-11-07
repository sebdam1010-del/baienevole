const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestEvents() {
  console.log('🎯 Création d\'événements de test futurs...\n');

  try {
    // Événements dans les prochains jours
    const futureEvents = [
      {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        nom: 'Concert de test - Trio Jazz',
        description: '<p>Concert de jazz avec un trio exceptionnel.</p><p>Ambiance garantie !</p>',
        horaireArrivee: '19:00',
        horaireDepart: '23:00',
        nombreSpectatursAttendus: 80,
        nombreBenevolesRequis: 4,
        saison: 29,
        commentaires: 'Événement de test',
        imageUrl: null,
      },
      {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        nom: 'Théâtre - La Comédie des Erreurs',
        description: '<p>Une pièce hilarante adaptée de Shakespeare.</p>',
        horaireArrivee: '20:30',
        horaireDepart: '22:30',
        nombreSpectatursAttendus: 100,
        nombreBenevolesRequis: 6,
        saison: 29,
        commentaires: 'Événement de test',
        imageUrl: null,
      },
      {
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
        nom: 'Soirée Stand-Up',
        description: '<p>Trois humoristes en première partie + tête d\'affiche.</p>',
        horaireArrivee: '20:00',
        horaireDepart: '23:30',
        nombreSpectatursAttendus: 120,
        nombreBenevolesRequis: 5,
        saison: 29,
        commentaires: 'Événement de test',
        imageUrl: null,
      },
      {
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Dans 21 jours
        nom: 'Concert Rock - Les Amazones',
        description: '<p>Groupe féminin de rock alternatif.</p>',
        horaireArrivee: '21:00',
        horaireDepart: '01:00',
        nombreSpectatursAttendus: 150,
        nombreBenevolesRequis: 8,
        saison: 29,
        commentaires: 'Événement de test - soirée tardive',
        imageUrl: null,
      },
      {
        date: new Date(Date.now() + 1 * 60 * 60 * 1000), // Dans 1 heure (pour tester le délai de 24h)
        nom: 'Événement imminent - Test 24h',
        description: '<p>Cet événement commence dans moins de 24h.</p>',
        horaireArrivee: '18:00',
        horaireDepart: '20:00',
        nombreSpectatursAttendus: 50,
        nombreBenevolesRequis: 3,
        saison: 29,
        commentaires: 'Pour tester la restriction des 24h',
        imageUrl: null,
      },
    ];

    for (const eventData of futureEvents) {
      const event = await prisma.event.create({
        data: eventData,
      });
      console.log(`✅ Créé: ${event.nom} - ${event.date.toLocaleDateString('fr-FR')}`);
    }

    console.log('\n✨ Tous les événements de test ont été créés !');
    console.log('\n📋 Résumé:');
    console.log('- 4 événements futurs disponibles pour inscription');
    console.log('- 1 événement dans moins de 24h (inscription bloquée)');
    console.log('\n🧪 Vous pouvez maintenant tester:');
    console.log('1. Inscription aux événements futurs');
    console.log('2. Désinscription');
    console.log('3. Gestion des conflits horaires');
    console.log('4. Limite des 24 heures');

  } catch (error) {
    console.error('❌ Erreur lors de la création des événements:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestEvents();
