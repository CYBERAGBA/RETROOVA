const { v4: uuidv4 } = require('uuid');

class CommunicationController {
    constructor(model, itemModel, userModel) { this.model = model; this.itemModel = itemModel; this.userModel = userModel; }
    index = async (req, res) => { const messages = (await this.model.getConversations(req.session.userId)).filter(Boolean); const conversations = Object.values(messages.reduce((groups, message) => { const otherId = message.sender_id === req.session.userId ? message.receiver_id : message.sender_id; const key = `${message.item_id || 'general'}:${otherId}`; if (!groups[key]) groups[key] = { ...message, messages: [] }; groups[key].messages.push(message); return groups; }, {})); const notifications = await this.model.getNotifications(req.session.userId); res.render('pages/messages', { title: 'Messages et notifications', messages, conversations: conversations.filter(Boolean), notifications, receiverId: req.query.to || '', itemId: req.query.item || '', error: req.query.error, message: req.query.message }); };
    send = async (req, res) => {
        const { receiverId, itemId, subject, message } = req.body;
        const sender = this.userModel ? await this.userModel.findById(req.session.userId) : null;
        const recipient = this.userModel ? await this.userModel.findByPublicId(receiverId) : null;
        const item = itemId && this.itemModel ? await this.itemModel.findById(itemId) : null;
        const blocked = recipient && this.model.isBlocked ? await this.model.isBlocked(recipient.id, req.session.userId) || await this.model.isBlocked(req.session.userId, recipient.id) : false;
        if (!recipient || recipient.id === req.session.userId || blocked || (itemId && (!item || item.user_id !== recipient.id)) || !message || message.trim().length < 2) return res.redirect(`/messages?error=${encodeURIComponent(req.t('messages.invalidMessage', 'Identifiant public, annonce ou message invalide ou bloqué'))}`);
        await this.model.sendMessage({ id: uuidv4(), notificationId: uuidv4(), senderId: req.session.userId, senderPublicId: sender?.public_id, receiverId: recipient.id, itemId, subject, message: message.trim(), notificationTitle: req.t('messages.newMessage', 'Nouveau message'), notificationMessage: req.t('messages.messageNotification', '{subject} vous a écrit. Identifiant public de l’expéditeur : {id}.').replace('{subject}', subject || req.t('communication.user', 'Un membre')).replace('{id}', sender?.public_id || req.t('communication.unknownId', 'non disponible')) });
        res.redirect(`/messages?message=${encodeURIComponent(req.t('messages.messageSent', 'Message envoyé'))}`);
    };
    read = async (req, res) => { await this.model.markMessageRead(req.params.id, req.session.userId); res.redirect('/messages'); };
    block = async (req, res) => { if (req.body.publicId && this.userModel) { const user = await this.userModel.findByPublicId(req.body.publicId); if (user && user.id !== req.session.userId) await this.model.blockUser(req.session.userId, user.id); } res.redirect('/messages'); };
    notifications = async (req, res) => { const notifications = await this.model.getNotifications(req.session.userId); res.render('pages/notifications', { title: req.t('notificationsPage.title', 'Notifications'), notifications }); };
    readAllNotifications = async (req, res) => { await this.model.markNotificationsRead(req.session.userId); res.redirect('/notifications'); };
}
module.exports = CommunicationController;
