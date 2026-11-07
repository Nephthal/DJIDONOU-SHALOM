/* =========================================================
   DJIDONOU SHALOM IMMO — Données de démonstration
   Ces données sont chargées au premier lancement puis
   modifiables depuis l'espace administrateur.
   ========================================================= */
(function () {
  const U = (id, w = 1400) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

  const IMG = {
    terrain1: U('1500382017468-9049fed747ef'),
    terrain2: U('1495107334309-fcf20504a5ab'),
    terrain3: U('1502082553048-f009c37129b9'),
    terrain4: U('1560493676-04071c5f467b'),
    villa1: U('1600596542815-ffad4c1539a9'),
    villa2: U('1613490493576-7fde63acd811'),
    villa3: U('1580587771525-78b9dba3b914'),
    maison1: U('1564013799919-ab600027ffc6'),
    maison2: U('1570129477492-45c003edd2be'),
    maison3: U('1568605114967-8130f3a36994'),
    salon1: U('1600585154340-be6161a56a0c'),
    salon2: U('1502672260266-1c1ef2d93688'),
    salon3: U('1522708323590-d24dbb6b0267'),
    salon4: U('1600607687939-ce8a6c25118c'),
    chambre1: U('1505691938895-1758d7feb511'),
    cuisine1: U('1556911220-bff31c812dba'),
    appart1: U('1560448204-e02f11c3d0e2'),
    immeuble1: U('1486406146926-c627a92ad1ab'),
    bureau1: U('1497366216548-37526070297c'),
    agence: U('1560518883-ce09059eeffa'),
    cles: U('1521791136064-7986c2920216'),
    poignee: U('1556761175-5973dc0f32e7'),
    hero: U('1512917774080-9991f1c4c750', 2000),
  };

  const properties = [
    {
      id: 'P-1001', ref: 'DSI-PA-1001', title: 'Parcelle 500 m² à Abomey-Calavi, Zopah',
      transaction: 'vente', category: 'parcelle', price: 8500000, surface: 500,
      width: 20, depth: 25, city: 'Abomey-Calavi', district: 'Zopah',
      lat: 6.4612, lng: 2.3401, document: 'CPF', status: 'disponible', featured: true,
      installment: true, installmentMonths: 12, viabilise: true,
      features: ['Certificat de Propriété Foncière', 'Eau et électricité à 50 m', 'Voie pavée à 300 m', 'Quartier résidentiel calme', 'Proche université d\'Abomey-Calavi'],
      description: "Belle parcelle plate et bien bornée dans un quartier résidentiel en pleine expansion. Idéale pour une villa familiale ou un petit immeuble de rapport. Les réseaux d'eau (SONEB) et d'électricité (SBEE) sont à proximité immédiate. Le dossier foncier a été vérifié par notre équipe juridique.",
      images: [IMG.terrain1, IMG.terrain2], createdAt: '2026-10-28',
    },
    {
      id: 'P-1002', ref: 'DSI-PA-1002', title: 'Parcelle d\'angle 600 m² à Fidjrossè',
      transaction: 'vente', category: 'parcelle', price: 42000000, surface: 600,
      width: 24, depth: 25, city: 'Cotonou', district: 'Fidjrossè',
      lat: 6.3561, lng: 2.3583, document: 'Titre Foncier', status: 'disponible', featured: true,
      installment: false, viabilise: true,
      features: ['Titre Foncier', 'Parcelle d\'angle (2 façades)', 'À 400 m de la plage', 'Route bitumée', 'Idéal hôtel / résidence'],
      description: "Rare : parcelle d'angle avec titre foncier à quelques minutes de la plage de Fidjrossè. Double façade sur voie bitumée, parfaite pour un projet hôtelier, une résidence meublée ou une villa haut standing.",
      images: [IMG.terrain3, IMG.terrain1], createdAt: '2026-10-30',
    },
    {
      id: 'P-1003', ref: 'DSI-PA-1003', title: 'Parcelle 500 m² à Ouidah, route des pêches',
      transaction: 'vente', category: 'parcelle', price: 4800000, surface: 500,
      width: 20, depth: 25, city: 'Ouidah', district: 'Route des Pêches',
      lat: 6.3487, lng: 2.1312, document: 'Convention de vente', status: 'disponible', featured: true,
      installment: true, installmentMonths: 18, viabilise: false,
      features: ['Convention de vente', 'Zone touristique en développement', 'Paiement échelonné sur 18 mois', 'Lotissement en cours'],
      description: "Investissement d'avenir sur l'axe touristique de la route des pêches, en plein développement grâce aux projets de l'État. Paiement possible en plusieurs fois. Accompagnement pour la mutation vers un CPF.",
      images: [IMG.terrain2, IMG.terrain4], createdAt: '2026-10-21',
    },
    {
      id: 'P-1004', ref: 'DSI-PA-1004', title: 'Lot de 2 parcelles (1 000 m²) à Sèmè-Podji',
      transaction: 'vente', category: 'parcelle', price: 13000000, surface: 1000,
      width: 40, depth: 25, city: 'Sèmè-Podji', district: 'Ekpè',
      lat: 6.3736, lng: 2.5711, document: 'ADC', status: 'disponible', featured: false,
      installment: true, installmentMonths: 12, viabilise: true,
      features: ['Attestation de Détention Coutumière', '2 parcelles contiguës', 'Proche voie inter-État Cotonou–Lagos', 'Électricité disponible'],
      description: "Deux parcelles contiguës vendues ensemble, idéales pour un entrepôt, une école ou un projet résidentiel. Situées à 5 minutes de la route inter-État.",
      images: [IMG.terrain4, IMG.terrain3], createdAt: '2026-10-12',
    },
    {
      id: 'P-1005', ref: 'DSI-PA-1005', title: 'Parcelle 500 m² à Allada, centre',
      transaction: 'vente', category: 'parcelle', price: 2700000, surface: 500,
      width: 20, depth: 25, city: 'Allada', district: 'Centre',
      lat: 6.6650, lng: 2.1510, document: 'Convention de vente', status: 'disponible', featured: false,
      installment: true, installmentMonths: 10, viabilise: false,
      features: ['Prix accessible', 'Paiement échelonné', 'Proche axe Cotonou–Bohicon', 'Terrain sec et plat'],
      description: "Une première acquisition à petit budget, dans une ville qui se développe rapidement le long de l'axe Cotonou–Bohicon.",
      images: [IMG.terrain1, IMG.terrain2], createdAt: '2026-09-30',
    },
    {
      id: 'P-1006', ref: 'DSI-PA-1006', title: 'Parcelle 400 m² à Glo-Djigbé (zone aéroport)',
      transaction: 'vente', category: 'parcelle', price: 3900000, surface: 400,
      width: 20, depth: 20, city: 'Abomey-Calavi', district: 'Glo-Djigbé',
      lat: 6.5794, lng: 2.2701, document: 'CPF', status: 'réservé', featured: false,
      installment: true, installmentMonths: 12, viabilise: false,
      features: ['CPF', 'Proche Zone Économique Spéciale', 'Futur aéroport de Glo-Djigbé', 'Forte plus-value attendue'],
      description: "Parcelle stratégique proche de la Zone Économique Spéciale de Glo-Djigbé. Un placement à fort potentiel de valorisation.",
      images: [IMG.terrain3, IMG.terrain4], createdAt: '2026-09-18',
    },
    {
      id: 'P-1007', ref: 'DSI-PA-1007', title: 'Parcelle 500 m² à Porto-Novo, Ouando',
      transaction: 'vente', category: 'parcelle', price: 7200000, surface: 500,
      width: 20, depth: 25, city: 'Porto-Novo', district: 'Ouando',
      lat: 6.5098, lng: 2.6232, document: 'Titre Foncier', status: 'vendu', featured: false,
      installment: false, viabilise: true,
      features: ['Titre Foncier', 'Eau et électricité', 'Quartier administratif'],
      description: "Parcelle titrée dans un quartier recherché de la capitale. Vendue par notre agence en 3 semaines.",
      images: [IMG.terrain2, IMG.terrain1], createdAt: '2026-08-02',
    },
    {
      id: 'P-2001', ref: 'DSI-VI-2001', title: 'Villa contemporaine 5 chambres, Haie Vive',
      transaction: 'vente', category: 'maison', price: 185000000, surface: 650, built: 380,
      rooms: 7, bedrooms: 5, bathrooms: 5, city: 'Cotonou', district: 'Haie Vive',
      lat: 6.3555, lng: 2.3935, document: 'Titre Foncier', status: 'disponible', featured: true,
      installment: false, viabilise: true,
      features: ['Piscine', 'Groupe électrogène', 'Forage', 'Garage 3 voitures', 'Dépendance gardien', 'Climatisation'],
      description: "Villa d'architecte sur un terrain titré de 650 m², au cœur du quartier le plus prisé de Cotonou. Grands volumes lumineux, cuisine équipée, piscine et jardin paysager.",
      images: [IMG.villa1, IMG.salon1, IMG.cuisine1, IMG.chambre1], createdAt: '2026-11-02',
    },
    {
      id: 'P-2002', ref: 'DSI-VI-2002', title: 'Maison 4 chambres avec jardin, Calavi Kpota',
      transaction: 'vente', category: 'maison', price: 62000000, surface: 500, built: 220,
      rooms: 6, bedrooms: 4, bathrooms: 3, city: 'Abomey-Calavi', district: 'Kpota',
      lat: 6.4489, lng: 2.3560, document: 'CPF', status: 'disponible', featured: false,
      installment: true, installmentMonths: 24, viabilise: true,
      features: ['Jardin arboré', 'Clôture et portail', 'Cuisine moderne', 'Bâche à eau'],
      description: "Maison familiale récente, bien finie, dans une rue calme de Kpota. Possibilité de paiement échelonné sur 24 mois après apport.",
      images: [IMG.maison1, IMG.salon2, IMG.chambre1], createdAt: '2026-10-25',
    },
    {
      id: 'L-3001', ref: 'DSI-LO-3001', title: 'Appartement meublé 3 pièces, Haie Vive',
      transaction: 'location', category: 'appartement', price: 450000, surface: 110,
      rooms: 3, bedrooms: 2, bathrooms: 2, city: 'Cotonou', district: 'Haie Vive',
      lat: 6.3570, lng: 2.3901, document: '', status: 'disponible', featured: true,
      furnished: true, deposit: 3, advance: 3,
      features: ['Entièrement meublé', 'Wi-Fi fibre', 'Groupe électrogène', 'Gardiennage 24h/24', 'Parking'],
      description: "Appartement haut standing entièrement meublé et équipé, idéal pour expatriés et professionnels. Ménage hebdomadaire possible.",
      images: [IMG.salon4, IMG.chambre1, IMG.cuisine1], createdAt: '2026-11-04',
    },
    {
      id: 'L-3002', ref: 'DSI-LO-3002', title: 'Appartement 2 chambres salon, Fidjrossè',
      transaction: 'location', category: 'appartement', price: 150000, surface: 85,
      rooms: 3, bedrooms: 2, bathrooms: 2, city: 'Cotonou', district: 'Fidjrossè',
      lat: 6.3580, lng: 2.3520, document: '', status: 'disponible', featured: true,
      furnished: false, deposit: 3, advance: 3,
      features: ['Compteurs individuels', 'Carrelage neuf', 'Cour commune sécurisée', 'Proche plage'],
      description: "Appartement neuf au 1er étage d'un immeuble calme. Compteurs SBEE et SONEB individuels.",
      images: [IMG.appart1, IMG.salon3], createdAt: '2026-10-29',
    },
    {
      id: 'L-3003', ref: 'DSI-LO-3003', title: 'Villa 3 chambres avec cour, Calavi Togba',
      transaction: 'location', category: 'maison', price: 120000, surface: 300, built: 140,
      rooms: 5, bedrooms: 3, bathrooms: 2, city: 'Abomey-Calavi', district: 'Togba',
      lat: 6.4910, lng: 2.3230, document: '', status: 'disponible', featured: false,
      furnished: false, deposit: 2, advance: 3,
      features: ['Grande cour', 'Garage', 'Forage', 'Quartier calme'],
      description: "Villa indépendante dans une grande cour clôturée. Parfaite pour une famille.",
      images: [IMG.maison2, IMG.salon2], createdAt: '2026-10-15',
    },
    {
      id: 'L-3004', ref: 'DSI-LO-3004', title: 'Studio moderne, Cadjèhoun',
      transaction: 'location', category: 'appartement', price: 75000, surface: 35,
      rooms: 1, bedrooms: 1, bathrooms: 1, city: 'Cotonou', district: 'Cadjèhoun',
      lat: 6.3630, lng: 2.3800, document: '', status: 'loué', featured: false,
      furnished: false, deposit: 2, advance: 3,
      features: ['Proche aéroport', 'Douche interne', 'Climatisation'],
      description: "Studio lumineux, proche de l'aéroport et des grands axes.",
      images: [IMG.salon3, IMG.chambre1], createdAt: '2026-09-10',
    },
    {
      id: 'L-3005', ref: 'DSI-LO-3005', title: 'Bureaux 120 m², Ganhi',
      transaction: 'location', category: 'bureau', price: 380000, surface: 120,
      rooms: 4, bathrooms: 2, city: 'Cotonou', district: 'Ganhi',
      lat: 6.3530, lng: 2.4310, document: '', status: 'disponible', featured: false,
      furnished: false, deposit: 3, advance: 6,
      features: ['Centre des affaires', 'Climatisation centrale', 'Salle de réunion', 'Parking clients'],
      description: "Plateau de bureaux au cœur du quartier des affaires de Ganhi, proche des banques et administrations.",
      images: [IMG.bureau1, IMG.immeuble1], createdAt: '2026-10-05',
    },
    {
      id: 'L-3006', ref: 'DSI-LO-3006', title: 'Duplex 4 chambres, Akpakpa',
      transaction: 'location', category: 'maison', price: 250000, surface: 250, built: 200,
      rooms: 6, bedrooms: 4, bathrooms: 3, city: 'Cotonou', district: 'Akpakpa',
      lat: 6.3650, lng: 2.4560, document: '', status: 'disponible', featured: true,
      furnished: false, deposit: 3, advance: 3,
      features: ['Duplex', 'Terrasse', 'Garage 2 voitures', 'Chambres climatisées'],
      description: "Spacieux duplex avec terrasse, dans une résidence sécurisée d'Akpakpa.",
      images: [IMG.villa3, IMG.salon1, IMG.cuisine1], createdAt: '2026-11-01',
    },
  ];

  const services = [
    { icon: 'key', title: 'Gestion locative', text: "Nous gérons votre bien de A à Z : recherche et sélection des locataires, contrats, encaissement des loyers, état des lieux, entretien et reversement mensuel.", points: ['Locataires vérifiés', 'Loyers encaissés et reversés', 'Rapport mensuel'] },
    { icon: 'map', title: 'Vente de parcelles', text: "Des parcelles vérifiées dans les meilleures zones du Sud-Bénin, avec un dossier foncier contrôlé et des facilités de paiement.", points: ['Documents vérifiés', 'Paiement échelonné', 'Visite sur site'] },
    { icon: 'handshake', title: 'Achat & vente accompagnés', text: "Vous achetez ou vendez une maison, un terrain ? Nous vous accompagnons : estimation, négociation, vérification juridique, signature chez le notaire.", points: ['Estimation gratuite', 'Négociation', 'Suivi notarial'] },
    { icon: 'shield', title: 'Sécurisation foncière', text: "Vérification à l'ANDF, accompagnement à l'obtention du Certificat de Propriété Foncière (CPF) et à la mutation de vos documents.", points: ['Vérification ANDF', 'Obtention du CPF', 'Bornage et levé'] },
    { icon: 'home', title: 'Location & recherche', text: "Vous cherchez un logement, des bureaux ou un local commercial ? Dites-nous ce que vous voulez, nous trouvons pour vous.", points: ['Recherche sur mesure', 'Visites groupées', 'Négociation du loyer'] },
    { icon: 'build', title: 'Conseil & construction', text: "De la parcelle à la clé : conseils, mise en relation avec des architectes et des entreprises de construction de confiance, suivi de chantier.", points: ['Plans et devis', 'Suivi de chantier', 'Diaspora bienvenue'] },
  ];

  const testimonials = [
    { name: 'Rodrigue A.', role: 'Acheteur, diaspora (Paris)', text: "J'ai acheté ma parcelle à Calavi depuis la France. L'équipe m'a envoyé les vidéos, vérifié les documents et suivi tout le dossier. Je recommande sans hésiter." },
    { name: 'Mme Sandrine K.', role: 'Propriétaire, gestion locative', text: "Depuis que Shalom Immo gère mes deux appartements, je reçois mes loyers à date fixe et je n'ai plus aucun souci avec les locataires." },
    { name: 'Fabrice H.', role: 'Locataire', text: "Recherche rapide, visites bien organisées, et un appartement conforme aux photos. Service très professionnel." },
  ];

  const settings = {
    name: 'DJIDONOU SHALOM IMMO',
    short: 'Shalom Immo',
    slogan: "Votre partenaire de confiance pour vos terrains et vos biens immobiliers",
    phone: '+229 01 66 28 45 12',
    whatsapp: '2290166284512',
    email: 'nathhoue2468@gmail.com',
    address: "Kpota, Abomey-Calavi – sur les pavés menant à l'embarcadère de Ganvié",
    hours: 'Lun – Sam : 8h00 – 18h30',
    facebook: 'https://www.facebook.com/share/1FBMPUiJ9U/', instagram: '', tiktok: 'https://www.tiktok.com/@djidonou_immobilier',
    lat: 6.4475, lng: 2.3612,
  };

  // Démo : clients, demandes, contrats de gestion locative, visites
  const clients = [
    { id: 'C-1', name: 'Rodrigue Agossou', phone: '+33 6 12 34 56 78', email: 'rodrigue.a@mail.com', type: 'Acheteur', city: 'Paris (diaspora)', notes: 'Cherche 2e parcelle à Calavi, budget 10 M', createdAt: '2026-09-02' },
    { id: 'C-2', name: 'Sandrine Kpadé', phone: '+229 01 97 11 22 33', email: 'sandrine.k@mail.com', type: 'Propriétaire', city: 'Cotonou', notes: '2 appartements en gestion (Fidjrossè, Haie Vive)', createdAt: '2026-06-14' },
    { id: 'C-3', name: 'Fabrice Houngbo', phone: '+229 01 66 44 55 77', email: 'fabrice.h@mail.com', type: 'Locataire', city: 'Cotonou', notes: 'Locataire L-3004', createdAt: '2026-09-10' },
    { id: 'C-4', name: 'Aïcha Bello', phone: '+229 01 95 88 12 40', email: 'aicha.b@mail.com', type: 'Locataire', city: 'Cotonou', notes: 'Locataire appartement Fidjrossè (bien géré)', createdAt: '2026-07-01' },
    { id: 'C-5', name: 'Société BTP Akwaba', phone: '+229 01 21 30 40 50', email: 'contact@akwaba-btp.bj', type: 'Vendeur', city: 'Sèmè-Podji', notes: 'Mandat de vente : lot 1 000 m² Ekpè', createdAt: '2026-10-12' },
  ];

  const leads = [
    { id: 'D-1', date: '2026-11-06T10:24', name: 'Jean-Marc Dossou', phone: '+229 01 90 12 34 56', email: 'jm.dossou@mail.com', subject: 'Visite', propertyId: 'P-1001', message: 'Je souhaite visiter la parcelle de Zopah samedi matin.', status: 'nouveau' },
    { id: 'D-2', date: '2026-11-05T16:02', name: 'Grace Ahouansou', phone: '+229 01 61 22 33 44', email: '', subject: 'Information', propertyId: 'L-3001', message: "L'appartement meublé est-il disponible à partir du 1er décembre ?", status: 'en cours' },
    { id: 'D-3', date: '2026-11-04T09:15', name: 'Paul Zinsou', phone: '+229 01 97 00 11 22', email: 'paul.z@mail.com', subject: 'Confier un bien', propertyId: '', message: "J'ai une maison de 3 chambres à Godomey à mettre en gestion locative.", status: 'nouveau' },
    { id: 'D-4', date: '2026-10-30T11:40', name: 'Mireille Tossa', phone: '+229 01 52 44 77 88', email: '', subject: 'Paiement échelonné', propertyId: 'P-1003', message: 'Quelles sont les conditions du paiement en 18 mois ?', status: 'traité' },
  ];

  const rentals = [
    { id: 'G-1', propertyId: 'L-3002', label: 'Appart. 2ch Fidjrossè', ownerId: 'C-2', tenantId: 'C-4', rent: 150000, commission: 10, startDate: '2026-07-01', dueDay: 5,
      payments: { '2026-07': true, '2026-08': true, '2026-09': true, '2026-10': true, '2026-11': false } },
    { id: 'G-2', propertyId: 'L-3004', label: 'Studio Cadjèhoun', ownerId: 'C-2', tenantId: 'C-3', rent: 75000, commission: 10, startDate: '2026-09-10', dueDay: 10,
      payments: { '2026-09': true, '2026-10': true, '2026-11': false } },
  ];

  const visits = [
    { id: 'V-1', date: '2026-11-08T09:30', propertyId: 'P-1001', client: 'Jean-Marc Dossou', phone: '+229 01 90 12 34 56', agent: 'Agent terrain', status: 'planifiée' },
    { id: 'V-2', date: '2026-11-09T15:00', propertyId: 'L-3001', client: 'Grace Ahouansou', phone: '+229 01 61 22 33 44', agent: 'Agent location', status: 'planifiée' },
  ];

  window.DSI_SEED = { version: 1, properties, services, testimonials, settings, clients, leads, rentals, visits, IMG };
})();
