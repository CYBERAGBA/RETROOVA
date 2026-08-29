const categories = ['phone', 'wallet', 'bank-card', 'id-card', 'passport', 'license', 'documents', 'keys', 'jewelry', 'bag', 'computer', 'tablet', 'luggage', 'clothing', 'electronics', 'birth-certificate', 'cmu-card', 'money-card', 'book', 'notebook', 'other-things', 'other'];

function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

const categoryLabels = {
    phone: 'Téléphone',
    wallet: 'Portefeuille',
    'bank-card': 'Carte bancaire',
    'id-card': 'Carte d’identité',
    passport: 'Passeport',
    license: 'Permis de conduire',
    documents: 'Documents',
    keys: 'Clés',
    jewelry: 'Bijoux',
    bag: 'Sac',
    computer: 'Ordinateur',
    tablet: 'Tablette',
    luggage: 'Bagage',
    clothing: 'Vêtement',
    electronics: 'Électronique',
    'birth-certificate': 'Extrait de naissance',
    'cmu-card': 'Carte CMU',
    'money-card': 'Carte monétaire',
    book: 'Livre',
    notebook: 'Cahier',
    'other-things': 'Autres choses',
    other: 'Autre'
};

module.exports = { categories, categoryLabels, isValidDate };
