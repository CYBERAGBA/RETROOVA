const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const { DatabaseAdapter, isPostgres, UPLOADS_DIR } = require('../src/db');

const ROOT = path.resolve(__dirname, '..');
const DEMO_EMAIL_DOMAIN = 'demo.retrova.invalid';
const IMAGE_DIR = path.join(ROOT, 'public', 'images', 'annonces');
const IMAGE_FILES = [
  'annonce_calculatrice_sharp_perdu.jpg',
  'annonce_pc_lenovo_x260_perdu.jpg',
  'annonce_lot_de_roman_perdu.png',
  'annonce_roman_soundjata_de_niane_trouve.jpg',
  'annonce_plan_de_lotissement_perdu.png'
];

const users = [
  ['Awa', 'Kouassi', 'Abidjan', 'fr'], ['Mariam', 'Diop', 'Dakar', 'fr'], ['Kojo', 'Mensah', 'Accra', 'en'],
  ['Nadia', 'Yao', 'Bouake', 'fr'], ['Koffi', 'Traore', 'Yamoussoukro', 'fr'], ['Grace', 'Owusu', 'Kumasi', 'en'],
  ['Aminata', 'Diallo', 'Conakry', 'fr'], ['Kwame', 'Boateng', 'Lagos', 'en'], ['Fatou', 'Bamba', 'Abidjan', 'fr'],
  ['David', 'Ochieng', 'Nairobi', 'en'], ['Estelle', 'Nguessan', 'Abidjan', 'fr'], ['Yannick', 'Kone', 'Abidjan', 'fr'],
  ['Clara', 'Martin', 'Paris', 'fr'], ['Thomas', 'Roy', 'Montreal', 'fr'], ['Emily', 'Carter', 'London', 'en'],
  ['Safi', 'Amoussou', 'Cotonou', 'fr'], ['Esi', 'Adjei', 'Lome', 'en'], ['Moussa', 'Coulibaly', 'Abidjan', 'fr'],
  ['Ines', 'Toure', 'Abidjan', 'fr'], ['Samuel', 'Adeyemi', 'Lagos', 'en']
].map(([firstName, lastName, city, locale], index) => ({ firstName, lastName, city, locale, index }));

const itemSeed = [
  ['lost', 'phone', 'iPhone 13 bleu perdu près de Cocody', 'Je ne retrouve plus mon téléphone depuis la sortie du marché de Cocody. La coque est transparente et légèrement fendue.', 'Apple', 'iPhone 13', 'Bleu', 'Abidjan', 'Cocody', '2026-08-28'],
  ['lost', 'wallet', 'Portefeuille noir perdu à Treichville', 'Petit portefeuille noir avec quelques cartes factices et une photo de famille. Merci de me contacter si vous l’avez vu.', '', '', 'Noir', 'Abidjan', 'Treichville', '2026-08-21'],
  ['found', 'keys', 'Trousseau de clés trouvé à Marcory', 'Trousseau de trois clés trouvé près de l’arrêt de bus. Un porte-clés rouge est accroché à l’anneau.', '', '', 'Argenté', 'Abidjan', 'Marcory', '2026-08-19'],
  ['lost', 'bag', 'Sac à dos gris oublié à l’université', 'Sac à dos gris avec un cahier quadrillé et une gourde. Je pense l’avoir oublié près de la bibliothèque.', 'Nike', '', 'Gris', 'Abidjan', 'Cocody', '2026-08-12'],
  ['found', 'electronics', 'Écouteurs sans fil trouvés dans un taxi', 'Boîtier blanc trouvé sur le siège arrière d’un taxi entre Plateau et Adjamé. Le boîtier porte une petite rayure.', 'JBL', '', 'Blanc', 'Abidjan', 'Plateau', '2026-08-05'],
  ['lost', 'computer', 'Ordinateur Lenovo perdu à l’aéroport', 'Ordinateur professionnel dans une housse noire, oublié après le contrôle de sécurité. Il ne contient pas d’information sensible dans cette annonce.', 'Lenovo', 'ThinkPad X260', 'Noir', 'Abidjan', 'Port-Bouet', '2026-07-27'],
  ['found', 'documents', 'Chemise à rabat trouvée à Yopougon', 'Chemise contenant des documents administratifs aux noms fictifs. Je préfère ne pas publier de numéro personnel.', '', '', 'Marron', 'Abidjan', 'Yopougon', '2026-07-18'],
  ['lost', 'keys', 'Clés de maison perdues à Bouaké', 'Un anneau simple avec deux clés et un petit ruban bleu. Perdu probablement autour du grand marché.', '', '', 'Métal', 'Bouake', 'Centre-ville', '2026-07-09'],
  ['found', 'book', 'Livre trouvé dans le bus à Yamoussoukro', 'Roman de poche laissé sur un siège. La couverture est rouge et le livre est annoté au crayon.', '', '', 'Rouge', 'Yamoussoukro', 'Habitat', '2026-06-30'],
  ['lost', 'id-card', 'Carte d’identité perdue à Abidjan', 'Document fictif au nom de Mariam K. Si vous la trouvez, merci de la remettre via la plateforme sans publier de numéro.', '', '', 'Blanc', 'Abidjan', 'Adjamé', '2026-06-22'],
  ['found', 'wallet', 'Portefeuille marron trouvé à Dakar', 'Portefeuille trouvé près d’un café à Plateau. Il contient seulement quelques reçus et aucune information que je souhaite afficher ici.', '', '', 'Marron', 'Dakar', 'Plateau', '2026-06-15'],
  ['lost', 'other', 'Lunettes de vue perdues à Lomé', 'Monture noire assez fine, dans un étui bleu. Perdues pendant un trajet à pied vers le campus.', '', '', 'Noir', 'Lome', 'Tokoin', '2026-06-07'],
  ['found', 'phone', 'Téléphone Android trouvé à Cotonou', 'Téléphone éteint trouvé sur un banc près de l’esplanade. Une coque verte avec une petite étoile le distingue.', 'Samsung', 'Galaxy A54', 'Vert', 'Cotonou', 'Cadjehoun', '2026-05-29'],
  ['lost', 'license', 'Permis de conduire perdu à Accra', 'Permis fictif au nom de Kojo M. Je ne publie volontairement aucun numéro de document.', '', '', 'Blanc', 'Accra', 'Osu', '2026-05-20'],
  ['found', 'bag', 'Sac à main trouvé à Kumasi', 'Sac bleu marine trouvé dans une salle d’attente. Il contient un carnet et un foulard, sans document sensible visible.', '', '', 'Bleu marine', 'Kumasi', 'Adum', '2026-05-11'],
  ['lost', 'tablet', 'Tablette oubliée à Lagos', 'Tablette dans une housse violette, probablement oubliée dans un espace de coworking.', 'Samsung', 'Tab S6 Lite', 'Gris', 'Lagos', 'Ikeja', '2026-05-02'],
  ['found', 'jewelry', 'Bracelet trouvé à Nairobi', 'Bracelet en métal doré trouvé près d’une entrée de centre commercial. Il porte une petite perle bleue.', '', '', 'Doré', 'Nairobi', 'Westlands', '2026-04-24'],
  ['lost', 'documents', 'Dossier de candidature perdu à Paris', 'Dossier cartonné bleu contenant des photocopies sans numéro d’identification réel. Perdu dans le métro.', '', '', 'Bleu', 'Paris', 'Gare du Nord', '2026-04-16'],
  ['found', 'clothing', 'Veste légère trouvée à Montréal', 'Veste beige trouvée sur le dossier d’une chaise dans un espace public. Une étiquette intérieure porte seulement des initiales.', '', '', 'Beige', 'Montreal', 'Centre-ville', '2026-04-08'],
  ['lost', 'passport', 'Passeport fictif perdu à Londres', 'Document de démonstration au nom de Emily C. Aucun numéro ni donnée personnelle n’est affiché dans cette annonce.', '', '', 'Bordeaux', 'London', 'Camden', '2026-03-30'],
  ['found', 'notebook', 'Cahier trouvé à Abidjan', 'Cahier bleu trouvé dans une salle de formation. Les premières pages sont vierges et le nom du propriétaire n’est pas lisible.', '', '', 'Bleu', 'Abidjan', 'Plateau', '2026-03-22'],
  ['lost', 'phone', 'Téléphone noir perdu à Abidjan', 'Téléphone avec une coque noire mate. Je l’ai utilisé pour la dernière fois près de la gare de Bassam.', 'Xiaomi', 'Redmi Note 12', 'Noir', 'Abidjan', 'Port-Bouet', '2026-03-14'],
  ['found', 'electronics', 'Calculatrice trouvée à Abidjan', 'Calculatrice scientifique trouvée dans une salle de cours. Elle porte des traces d’usage mais fonctionne encore.', 'Sharp', 'EL-531', 'Noir', 'Abidjan', 'Cocody', '2026-03-06'],
  ['lost', 'bag', 'Sac de sport perdu à Dakar', 'Sac de sport noir avec une serviette orange. Perdu après un entraînement, sans objet de valeur connu.', '', '', 'Noir', 'Dakar', 'Mermoz', '2026-02-27'],
  ['found', 'keys', 'Clés trouvées à Bouaké', 'Deux clés attachées à un porte-clés en bois. Trouvées devant une pharmacie du quartier Commerce.', '', '', 'Métal', 'Bouake', 'Commerce', '2026-02-19'],
  ['lost', 'jewelry', 'Boucle d’oreille perdue à Abidjan', 'Une seule boucle d’oreille argentée, petite pierre bleue. Elle a pu tomber près d’un arrêt de bus.', '', '', 'Argenté', 'Abidjan', 'Angré', '2026-02-11'],
  ['found', 'computer', 'Housse d’ordinateur trouvée à Accra', 'Housse noire vide trouvée dans une salle de réunion. Une étiquette blanche est collée sur le côté.', '', '', 'Noir', 'Accra', 'Airport City', '2026-02-03'],
  ['lost', 'notebook', 'Trousse scolaire perdue à Yamoussoukro', 'Trousse rouge avec deux stylos et une règle. Perdue pendant le trajet vers le lycée.', '', '', 'Rouge', 'Yamoussoukro', 'Morofe', '2026-01-26'],
  ['found', 'luggage', 'Valise cabine trouvée à Cotonou', 'Petite valise grise trouvée près d’un arrêt. Elle est fermée et ne sera ouverte que pour vérification par son propriétaire.', '', '', 'Gris', 'Cotonou', 'Zongo', '2026-01-18'],
  ['lost', 'bank-card', 'Carte bancaire perdue à Abidjan', 'Carte de démonstration sans numéro réel. Merci de ne pas publier de photo et de signaler uniquement le lieu de découverte.', '', '', 'Bleu', 'Abidjan', 'Deux-Plateaux', '2026-01-10'],
  ['found', 'wallet', 'Portefeuille trouvé à Lagos', 'Portefeuille brun trouvé dans un bus. Il est vide à l’exception d’un ticket de transport.', '', '', 'Brun', 'Lagos', 'Yaba', '2026-01-03'],
  ['lost', 'book', 'Roman perdu à Abidjan', 'Livre de poche avec une couverture un peu abîmée. Je l’ai probablement laissé dans une bibliothèque.', '', '', 'Rouge', 'Abidjan', 'Cocody', '2025-12-26'],
  ['found', 'phone', 'Téléphone trouvé à Nairobi', 'Téléphone noir trouvé près d’un distributeur. Il est éteint et protégé par un étui transparent.', 'Nokia', 'G22', 'Noir', 'Nairobi', 'Kilimani', '2025-12-18'],
  ['lost', 'documents', 'Certificat de formation perdu à Lomé', 'Chemise contenant un certificat fictif et des copies neutres. Aucun numéro officiel n’est affiché.', '', '', 'Blanc', 'Lome', 'Bè', '2025-12-10'],
  ['found', 'other', 'Lunettes trouvées à Paris', 'Lunettes à monture écaille trouvées sur un banc près d’une station. Étui noir à côté.', '', '', 'Marron', 'Paris', 'Montparnasse', '2025-12-02'],
  ['lost', 'keys', 'Clés perdues à Abidjan', 'Petit trousseau avec un porte-clés en forme de feuille. Perdu dans le secteur de Riviera 2.', '', '', 'Argenté', 'Abidjan', 'Riviera 2', '2025-11-24'],
  ['found', 'bag', 'Sac à dos trouvé à Montréal', 'Sac gris trouvé dans une salle d’attente. Il contient seulement des fournitures scolaires.', '', '', 'Gris', 'Montreal', 'Rosemont', '2025-11-16'],
  ['lost', 'electronics', 'Écouteurs perdus à Londres', 'Écouteurs blancs dans un boîtier compact. Perdus lors d’un trajet en métro.', 'Sony', '', 'Blanc', 'London', 'Brixton', '2025-11-08'],
  ['found', 'jewelry', 'Collier trouvé à Abidjan', 'Petit collier argenté trouvé sur une table de café. Un pendentif rond y est attaché.', '', '', 'Argenté', 'Abidjan', 'Zone 4', '2025-10-31'],
  ['lost', 'computer', 'Chargeur d’ordinateur perdu à Abidjan', 'Chargeur noir avec câble assez long, oublié dans une salle de réunion. La marque est peu visible.', 'HP', '', 'Noir', 'Abidjan', 'Plateau', '2025-10-23'],
  ['found', 'notebook', 'Agenda trouvé à Dakar', 'Agenda vert trouvé dans un taxi. Les pages sont fermées et aucune information privée n’est publiée.', '', '', 'Vert', 'Dakar', 'Fann', '2025-10-15'],
  ['lost', 'clothing', 'Foulard perdu à Cotonou', 'Foulard jaune à motifs discrets, perdu dans un marché très fréquenté.', '', '', 'Jaune', 'Cotonou', 'Saint-Michel', '2025-10-07'],
  ['found', 'documents', 'Pochette de documents trouvée à Abidjan', 'Pochette transparente trouvée après une réunion. Les documents sont fictifs et seront remis après vérification.', '', '', 'Transparent', 'Abidjan', 'Treichville', '2025-09-29'],
  ['lost', 'tablet', 'Tablette perdue à Accra', 'Tablette grise dans une housse noire, oubliée dans une bibliothèque universitaire.', 'Apple', 'iPad 9', 'Gris', 'Accra', 'Legon', '2025-09-21'],
  ['found', 'keys', 'Trousseau trouvé à Yopougon', 'Trois clés sur un anneau métallique sans inscription. Trouvé près d’un arrêt de gbaka.', '', '', 'Métal', 'Abidjan', 'Yopougon', '2025-09-13'],
  ['lost', 'wallet', 'Portefeuille perdu à Abidjan', 'Portefeuille en toile bleu foncé, sans argent important mais avec des cartes de fidélité.', '', '', 'Bleu marine', 'Abidjan', 'Marcory', '2025-09-05'],
  ['found', 'book', 'Manuel trouvé à Kumasi', 'Manuel scolaire trouvé dans une salle de classe, couverture verte et pages annotées.', '', '', 'Vert', 'Kumasi', 'Bantama', '2025-08-28'],
  ['lost', 'phone', 'Téléphone perdu à Bouaké', 'Téléphone avec coque jaune, perdu après une course en taxi. L’écran présente une petite rayure.', 'Tecno', 'Camon 20', 'Noir', 'Bouake', 'Air France', '2025-08-20'],
  ['found', 'other', 'Parapluie trouvé à Paris', 'Parapluie pliant bleu trouvé à l’entrée d’un immeuble. Une étiquette porte les lettres A.M.', '', '', 'Bleu', 'Paris', 'Belleville', '2025-08-12'],
  ['lost', 'bag', 'Sac en toile perdu à Abidjan', 'Sac en toile beige avec un cahier et une bouteille vide. Perdu dans le quartier des affaires.', '', '', 'Beige', 'Abidjan', 'Plateau', '2025-08-04'],
];

const idFor = (kind, index) => {
  const hex = crypto.createHash('sha256').update(`retrova-demo:${kind}:${index}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20).join('')}`;
};

const imageFor = (index) => index < 30 ? IMAGE_FILES[index % IMAGE_FILES.length] : null;
const userForItem = (index) => index < 10 ? index : index < 20 ? 10 + ((index - 10) % 10) : index % users.length;
const createdAtFor = (eventDate, index) => `${eventDate}T${String(8 + (index % 10)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00Z`;

function assertAssets() {
  for (const filename of IMAGE_FILES) {
    const filePath = path.join(IMAGE_DIR, filename);
    if (!fs.existsSync(filePath)) throw new Error(`Image DEMO introuvable: ${filePath}`);
  }
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function ensureSchema() {
  if (!isPostgres) throw new Error('seed-demo et clear-demo nécessitent DATABASE_URL (PostgreSQL).');
  await DatabaseAdapter.initializeDatabase();
  await DatabaseAdapter.ensurePublicIds();
  await DatabaseAdapter.ensureDemoColumns();
}

async function seed() {
  assertAssets();
  await ensureSchema();
  const client = await DatabaseAdapter.pool.connect();
  try {
    await client.query('BEGIN');
    const userIds = [];
    for (const user of users) {
      const id = idFor('user', user.index);
      userIds.push(id);
      const password = crypto.randomBytes(24).toString('base64url');
      const passwordHash = await bcryptjs.hash(password, 10);
      await client.query(`
        INSERT INTO users (id, public_id, name, first_name, last_name, email, phone, password_hash, city, role, status, email_verified, preferred_locale, is_demo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, $8, 'user', 'active', TRUE, $9, TRUE, $10, $10)
        ON CONFLICT (id) DO UPDATE SET public_id = EXCLUDED.public_id, name = EXCLUDED.name, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, city = EXCLUDED.city, preferred_locale = EXCLUDED.preferred_locale, is_demo = TRUE, status = 'active', updated_at = EXCLUDED.updated_at
        WHERE users.is_demo = TRUE`,
        [id, `RTV-DEMO-${String(user.index + 1).padStart(2, '0')}`, `${user.firstName} ${user.lastName}`, user.firstName, user.lastName, `demo.${String(user.index + 1).padStart(2, '0')}@${DEMO_EMAIL_DOMAIN}`, passwordHash, user.city, user.locale, new Date(Date.UTC(2025, 8 - (user.index % 8), 1 + user.index, 9, 0, 0))]
      );
    }

    for (let index = 0; index < itemSeed.length; index += 1) {
      const [type, category, title, description, brand, model, color, city, district, eventDate] = itemSeed[index];
      const filename = imageFor(index, category);
      const itemId = idFor('item', index);
      const userId = userIds[userForItem(index)];
      const createdAt = createdAtFor(eventDate, index);
      await client.query(`
        INSERT INTO items (id, user_id, type, category, title, description, brand, model, color, city, district, location_description, event_date, photo_filename, photo_url, is_anonymous, status, views_count, is_demo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''), NULLIF($8, ''), $9, $10, $11, $12, $13, $14, $15, FALSE, 'active', $16, TRUE, $17, $17)
        ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, type = EXCLUDED.type, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, brand = EXCLUDED.brand, model = EXCLUDED.model, color = EXCLUDED.color, city = EXCLUDED.city, district = EXCLUDED.district, event_date = EXCLUDED.event_date, photo_filename = EXCLUDED.photo_filename, photo_url = EXCLUDED.photo_url, is_demo = TRUE, status = 'active', updated_at = EXCLUDED.updated_at
        WHERE items.is_demo = TRUE`,
        [itemId, userId, type, category, title, description, brand, model, color, city, district, `Zone de démonstration près de ${district}`, eventDate, filename, filename ? `/images/annonces/${encodeURIComponent(filename)}` : null, (index * 13) % 240, createdAt]
      );
    }
    await client.query('COMMIT');
    console.log(`Seed DEMO terminé: ${users.length} utilisateurs, ${itemSeed.length} annonces, ${itemSeed.filter((_, index) => imageFor(index)).length} avec image.`);
    console.log('Les comptes DEMO utilisent des emails @demo.retrova.invalid; aucun mot de passe n’est écrit dans le code.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await DatabaseAdapter.close();
  }
}

async function clear() {
  await ensureSchema();
  const client = await DatabaseAdapter.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM reports WHERE user_id IN (SELECT id FROM users WHERE is_demo = TRUE) OR item_id IN (SELECT id FROM items WHERE is_demo = TRUE)`);
    await client.query(`DELETE FROM ownership_proofs WHERE user_id IN (SELECT id FROM users WHERE is_demo = TRUE) OR item_id IN (SELECT id FROM items WHERE is_demo = TRUE)`);
    await client.query(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE is_demo = TRUE) OR related_user_id IN (SELECT id FROM users WHERE is_demo = TRUE) OR related_item_id IN (SELECT id FROM items WHERE is_demo = TRUE)`);
    await client.query(`DELETE FROM messages WHERE sender_id IN (SELECT id FROM users WHERE is_demo = TRUE) OR receiver_id IN (SELECT id FROM users WHERE is_demo = TRUE) OR item_id IN (SELECT id FROM items WHERE is_demo = TRUE)`);
    await client.query(`DELETE FROM blocked_users WHERE blocker_id IN (SELECT id FROM users WHERE is_demo = TRUE) OR blocked_id IN (SELECT id FROM users WHERE is_demo = TRUE)`);
    await client.query(`DELETE FROM matches WHERE lost_item_id IN (SELECT id FROM items WHERE is_demo = TRUE) OR found_item_id IN (SELECT id FROM items WHERE is_demo = TRUE)`);
    await client.query(`DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE is_demo = TRUE) OR entity_id IN (SELECT id FROM items WHERE is_demo = TRUE) OR entity_id IN (SELECT id FROM users WHERE is_demo = TRUE)`);
    const items = await client.query('DELETE FROM items WHERE is_demo = TRUE');
    const usersRemoved = await client.query('DELETE FROM users WHERE is_demo = TRUE AND role != \'admin\'');
    await client.query('COMMIT');
    console.log(`Nettoyage DEMO terminé: ${usersRemoved.rowCount} utilisateurs et ${items.rowCount} annonces supprimés. Les fichiers originaux n’ont pas été touchés.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await DatabaseAdapter.close();
  }
}

(async () => {
  try {
    const command = process.argv[2] || 'seed';
    if (!['seed', 'clear'].includes(command)) throw new Error('Commande attendue: seed ou clear');
    await (command === 'seed' ? seed() : clear());
  } catch (error) {
    console.error(`Erreur ${process.argv[2] || 'seed'}-demo:`, error.message);
    process.exitCode = 1;
  }
})();
