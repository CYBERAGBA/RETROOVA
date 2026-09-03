const faqItems = [
    {
        fr: { question: 'Comment retrouver un objet perdu ?', answer: 'Déclarez la perte, utilisez les filtres de recherche et comparez les annonces similaires pour identifier une correspondance fiable.' },
        en: { question: 'How can I find a lost item?', answer: 'Report your loss, use the search filters and compare similar listings to identify a reliable match.' }
    },
    {
        fr: { question: 'Que faire si j’ai trouvé un objet ?', answer: 'Publiez une annonce avec une description claire, le lieu et la date de découverte, puis attendez les échanges sécurisés sur la plateforme.' },
        en: { question: 'What should I do if I found an item?', answer: 'Post a listing with a clear description, the location and the date you found it, then wait for secure exchanges on the platform.' }
    },
    {
        fr: { question: 'Puis-je signaler une annonce suspecte ?', answer: 'Oui. Le système de signalement permet d’alerter la modération sur les annonces ou comportements anormaux.' },
        en: { question: 'Can I report a suspicious listing?', answer: 'Yes. The reporting system lets you alert the moderation team about unusual listings or behavior.' }
    }
];

const getLocalizedFaqItems = (locale) => faqItems.map((item) => item[locale] || item.fr);

const partnershipTypes = [
    'Entreprise',
    'Hôtel / Tourisme',
    'Aéroport / Compagnie aérienne',
    'Transport & mobilité',
    'École / Université',
    'Institution / Collectivité',
    'Événement',
    'Association / ONG',
    'Partenaire technologique',
    'Partenariat stratégique',
    'Autre'
];

const buildPartnershipPageMarkup = (csrfToken = '', locale = 'fr') => {
    const isFrench = locale === 'fr';
    const header = isFrench ? 'DEVENIR PARTENAIRE' : 'BECOME A PARTNER';
    const title = isFrench ? 'Parlons de votre projet' : "Let's talk about your project";
    const buttonText = isFrench ? 'Devenir partenaire' : 'Become a partner';
    const intro = isFrench
        ? '<p><strong>RETROOVA accompagne les organisations qui veulent créer un écosystème plus sûr, plus utile et plus connecté autour des objets retrouvés.</strong></p><p>Que vous soyez une entreprise, une structure publique, un établissement d\'accueil, un réseau de transport ou une institution locale, votre collaboration peut aider davantage de personnes à retrouver ce qu\'elles ont perdu.</p>'
        : '<p><strong>RETROOVA supports organizations that want to build a safer, more useful and better connected ecosystem around recovered items.</strong></p><p>Whether you are a company, public body, welcoming establishment, transport network or local institution, your collaboration can help more people recover what they have lost.</p>';
    const formLabel = isFrench ? 'Nom / Organisation *' : 'Organization / Company *';
    const contactLabel = isFrench ? 'Nom du contact *' : 'Contact name *';
    const emailLabel = isFrench ? 'Email professionnel *' : 'Professional email *';
    const typeLabel = isFrench ? 'Type de partenariat *' : 'Partnership type *';
    const countryLabel = isFrench ? 'Pays / Région' : 'Country / Region';
    const messageLabel = isFrench ? 'Votre projet ou proposition' : 'Your project or proposal';
    const submitText = isFrench ? 'Envoyer une demande de partenariat' : 'Send a partnership request';
    const noteText = isFrench
        ? 'Nous étudions chaque demande avec attention et vous recontacterons dans les meilleurs délais.'
        : 'We review every request carefully and will get back to you as soon as possible.';

    return `
        <section class="partnership-hero">
            <div class="partnership-visual">
                <img src="/images/image_partenaires.png" alt="Illustration de partenaires RETROOVA" loading="lazy">
            </div>
            <div class="partnership-copy">
                <span class="eyebrow partnership-label">RETROOVA PARTNERS</span>
                <h2>${isFrench ? 'Construisons le réseau mondial des objets perdus et retrouvés.' : "Building the world's lost & found network."}</h2>
                ${intro}
                <a href="#partnership-form" class="btn btn-primary">${buttonText} <span>→</span></a>
            </div>
        </section>
        <section>
            <h3>${isFrench ? 'Pourquoi collaborer avec RETROOVA ?' : 'Why collaborate with RETROOVA?'}</h3>
            <div class="info-value-list">
                <div><strong>🤝 ${isFrench ? 'Visibilité locale' : 'Local visibility'}</strong><p>${isFrench ? 'Rendez votre organisation visible dans des situations concrètes où des objets sont perdus, retrouvés et réclamés.' : 'Make your organization visible in concrete situations where lost, found and claimed items are involved.'}</p></div>
                <div><strong>🛡️ ${isFrench ? 'Sécurité renforcée' : 'Stronger security'}</strong><p>${isFrench ? 'Favorisez une gestion plus claire et plus fiable des objets retrouvés dans les lieux d\'accueil, les gares, les hôtels ou les campus.' : 'Create a clearer and more reliable process for managing recovered items in welcoming venues, stations, hotels or campuses.'}</p></div>
                <div><strong>📍 ${isFrench ? 'Réseau de confiance' : 'Trusted network'}</strong><p>${isFrench ? 'Consolidez des partenariats utiles entre acteurs publics, privés et institutionnels autour d\'un même objectif.' : 'Build useful partnerships between public, private and institutional actors around a common goal.'}</p></div>
                <div><strong>💬 ${isFrench ? 'Expérience utilisateur' : 'User experience'}</strong><p>${isFrench ? 'Offrez à vos visiteurs un service simple, utile et rassurant en intégrant une solution de restitution d\'objets.' : 'Give your visitors a simple, useful and reassuring service by integrating a lost-item recovery solution.'}</p></div>
            </div>
        </section>
        <section>
            <h3>${isFrench ? 'Les organisations qui peuvent participer' : 'Organizations that can participate'}</h3>
            <ul>
                <li>${isFrench ? 'hôtels, aéroports, gares et entreprises de transport ;' : 'hotels, airports, stations and transport companies;'}</li>
                <li>${isFrench ? 'universités, écoles, centres culturels et établissements publics ;' : 'universities, schools, cultural centers and public institutions;'}</li>
                <li>${isFrench ? 'structures sociales, associations et organisations locales ;' : 'social organizations, associations and local bodies;'}</li>
                <li>${isFrench ? 'plateformes ou services qui souhaitent accompagner les usagers dans la recherche d\'objets perdus.' : 'platforms or services that want to support users in their search for lost items.'}</li>
            </ul>
        </section>
        <section>
            <h3>${isFrench ? 'Comment se déroule un partenariat ?' : 'How does a partnership work?'}</h3>
            <ol>
                <li><strong>${isFrench ? 'Échange de besoins' : 'Needs assessment'}</strong> : ${isFrench ? 'nous identifions les usages, les enjeux et les objectifs de votre organisation.' : 'we identify your needs, priorities and objectives.'}</li>
                <li><strong>${isFrench ? 'Définition du cadre' : 'Scope definition'}</strong> : ${isFrench ? 'nous précisons les modalités de diffusion, de sensibilisation et d\'accompagnement.' : 'we define the framework for communication, awareness and support.'}</li>
                <li><strong>${isFrench ? 'Activation' : 'Launch'}</strong> : ${isFrench ? 'le partenariat est lancé avec une mise en œuvre adaptée à votre contexte.' : 'the partnership is launched with an implementation tailored to your context.'}</li>
                <li><strong>${isFrench ? 'Suivi' : 'Follow-up'}</strong> : ${isFrench ? 'nous évaluons les résultats et ajustons la collaboration en fonction des retours.' : 'we assess the results and adjust the collaboration based on feedback.'}</li>
            </ol>
        </section>
        <section id="partnership-form" class="partnership-form-wrap">
            <div class="partnership-form-box">
                <div class="partnership-form-header">
                    <span class="eyebrow">${header}</span>
                    <h3>${title}</h3>
                </div>
                <form method="POST" action="/partnerships" class="partnership-form">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <div class="form-grid">
                        <label class="form-group"><span>${formLabel}</span><input type="text" name="organization_name" placeholder="${isFrench ? 'Ex. ABC Hotels' : 'Ex. ABC Hotels'}" required></label>
                        <label class="form-group"><span>${contactLabel}</span><input type="text" name="contact_name" placeholder="${isFrench ? 'Votre nom' : 'Your name'}" required></label>
                        <label class="form-group"><span>${emailLabel}</span><input type="email" name="email" placeholder="contact@company.com" required></label>
                        <label class="form-group"><span>${typeLabel}</span><select name="partnership_type" required><option value="">${isFrench ? 'Sélection :' : 'Select :'}</option>
                            <option>${isFrench ? 'Entreprise' : 'Company'}</option>
                            <option>${isFrench ? 'Hôtel / Tourisme' : 'Hotel / Tourism'}</option>
                            <option>${isFrench ? 'Aéroport / Compagnie aérienne' : 'Airport / Airline'}</option>
                            <option>${isFrench ? 'Transport & mobilité' : 'Transport & mobility'}</option>
                            <option>${isFrench ? 'École / Université' : 'School / University'}</option>
                            <option>${isFrench ? 'Institution / Collectivité' : 'Institution / Public body'}</option>
                            <option>${isFrench ? 'Événement' : 'Event'}</option>
                            <option>${isFrench ? 'Association / ONG' : 'Association / NGO'}</option>
                            <option>${isFrench ? 'Partenaire technologique' : 'Technology partner'}</option>
                            <option>${isFrench ? 'Partenariat stratégique' : 'Strategic partnership'}</option>
                            <option>${isFrench ? 'Autre' : 'Other'}</option>
                        </select></label>
                        <label class="form-group form-span-2"><span>${countryLabel}</span><input type="text" name="country" placeholder="${isFrench ? 'Votre pays ou région' : 'Your country or region'}"></label>
                        <label class="form-group form-span-2"><span>${messageLabel}</span><textarea name="message" rows="5" placeholder="${isFrench ? 'Expliquez-nous brièvement comment vous envisagez une collaboration avec RETROOVA...' : 'Briefly tell us how you envision a collaboration with RETROOVA...'}"></textarea></label>
                    </div>
                    <button type="submit" class="btn btn-primary partnership-submit">${submitText} <span>→</span></button>
                    <p class="partnership-note">${noteText}</p>
                </form>
            </div>
        </section>
`;
};

const pages = {
    '/how-it-works': {
        fr: ['Comment ça marche', 'RETROOVA aide à rapprocher les objets perdus de leurs propriétaires.', `
            <section>
                <h2>Comment fonctionne RETROOVA ?</h2>
                <p><strong>Perdu quelque chose ? Trouvé un objet ? RETROOVA vous aide à rapprocher les deux.</strong></p>
                <p>RETROOVA est une plateforme dédiée aux objets et documents perdus et trouvés. Notre objectif est simple : faciliter leur identification et leur restitution, tout en protégeant les utilisateurs.</p>
            </section>
            <section>
                <h3>Vous avez perdu un objet ?</h3>
                <ol>
                    <li><strong>Déclarez votre perte</strong> : décrivez l'objet, sa catégorie, sa marque, sa couleur, le lieu approximatif et la date de perte. Vous pouvez également ajouter une photo.</li>
                    <li><strong>Recherchez les objets trouvés</strong> : consultez les annonces correspondant à votre recherche et utilisez les filtres pour trouver plus rapidement ce que vous cherchez.</li>
                    <li><strong>Recevez des correspondances</strong> : RETROOVA compare les informations disponibles afin d'identifier les annonces qui pourraient correspondre à votre objet.</li>
                    <li><strong>Vérifiez avant de récupérer</strong> : si une correspondance semble pertinente, vous pourrez échanger avec le déclarant et fournir les informations permettant de confirmer que l'objet vous appartient.</li>
                    <li><strong>Retrouvez votre objet</strong> : une fois la propriété confirmée, les utilisateurs peuvent convenir ensemble des modalités de restitution.</li>
                </ol>
            </section>
            <section>
                <h3>Vous avez trouvé un objet ?</h3>
                <p>Vous pouvez également contribuer à aider quelqu'un à retrouver ce qu'il a perdu.</p>
                <p><strong>Déclarez l'objet trouvé</strong>, indiquez où et quand vous l'avez découvert et fournissez une description suffisamment précise.</p>
                <blockquote>Un objet perdu n'est pas forcément un objet définitivement perdu.</blockquote>
            </section>
        `],
        en: ['How RETROOVA works', 'RETROOVA helps bring lost items back to their owners.', `
            <section>
                <h2>How RETROOVA works</h2>
                <p><strong>Lost something? Found an item? RETROOVA helps connect both sides.</strong></p>
                <p>RETROOVA is a platform for lost and found items and documents. Our goal is to simplify identification and return while protecting users.</p>
            </section>
            <section>
                <h3>Have you lost an item?</h3>
                <ol>
                    <li><strong>Report the loss</strong>: describe the item, category, brand, colour, approximate location and date. You can also add a photo.</li>
                    <li><strong>Search for found items</strong>: review listings matching your search and use the filters to find the right item faster.</li>
                    <li><strong>Receive matches</strong>: RETROOVA compares available information to identify listings that may match your item.</li>
                    <li><strong>Verify before picking it up</strong>: if a match seems relevant, you can exchange with the finder and provide information that confirms ownership.</li>
                    <li><strong>Get it back</strong>: once ownership is confirmed, both parties can arrange the return.</li>
                </ol>
            </section>
            <section>
                <h3>Have you found an item?</h3>
                <p>You can also help someone recover what they lost.</p>
                <p><strong>Report the found item</strong>, indicate where and when you found it and provide a precise description.</p>
                <blockquote>A lost item is not necessarily lost forever.</blockquote>
            </section>
        `]
    },
    '/about': {
        fr: ['À propos de RETROOVA', 'Une plateforme conçue pour rapprocher les objets perdus de leurs propriétaires.', `
            <section>
                <h2>À propos de RETROOVA</h2>
                <p><strong>RETROOVA est une plateforme conçue pour rapprocher les objets perdus de leurs propriétaires.</strong></p>
                <p>Chaque jour, des personnes perdent des téléphones, portefeuilles, documents, clés, sacs, bagages et de nombreux autres objets.</p>
                <p>Dans le même temps, d'autres personnes retrouvent ces objets sans toujours savoir comment retrouver leur propriétaire.</p>
                <p><strong>RETROOVA crée le lien entre ces deux situations.</strong></p>
            </section>
        `],
        en: ['About RETROOVA', 'A platform designed to reconnect lost items with their owners.', `
            <section>
                <h2>About RETROOVA</h2>
                <p><strong>RETROOVA is a platform designed to reconnect lost items with their owners.</strong></p>
                <p>Every day, people lose phones, wallets, documents, keys, bags, luggage and many other objects.</p>
                <p>At the same time, other people often find these items without knowing how to reach the owner.</p>
                <p><strong>RETROOVA creates the connection between these two situations.</strong></p>
            </section>
        `]
    },
    '/privacy': {
        fr: ['Politique de confidentialité', 'Protection des données, sécurité des utilisateurs et transparence.', `
            <section>
                <h2>Politique de confidentialité</h2>
                <p><strong>Dernière mise à jour : 24 août 2026</strong></p>
                <p>RETROOVA accorde une importance particulière à la protection des données personnelles de ses utilisateurs.</p>
                <p>La présente politique explique quelles informations peuvent être collectées, pourquoi elles sont utilisées et quelles mesures sont mises en place pour les protéger.</p>
            </section>
        `],
        en: ['Privacy policy', 'Data protection, user security and transparency.', `
            <section>
                <h2>Privacy policy</h2>
                <p><strong>Last updated: August 24, 2026</strong></p>
                <p>RETROOVA places special importance on protecting the personal data of its users.</p>
                <p>This policy explains what information may be collected, why it is used and what measures are taken to protect it.</p>
            </section>
        `]
    },
    '/terms': {
        fr: ["Conditions d'utilisation", 'Les règles essentielles pour une utilisation sûre et responsable de RETROOVA.', `
            <section>
                <h2>Conditions d’utilisation</h2>
                <p><strong>Dernière mise à jour : 24 août 2026</strong></p>
                <p>Bienvenue sur RETROOVA. En utilisant la plateforme, vous acceptez les présentes conditions.</p>
            </section>
        `],
        en: ['Terms of use', 'The key rules for a safe and responsible use of RETROOVA.', `
            <section>
                <h2>Terms of use</h2>
                <p><strong>Last updated: August 24, 2026</strong></p>
                <p>Welcome to RETROOVA. By using the platform, you agree to these terms.</p>
            </section>
        `]
    },
    '/contact': {
        fr: ['Contact', 'Une question, une suggestion ou un problème ?', `
            <section>
                <h2>Contactez RETROOVA</h2>
                <p><strong>Une question, une suggestion ou un problème ? Notre équipe est à votre écoute.</strong></p>
            </section>
        `],
        en: ['Contact', 'A question, a suggestion or a problem?', `
            <section>
                <h2>Contact RETROOVA</h2>
                <p><strong>A question, a suggestion or a problem? Our team is here to help.</strong></p>
            </section>
        `]
    },
    '/partnerships': {
        fr: ['Partenariats', 'Des collaborations concrètes pour renforcer la sécurité, la visibilité et la restitution des objets retrouvés.', (csrfToken = '') => buildPartnershipPageMarkup(csrfToken, 'fr')],
        en: ['Partnerships', 'Concrete collaborations to strengthen security, visibility and the recovery of found items.', (csrfToken = '') => buildPartnershipPageMarkup(csrfToken, 'en')]
    },
    '/partenariats': {
        fr: ['Partenariats', 'Des collaborations concrètes pour renforcer la sécurité, la visibilité et la restitution des objets retrouvés.', (csrfToken = '') => buildPartnershipPageMarkup(csrfToken, 'fr')],
        en: ['Partnerships', 'Concrete collaborations to strengthen security, visibility and the recovery of found items.', (csrfToken = '') => buildPartnershipPageMarkup(csrfToken, 'en')]
    },
    '/security': {
        fr: ['Sécurité', 'Votre sécurité est notre priorité.', `
            <section>
                <h2>Votre sécurité est notre priorité</h2>
                <p>RETROOVA est conçu pour faciliter les retrouvailles tout en limitant l'exposition des informations personnelles.</p>
            </section>
        `],
        en: ['Security', 'Your safety is our priority.', `
            <section>
                <h2>Your safety is our priority</h2>
                <p>RETROOVA is designed to facilitate reunions while limiting the exposure of personal information.</p>
            </section>
        `]
    },
    '/help': {
        fr: ['Aide', 'Centre d’aide RETROOVA', `
            <section>
                <h2>Comment pouvons-nous vous aider ?</h2>
                <p>Créer ici une interface avec de grosses catégories plutôt qu'une longue page de texte.</p>
            </section>
        `],
        en: ['Help', 'RETROOVA help center', `
            <section>
                <h2>How can we help?</h2>
                <p>Find answers about reporting an item, searching listings and safely arranging its return.</p>
            </section>
        `]
    },
    '/report': {
        fr: ['Signaler', 'Signalement d’un comportement ou d’une annonce suspecte.', `
            <section>
                <h2>Signaler un problème</h2>
                <p>Vous avez rencontré une annonce ou un comportement qui vous semble suspect ?</p>
            </section>
        `],
        en: ['Report', 'Report suspicious behavior or an ad.', `
            <section>
                <h2>Report a problem</h2>
                <p>Have you encountered an ad or behavior that seems suspicious?</p>
            </section>
        `]
    }
};

const getLocalizedPage = (pageData, locale = 'fr') => {
    if (!pageData) return null;
    if (Array.isArray(pageData)) return pageData;
    return locale === 'en' ? (pageData.en || pageData.fr) : (pageData.fr || pageData.en);
};

class InfoController {
    constructor(adminModel) { this.adminModel = adminModel; }
    show = (req, res) => {
        const locale = req.locale || 'fr';
        const page = getLocalizedPage(pages[req.path] || pages['/help'], locale);
        const [title, lead, content] = Array.isArray(page) ? page : [page.title, page.lead, page.content];
        const currentFaqItems = req.path === '/help' ? getLocalizedFaqItems(locale) : [];
        const renderedContent = typeof content === 'function' ? content(req.session?.csrfToken || '') : content;
        res.render('pages/info', {
            title,
            metaDescription: lead,
            lead,
            content: renderedContent,
            faqItems: currentFaqItems,
            faqSchema: currentFaqItems.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: currentFaqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) } : null,
            csrfToken: req.session?.csrfToken
        });
    };
    submitPartnership = async (req, res) => {
        const payload = {
            organization_name: String(req.body.organization_name || '').trim(),
            contact_name: String(req.body.contact_name || '').trim(),
            email: String(req.body.email || '').trim(),
            partnership_type: String(req.body.partnership_type || '').trim(),
            country: String(req.body.country || '').trim(),
            message: String(req.body.message || '').trim()
        };

        if (!payload.organization_name || !payload.contact_name || !payload.email || !payload.partnership_type || !payload.message) {
            return res.redirect('/partnerships?error=1');
        }

        await this.adminModel.ensurePartnershipTable();
        const request = await this.adminModel.createPartnershipRequest(payload);
        if (!request) {
            return res.redirect('/partnerships?error=1');
        }

        res.redirect('/partnerships?success=1');
    };
    report = (req, res) => res.redirect('/help');
}

module.exports = InfoController;
