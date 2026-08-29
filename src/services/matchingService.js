const { v4: uuidv4 } = require('uuid');

const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function scoreItems(source, candidate) {
    const breakdown = {};
    let score = 0;
    const add = (label, points, matches) => {
        breakdown[label] = matches ? points : 0;
        if (matches) score += points;
    };

    add('category', 20, normalize(source.category) === normalize(candidate.category));
    add('city', 15, normalize(source.city) === normalize(candidate.city));
    add('district', 5, source.district && candidate.district && normalize(source.district) === normalize(candidate.district));
    add('color', 10, source.color && candidate.color && normalize(source.color) === normalize(candidate.color));
    add('brand', 15, source.brand && candidate.brand && normalize(source.brand) === normalize(candidate.brand));
    add('model', 15, source.model && candidate.model && normalize(source.model) === normalize(candidate.model));
    const sourceDate = source.event_date && Date.parse(source.event_date);
    const candidateDate = candidate.event_date && Date.parse(candidate.event_date);
    add('date', 10, sourceDate && candidateDate && Math.abs(sourceDate - candidateDate) <= 3 * 24 * 60 * 60 * 1000);

    const sourceWords = new Set(normalize(`${source.title} ${source.description || ''}`).split(/\s+/).filter((word) => word.length > 3));
    const candidateWords = new Set(normalize(`${candidate.title} ${candidate.description || ''}`).split(/\s+/).filter((word) => word.length > 3));
    const sharedWords = [...sourceWords].filter((word) => candidateWords.has(word));
    add('details', 10, sharedWords.length > 0);

    return { score, breakdown };
}

async function createMatchesFor(item, itemModel) {
    if (!item || item.status !== 'active') return [];
    const candidates = await itemModel.findCandidates(item);
    const matches = [];
    for (const candidate of candidates) {
        const lostItem = item.type === 'lost' ? item : candidate;
        const foundItem = item.type === 'found' ? item : candidate;
        const result = scoreItems(lostItem, foundItem);
        if (result.score < 40 || await itemModel.findMatch(lostItem.id, foundItem.id)) continue;
        await itemModel.createMatch({
            id: uuidv4(),
            lostItemId: lostItem.id,
            foundItemId: foundItem.id,
            score: result.score,
            breakdown: result.breakdown
        });
        matches.push({ ...result, candidate });
    }
    return matches;
}

module.exports = { createMatchesFor, scoreItems };
