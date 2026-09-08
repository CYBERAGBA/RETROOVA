const test = require('node:test');
const assert = require('node:assert/strict');
const {
    categories,
    categoryDefinitions,
    englishCategoryDefinitions,
    subcategoryDefinitions,
    englishSubcategoryDefinitions,
    englishCategoryLabels,
    englishSubcategoryLabels
} = require('../src/services/itemService');

test('les catégories anglaises gardent exactement la structure et les IDs français', () => {
    assert.equal(englishCategoryDefinitions.length, 12);
    assert.deepEqual(englishCategoryDefinitions.map(({ id }) => id), categories);
    assert.deepEqual(Object.keys(englishCategoryLabels).sort(), categories.slice().sort());

    for (const definition of categoryDefinitions) {
        const englishDefinition = englishCategoryDefinitions.find(({ id }) => id === definition.id);
        assert.ok(englishDefinition.label);
        assert.deepEqual(englishDefinition.subcategories.map(([id]) => id), definition.subcategories.map(([id]) => id));
        assert.equal(englishDefinition.subcategories.every(([, label]) => label && /[A-Za-z]/.test(label)), true);
    }

    const frenchSubcategoryCount = Object.values(subcategoryDefinitions).flat().length;
    assert.equal(Object.keys(englishSubcategoryLabels).length, frenchSubcategoryCount);
    assert.equal(Object.values(englishSubcategoryDefinitions).flat().length, frenchSubcategoryCount);
    assert.equal(Object.values(englishSubcategoryDefinitions).flat().every(({ value, label }) => value && label && /[A-Za-z]/.test(label)), true);
});
