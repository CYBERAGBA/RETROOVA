class AdminController {
    constructor(model) { this.model = model; }
    dashboard = async (req, res) => {
        const [overview, items, reports, users, partnershipRequests] = await Promise.all([
            this.model.getOverview(),
            this.model.getRecentItems(),
            this.model.getReports(),
            this.model.getUsers(),
            this.model.getPartnershipRequests()
        ]);
        res.render('pages/admin', { title: req.t('common.admin', 'Administration'), overview, items, reports, users, partnershipRequests });
    };
    partnershipDetail = async (req, res) => {
        const partnershipRequest = await this.model.getPartnershipRequestById(req.params.id);
        if (!partnershipRequest) return res.status(404).render('404', { title: req.t('messages.notFound', 'Page non trouvée') });
        res.render('pages/admin-partnership-detail', { title: req.t('admin.requests', 'Demandes de partenariat'), request: partnershipRequest, csrfToken: req.session.csrfToken });
    };
    updatePartnershipRequest = async (req, res) => {
        const { status, admin_notes } = req.body;
        const allowed = ['new', 'in_progress', 'accepted', 'archived', 'rejected'];
        if (allowed.includes(status)) await this.model.updatePartnershipRequest(req.params.id, status, admin_notes);
        res.redirect(`/admin/partnerships/${req.params.id}`);
    };
    deletePartnershipRequest = async (req, res) => {
        await this.model.deletePartnershipRequest(req.params.id);
        res.redirect('/admin');
    };
    updateReport = async (req, res) => { const { status, notes } = req.body; const allowed = ['pending', 'reviewed', 'resolved', 'dismissed']; if (allowed.includes(status)) await this.model.updateReport(req.params.id, status, notes); res.redirect('/admin'); };
    updateUser = async (req, res) => { if (['active', 'suspended', 'deleted'].includes(req.body.status)) await this.model.updateUserStatus(req.params.id, req.body.status); res.redirect('/admin'); };
    updateItem = async (req, res) => { if (['active', 'closed', 'returned'].includes(req.body.status)) await this.model.updateItemStatus(req.params.id, req.body.status); res.redirect('/admin'); };
}
module.exports = AdminController;
