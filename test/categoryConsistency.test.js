const test = require('node:test');
const assert = require('node:assert/strict');
const {
    categories,
    categoryDefinitions,
    subcategoryDefinitions,
    subcategoryCategory,
    legacyCategoryMap,
    legacySubcategory,
    isValidSubcategory
} = require('../src/services/itemService');
const { imageFor, idFor, itemSeed } = require('../scripts/seedDemo');

test('le référentiel contient exactement 12 catégories et aucune sous-catégorie dupliquée', () => {
    assert.equal(categories.length, 12);
    assert.equal(new Set(categories).size, categories.length);
    assert.deepEqual(categoryDefinitions.map(({ id }) => id), categories);

    const subcategories = Object.values(subcategoryDefinitions).flat();
    assert.equal(new Set(subcategories.map(({ value }) => value)).size, subcategories.length);
    for (const [category, entries] of Object.entries(subcategoryDefinitions)) {
        for (const entry of entries) assert.equal(subcategoryCategory[entry.value], category);
    }
});

test('les anciennes catégories restent compatibles et chaque annonce seedée garde son couple catégorie/sous-catégorie', () => {
    for (const [legacyCategory, canonicalCategory] of Object.entries(legacyCategoryMap)) {
        const subcategory = legacySubcategory(legacyCategory, 'Objet de démonstration');
        assert.equal(isValidSubcategory(canonicalCategory, subcategory), true, `${legacyCategory} doit rester migrable`);
    }

    const normalized = itemSeed.map(([type, category, title], index) => ({
        id: idFor('item', index),
        type,
        category: legacyCategoryMap[category] || category,
        subcategory: legacySubcategory(category, title),
        image: imageFor(idFor('item', index))
    }));

    for (const item of normalized) assert.equal(isValidSubcategory(item.category, item.subcategory), true, `${item.id} doit avoir une sous-catégorie de sa catégorie`);

    const lenovo = normalized[5];
    assert.deepEqual({ category: lenovo.category, subcategory: lenovo.subcategory, image: lenovo.image }, {
        category: 'electronics', subcategory: 'electronics:laptop', image: 'annonce_pc_lenovo_x260_perdu.jpg'
    });

    const calculator = normalized[22];
    assert.deepEqual({ category: calculator.category, subcategory: calculator.subcategory, image: calculator.image }, {
        category: 'electronics', subcategory: 'electronics:calculator', image: 'annonce_calculatrice_sharp_perdu.jpg'
    });
});
