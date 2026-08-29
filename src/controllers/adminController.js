class AdminController {
    constructor(model) { this.model = model; }
    dashboard = async (req, res) => { const overview = await this.model.getOverview(); const items = await this.model.getRecentItems(); const reports = await this.model.getReports(); const users = await this.model.getUsers(); res.render('pages/admin', { title: 'Administration', overview, items, reports, users }); };
    updateReport = async (req, res) => { const { status, notes } = req.body; const allowed = ['pending', 'reviewed', 'resolved', 'dismissed']; if (allowed.includes(status)) await this.model.updateReport(req.params.id, status, notes); res.redirect('/admin'); };
    updateUser = async (req, res) => { if (['active', 'suspended', 'deleted'].includes(req.body.status)) await this.model.updateUserStatus(req.params.id, req.body.status); res.redirect('/admin'); };
    updateItem = async (req, res) => { if (['active', 'closed', 'returned'].includes(req.body.status)) await this.model.updateItemStatus(req.params.id, req.body.status); res.redirect('/admin'); };
}
module.exports = AdminController;
