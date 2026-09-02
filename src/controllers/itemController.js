const { v4: uuidv4 } = require('uuid');
const { isValidDate, categories, categoryLabels } = require('../services/itemService');
const { createMatchesFor } = require('../services/matchingService');

const emptyForm = (type) => ({ type, category: '', title: '', description: '', brand: '', model: '', color: '', city: '', district: '', location_description: '', event_date: '' });

class ItemController {
    constructor(itemModel, communicationModel = null, userModel = null) {
        this.itemModel = itemModel;
        this.communicationModel = communicationModel;
        this.userModel = userModel;
    }

    showCreate = (req, res) => res.render('pages/item-form', { title: req.params.type === 'found' ? req.t('itemForm.publishFound', 'Déclarer un objet trouvé') : req.t('itemForm.publishLost', 'Déclarer un objet perdu'), formData: emptyForm(req.params.type), categories, categoryLabels, isEdit: false });

    create = async (req, res) => {
        const type = req.params.type;
        const formData = { ...emptyForm(type), ...req.body, type };
        const errors = this.validate(formData, req);
        if (errors.length) return res.status(422).render('pages/item-form', { title: req.t('itemForm.publishAd', 'Nouvelle annonce'), formData, categories, categoryLabels, errors, isEdit: false });
        try {
            const item = { ...formData, id: uuidv4(), user_id: req.session.userId, photo_filename: req.storedImage?.filename || null, photo_url: req.storedImage?.url || null, is_anonymous: formData.is_anonymous ? 1 : 0, status: 'active' };
            await this.itemModel.create(item);
            const saved = await this.itemModel.findById(item.id);
            const matches = await createMatchesFor(saved, this.itemModel);
            if (this.communicationModel) {
                for (const match of matches) {
                    await this.communicationModel.createNotification({ id: uuidv4(), userId: match.candidate.user_id, type: 'match', title: req.t('messages.newMatch', 'Nouvelle correspondance'), message: req.t('messages.matchingAd', '').replace('{title}', saved.title), itemId: saved.id });
                }
            }
            res.redirect(`/items/${item.id}?message=${encodeURIComponent(req.t('messages.published', 'Annonce publiée avec succès'))}`);
        } catch (error) {
            console.error('Erreur création annonce:', error);
            res.status(500).render('pages/item-form', { title: req.t('itemForm.publishAd', 'Nouvelle annonce'), formData, categories, categoryLabels, errors: [req.t('messages.publishError', 'Impossible de publier cette annonce.')], isEdit: false });
        }
    };

    search = async (req, res) => {
        try {
            const results = await this.itemModel.search(req.query);
            const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
            res.render('pages/search', {
                title: req.t('seo.searchTitle', 'Rechercher un objet perdu ou trouvé'),
                metaDescription: req.t('seo.searchDescription', 'Trouvez un objet perdu ou trouvé par ville, catégorie, mot-clé ou date sur RETROOVA.'),
                canonicalUrl,
                results: results.slice(0, 12),
                filters: req.query,
                categories,
                categoryLabels,
                page: Math.max(1, Number.parseInt(req.query.page, 10) || 1),
                hasNextPage: results.length > 12
            });
        } catch (error) {
            console.error('Erreur recherche:', error);
            res.status(500).render('pages/search', { title: req.t('seo.searchTitle', 'Rechercher un objet perdu ou trouvé'), results: [], filters: req.query, categories, categoryLabels, page: 1, hasNextPage: false, error: req.t('messages.searchError', 'La recherche est momentanément indisponible.') });
        }
    };

    map = async (req, res) => {
        const results = await this.itemModel.search(req.query);
        res.render('pages/map', { title: req.t('seo.mapTitle', 'Carte des annonces'), metaDescription: req.t('seo.mapDescription', 'Explorez les annonces actives par ville et quartier sur RETROOVA.'), results });
    };

    listMine = async (req, res) => {
        const type = req.params.type;
        const items = await this.itemModel.findByUser(req.session.userId, type);
        res.render('pages/my-items', { title: type === 'lost' ? req.t('myItems.titleLost', 'Mes objets perdus') : req.t('myItems.titleFound', 'Mes objets trouvés'), items, type });
    };

    listPublic = async (req, res, typeOverride = null) => {
        const type = typeOverride || req.query.type || 'lost';
        const filters = { ...req.query, type };
        const results = await this.itemModel.search(filters);
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const metaDescription = type === 'lost'
            ? req.t('seo.lostDescription', 'Consultez les objets perdus à retrouver près de vous sur RETROOVA. Recherchez par ville, catégorie et mot-clé.')
            : req.t('seo.foundDescription', 'Consultez les objets trouvés et retrouvez les propriétaires sur RETROOVA. Recherchez par ville, catégorie et mot-clé.');
        res.render('pages/search', {
            title: type === 'lost' ? req.t('search.lostTitle', 'Objets perdus') : req.t('search.foundTitle', 'Objets trouvés'),
            metaDescription,
            canonicalUrl,
            results: results.slice(0, 12),
            filters,
            categories,
            categoryLabels,
            page: Math.max(1, Number.parseInt(req.query.page, 10) || 1),
            hasNextPage: results.length > 12,
            type
        });
    };

    show = async (req, res) => {
        const item = await this.itemModel.findById(req.params.id);
        if (!item) {
            const slugCandidate = String(req.params.id || '').trim();
            const maybeBySlug = await this.itemModel.findBySlug(req.params.type || 'lost', slugCandidate);
            if (!maybeBySlug) return res.status(404).render('404', { title: req.t('seo.notFoundAd', 'Annonce introuvable') });
            return res.redirect(`/items/${maybeBySlug.id}`);
        }
        if (['closed', 'expired'].includes(item.status) && item.user_id !== req.session.userId) return res.status(404).render('404', { title: req.t('seo.notFoundAd', 'Annonce introuvable') });
        const matches = req.session.userId ? await this.itemModel.getMatchesForUser(req.session.userId) : [];
        const ownerReputation = this.userModel && !item.is_anonymous ? await this.userModel.getReputation(item.user_id) : null;
        const { categoryLabels } = require('../services/itemService');
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const metaDescription = `${item.type === 'lost' ? 'Objet perdu' : 'Objet trouvé'} : ${item.title}. ${item.city || 'Ville non précisée'}${item.district ? `, ${item.district}` : ''}. Consultez cette annonce RETROOVA et contactez le déclarant.`;
        res.render('pages/item-detail', {
            title: item.title,
            metaDescription,
            canonicalUrl,
            item,
            ownerReputation,
            categoryLabels,
            matches: matches.filter((match) => match.lost_item_id === item.id || match.found_item_id === item.id),
            message: req.query.message
        });
    };

    edit = async (req, res) => {
        const item = await this.itemModel.findById(req.params.id);
        if (!item || item.user_id !== req.session.userId) return res.status(403).render('403', { title: req.t('messages.forbidden', 'Accès refusé') });
        res.render('pages/item-form', { title: req.t('seo.editAd', 'Modifier mon annonce'), formData: item, categories, categoryLabels, isEdit: true, itemId: item.id });
    };

    update = async (req, res) => {
        const item = await this.itemModel.findById(req.params.id);
        if (!item || item.user_id !== req.session.userId) return res.status(403).render('403', { title: req.t('messages.forbidden', 'Accès refusé') });
        const formData = { ...item, ...req.body, type: item.type, status: item.status };
        const errors = this.validate(formData, req);
        if (errors.length) return res.status(422).render('pages/item-form', { title: req.t('seo.editAd', 'Modifier mon annonce'), formData, categories, categoryLabels, errors, isEdit: true, itemId: item.id });
        if (req.file) {
            formData.photo_filename = req.storedImage?.filename || req.file.filename;
            formData.photo_url = req.storedImage?.url || `/uploads/${req.file.filename}`;
        }
        await this.itemModel.update(item.id, req.session.userId, formData);
        const saved = await this.itemModel.findById(item.id);
        const matches = saved.status === 'active' ? await createMatchesFor(saved, this.itemModel) : [];
        if (this.communicationModel) {
            for (const match of matches) {
                await this.communicationModel.createNotification({ id: uuidv4(), userId: match.candidate.user_id, type: 'match', title: req.t('messages.newMatch', 'Nouvelle correspondance'), message: req.t('messages.matchingAd', '').replace('{title}', saved.title), itemId: saved.id });
            }
        }
        res.redirect(`/items/${item.id}?message=${encodeURIComponent(req.t('messages.updated', 'Annonce mise à jour'))}`);
    };

    matches = async (req, res) => {
        const matches = await this.itemModel.getMatchesForUser(req.session.userId);
        res.render('pages/matches', { title: req.t('matchesPage.title', 'Mes correspondances'), matches, message: req.query.message, error: req.query.error });
    };

    changeStatus = async (req, res) => {
        if (['active', 'returned', 'closed'].includes(req.body.status)) await this.itemModel.updateStatus(req.params.id, req.session.userId, req.body.status);
        res.redirect(`/items/${req.params.id}`);
    };

    remove = async (req, res) => {
        await this.itemModel.updateStatus(req.params.id, req.session.userId, 'closed');
        res.redirect('/dashboard');
    };

    report = async (req, res) => {
        const item = await this.itemModel.findById(req.params.id);
        if (!item) return res.status(404).render('404', { title: req.t('seo.notFoundAd', 'Annonce introuvable') });
        res.render('pages/report', { title: req.t('report.title', 'Signaler une annonce'), item, error: req.query.error });
    };

    submitReport = async (req, res) => {
        const { reason, description } = req.body;
        if (!reason) return res.redirect(`/items/${req.params.id}/report?error=${encodeURIComponent(req.t('messages.chooseReason', 'Choisissez un motif'))}`);
        await this.itemModel.createReport({ id: uuidv4(), reporterId: req.session.userId, itemId: req.params.id, reason, description });
        res.redirect(`/items/${req.params.id}?message=${encodeURIComponent(req.t('messages.reportSent', 'Signalement transmis'))}`);
    };

    submitProof = async (req, res) => {
        const item = await this.itemModel.findById(req.params.id);
        if (!item || item.type !== 'found' || item.user_id === req.session.userId) return res.redirect(`/items/${req.params.id}?message=${encodeURIComponent(req.t('messages.notAllowed', 'Cette annonce ne peut pas recevoir cette demande'))}`);
        if (!req.body.proofText || req.body.proofText.trim().length < 10) return res.redirect(`/items/${req.params.id}?message=${encodeURIComponent(req.t('messages.proofDetailed', 'La preuve doit être plus détaillée'))}`);
        await this.itemModel.createOwnershipProof({ id: uuidv4(), userId: req.session.userId, itemId: req.params.id, text: req.body.proofText.trim() });
        if (this.communicationModel) await this.communicationModel.createNotification({ id: uuidv4(), userId: item.user_id, type: 'claim', title: req.t('messages.recoveryRequest', 'Nouvelle demande de récupération'), message: req.t('messages.recoveryMessage', '').replace('{title}', item.title), itemId: item.id });
        res.redirect(`/items/${req.params.id}?message=${encodeURIComponent(req.t('messages.proofSent', 'Preuve envoyée au déclarant'))}`);
    };

    acceptMatch = async (req, res) => {
        const match = await this.itemModel.getMatchById(req.params.id);
        if (!match || match.status !== 'pending' || ![match.lost_owner_id, match.found_owner_id].includes(req.session.userId)) return res.status(403).render('403', { title: req.t('messages.forbidden', 'Accès refusé') });
        await this.itemModel.updateMatchStatus(match.id, 'confirmed');
        await this.itemModel.updateStatusById(match.lost_item_id, 'in_contact');
        await this.itemModel.updateStatusById(match.found_item_id, 'in_contact');
        if (this.communicationModel) await this.communicationModel.createNotification({ id: uuidv4(), userId: match.lost_owner_id === req.session.userId ? match.found_owner_id : match.lost_owner_id, type: 'match_confirmed', title: req.t('messages.acceptedMatch', 'Correspondance confirmée'), message: req.t('messages.acceptedMatchMessage', 'La demande a été acceptée. Vous pouvez maintenant échanger via RETROOVA.') });
        res.redirect('/matches');
    };

    rejectMatch = async (req, res) => {
        const match = await this.itemModel.getMatchById(req.params.id);
        if (!match || match.status !== 'pending' || ![match.lost_owner_id, match.found_owner_id].includes(req.session.userId)) return res.status(403).render('403', { title: req.t('messages.forbidden', 'Accès refusé') });
        await this.itemModel.updateMatchStatus(match.id, 'rejected');
        res.redirect('/matches');
    };

    confirmReturned = async (req, res) => {
        try {
            const match = await this.itemModel.getMatchById(req.params.id);
            if (!match || ![match.lost_owner_id, match.found_owner_id].includes(req.session.userId)) return res.status(403).render('403', { title: req.t('messages.forbidden', 'Accès refusé') });
            if (match.status === 'completed') return res.redirect('/matches');
            if (match.status !== 'confirmed') return res.redirect(`/matches?error=${encodeURIComponent(req.t('messages.matchMustBeConfirmed', 'La correspondance doit être confirmée avant la restitution'))}`);
            await this.itemModel.updateMatchStatus(match.id, 'completed');
            await this.itemModel.updateStatusById(match.lost_item_id, 'returned');
            await this.itemModel.updateStatusById(match.found_item_id, 'returned');
            if (this.communicationModel) {
                const message = req.t('messages.returnConfirmed', 'La restitution a été confirmée. Les deux annonces sont maintenant marquées comme restituées.');
                for (const userId of new Set([match.lost_owner_id, match.found_owner_id])) await this.communicationModel.createNotification({ id: uuidv4(), userId, type: 'returned', title: 'Objet restitué', message });
            }
            res.redirect(`/matches?message=${encodeURIComponent(req.t('messages.returnBoth', 'Restitution confirmée pour les deux utilisateurs'))}`);
        } catch (error) {
            console.error('Erreur confirmation restitution:', error);
            res.redirect(`/matches?error=${encodeURIComponent(req.t('messages.returnError', 'La restitution n’a pas pu être confirmée'))}`);
        }
    };

    validate(data, req) {
        const translate = req?.t || ((key, fallback) => fallback);
        const errors = [];
        if (!['lost', 'found'].includes(data.type)) errors.push(translate('itemForm.invalidType', 'Le type d’annonce est invalide.'));
        if (!categories.includes(data.category)) errors.push(translate('itemForm.chooseCategory', 'Choisissez une catégorie.'));
        if (!data.title || data.title.trim().length < 3) errors.push(translate('itemForm.titleMin', 'Le titre doit contenir au moins 3 caractères.'));
        if (!data.city || data.city.trim().length < 2) errors.push(translate('itemForm.cityRequired', 'La ville est obligatoire.'));
        if (data.event_date && !isValidDate(data.event_date)) errors.push(translate('itemForm.invalidDate', 'La date de l’événement est invalide.'));
        return errors;
    }
}

module.exports = ItemController;
