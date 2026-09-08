const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { IMAGE_DIR, imageByItemId, imageFor, idFor, itemSeed } = require('../scripts/seedDemo');

test('le seed associe chaque image à un item compatible par son ID', () => {
    const validTypes = new Set(['lost', 'found']);
    const items = itemSeed.map(([type, category, title, description, brand, model, color, city, district, eventDate], index) => {
        assert.equal(validTypes.has(type), true, `type invalide à l'index ${index}`);
        for (const [field, value] of Object.entries({ category, title, description, color, city, district, eventDate })) {
            assert.equal(typeof value, 'string', `${field} doit être du texte à l'index ${index}`);
            assert.ok(value.trim(), `${field} manquant à l'index ${index}`);
        }
        assert.match(eventDate, /^\d{4}-\d{2}-\d{2}$/, `date invalide à l'index ${index}`);
        return { id: idFor('item', index), type, category, title };
    });
    const imageOwners = new Map();

    for (const item of items) {
        const filename = imageFor(item.id);
        if (!filename) continue;

        assert.equal(fs.existsSync(path.join(IMAGE_DIR, filename)), true, `${filename} doit exister`);
        assert.equal(imageOwners.has(filename), false, `${filename} ne doit appartenir qu'à un item`);
        imageOwners.set(filename, item.id);

        const compatibility = filename.includes('calculatrice')
            ? item.category === 'electronics' && /calculatrice/i.test(item.title) && item.type === 'found'
            : filename.includes('lenovo')
                ? item.category === 'computer' && /lenovo/i.test(item.title) && item.type === 'lost'
                : filename.includes('roman')
                    ? item.category === 'book' && /roman|livre/i.test(item.title)
                    : filename.includes('lotissement')
                        ? item.category === 'documents' && item.type === 'lost'
                        : false;
        assert.equal(compatibility, true, `${item.id} doit être compatible avec ${filename}`);
    }

    assert.equal(imageByItemId.size, imageOwners.size);
});