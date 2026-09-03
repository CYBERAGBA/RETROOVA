const crypto = require('crypto');

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

const buildHelpPageMarkup = (locale = 'fr') => {
    const isFrench = locale === 'fr';
    const prefix = `/${locale}`;
    const text = isFrench ? {
        searchTitle: 'Rechercher un objet', searchIntro: 'Vous avez perdu quelque chose ?', searchBody: 'Utilisez la recherche RETROOVA pour consulter les objets déclarés perdus ou trouvés.', searchLabel: 'Vous pouvez rechercher par :', searchItems: ['nom ou type d’objet', 'catégorie', 'ville', 'période', 'statut'], searchButton: 'Rechercher un objet',
        lostTitle: 'J’ai perdu un objet', lostIntro: 'Vous avez perdu un objet ?', lostSteps: ['Connectez-vous à votre compte.', 'Sélectionnez « J’ai perdu un objet ».', 'Décrivez précisément l’objet.', 'Ajoutez une photo si nécessaire.', 'Indiquez la ville et le lieu où il a été perdu.', 'Publiez votre annonce.'], lostNote: 'Plus votre description est précise, plus votre objet sera facile à identifier.', lostButton: 'Déclarer un objet perdu',
        foundTitle: 'J’ai trouvé un objet', foundIntro: 'Vous avez trouvé un objet appartenant probablement à quelqu’un ?', foundSteps: ['Connectez-vous.', 'Sélectionnez « J’ai trouvé un objet ».', 'Décrivez l’objet.', 'Indiquez où vous l’avez trouvé.', 'Ajoutez une photo si nécessaire.', 'Publiez l’annonce.'], foundNote: 'Important : ne publiez pas d’informations personnelles présentes sur une pièce d’identité, une carte bancaire ou un document.', foundButton: 'Déclarer un objet trouvé',
        recoverTitle: 'Comment récupérer un objet ?', recoverIntro: 'Si vous pensez avoir trouvé votre objet :', recoverSteps: ['Consultez attentivement l’annonce.', 'Vérifiez les caractéristiques que seul le véritable propriétaire devrait connaître.', 'Utilisez le système de contact prévu par RETROOVA.', 'Ne communiquez pas immédiatement d’informations personnelles.', 'Organisez la restitution dans un lieu sûr.'], recoverNote: 'Ne remettez jamais un objet uniquement sur la base d’une photo ou d’une description générale.',
        safetyTitle: 'Conseils de sécurité', safetyIntro: 'Pour protéger votre vie privée :', safetyItems: ['ne publiez pas votre numéro de téléphone dans une annonce', 'ne publiez pas votre adresse personnelle', 'ne publiez pas de numéro de CNI ou de passeport', 'évitez de publier des informations bancaires', 'vérifiez l’identité de la personne avant toute restitution', 'méfiez-vous des demandes d’argent', 'signalez toute annonce ou comportement suspect'], safetyNote: 'RETROVA ne vous demandera jamais votre mot de passe par l’intermédiaire d’une annonce.',
        reportTitle: 'Signaler une annonce', reportIntro: 'Une annonce vous semble suspecte ?', reportBody: 'Vous pouvez la signaler à notre équipe de modération.', reportLabel: 'Les motifs peuvent notamment concerner :', reportItems: ['fraude', 'informations personnelles exposées', 'contenu trompeur', 'image inappropriée', 'annonce suspecte', 'objet déjà restitué'], reportButton: 'Signaler une annonce',
        accountTitle: 'Mon compte', accountIntro: 'Vous pouvez créer un compte RETROVA afin de :', accountItems: ['publier des annonces', 'gérer vos annonces', 'retrouver vos déclarations', 'modifier certaines informations', 'suivre vos interactions'], accountButton: 'Se connecter',
        mapTitle: 'La carte RETROVA', mapBody: 'La carte permet de visualiser les annonces disponibles selon leur localisation.', mapMore: 'Elle peut vous aider à identifier rapidement les annonces correspondant à votre ville ou votre zone de recherche.', mapButton: 'Voir la carte',
        contactTitle: 'Je n’ai pas trouvé la réponse', contactBody: 'Vous avez une question ou vous rencontrez un problème ?', contactButton: 'Nous contacter', footerTitle: 'Besoin d’aide supplémentaire ?', footerHelp: 'Centre d’aide', footerContact: 'Contact', footerReport: 'Signaler un problème', footerSecurity: 'Sécurité', footerPrivacy: 'Confidentialité', footerTerms: 'Conditions d’utilisation'
    } : {
        searchTitle: 'Search for an item', searchIntro: 'Have you lost something?', searchBody: 'Use RETROOVA search to browse items reported lost or found.', searchLabel: 'You can search by:', searchItems: ['item name or type', 'category', 'city', 'period', 'status'], searchButton: 'Search for an item',
        lostTitle: 'I lost an item', lostIntro: 'Have you lost an item?', lostSteps: ['Sign in to your account.', 'Select “I lost an item”.', 'Describe the item precisely.', 'Add a photo if needed.', 'Indicate the city and where it was lost.', 'Publish your listing.'], lostNote: 'The more precise your description, the easier your item will be to identify.', lostButton: 'Report a lost item',
        foundTitle: 'I found an item', foundIntro: 'Have you found an item that probably belongs to someone?', foundSteps: ['Sign in.', 'Select “I found an item”.', 'Describe the item.', 'Indicate where you found it.', 'Add a photo if needed.', 'Publish the listing.'], foundNote: 'Important: do not publish personal information shown on an identity document, bank card or other document.', foundButton: 'Report a found item',
        recoverTitle: 'How do I recover an item?', recoverIntro: 'If you think you have found your item:', recoverSteps: ['Read the listing carefully.', 'Check details that only the genuine owner should know.', 'Use RETROOVA’s contact system.', 'Do not immediately share personal information.', 'Arrange the return in a safe place.'], recoverNote: 'Never hand over an item based only on a photo or a general description.',
        safetyTitle: 'Safety advice', safetyIntro: 'To protect your privacy:', safetyItems: ['do not publish your phone number in a listing', 'do not publish your home address', 'do not publish a national ID or passport number', 'avoid publishing banking information', 'verify the person’s identity before any return', 'beware of requests for money', 'report any suspicious listing or behavior'], safetyNote: 'RETROOVA will never ask for your password through a listing.',
        reportTitle: 'Report a listing', reportIntro: 'Does a listing seem suspicious?', reportBody: 'You can report it to our moderation team.', reportLabel: 'Reasons may include:', reportItems: ['fraud', 'exposed personal information', 'misleading content', 'inappropriate image', 'suspicious listing', 'item already returned'], reportButton: 'Report a listing',
        accountTitle: 'My account', accountIntro: 'You can create a RETROOVA account to:', accountItems: ['publish listings', 'manage your listings', 'find your reports', 'edit some information', 'follow your interactions'], accountButton: 'Sign in',
        mapTitle: 'The RETROOVA map', mapBody: 'The map lets you view available listings by location.', mapMore: 'It can help you quickly identify listings matching your city or search area.', mapButton: 'View the map',
        contactTitle: 'I did not find the answer', contactBody: 'Do you have a question or a problem?', contactButton: 'Contact us', footerTitle: 'Need more help?', footerHelp: 'Help center', footerContact: 'Contact', footerReport: 'Report a problem', footerSecurity: 'Security', footerPrivacy: 'Privacy', footerTerms: 'Terms of use'
    };
    const list = (items, ordered = false) => `<${ordered ? 'ol' : 'ul'}>${items.map((item) => `<li>${item}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`;
    const section = (icon, title, body) => `<section class="help-section"><div class="help-section-heading"><span class="help-icon" aria-hidden="true">${icon}</span><h2>${title}</h2></div>${body}</section>`;
    return `<div class="help-overview"><p>${isFrench ? 'Retrouvez rapidement les réponses aux questions les plus fréquentes concernant les objets perdus et trouvés.' : 'Quickly find answers to the most common questions about lost and found items.'}</p></div>
        <div class="help-category-grid">
            ${section('🔎', text.searchTitle, `<p>${text.searchIntro}</p><p>${text.searchBody}</p><p><strong>${text.searchLabel}</strong></p>${list(text.searchItems)}<a class="btn btn-primary" href="${prefix}/search">${text.searchButton} <span>→</span></a>`)}
            ${section('📢', text.lostTitle, `<p>${text.lostIntro}</p>${list(text.lostSteps, true)}<p><strong>${text.lostNote}</strong></p><a class="btn btn-primary" href="${prefix}/lost/create">${text.lostButton} <span>→</span></a>`)}
            ${section('📦', text.foundTitle, `<p>${text.foundIntro}</p>${list(text.foundSteps, true)}<blockquote>${text.foundNote}</blockquote><a class="btn btn-primary" href="${prefix}/found/create">${text.foundButton} <span>→</span></a>`)}
            ${section('🤝', text.recoverTitle, `<p>${text.recoverIntro}</p>${list(text.recoverSteps, true)}<blockquote><strong>${text.recoverNote}</strong></blockquote>`)}
            ${section('🛡️', text.safetyTitle, `<p>${text.safetyIntro}</p>${list(text.safetyItems)}<blockquote><strong>${text.safetyNote}</strong></blockquote>`)}
            ${section('🚨', text.reportTitle, `<p>${text.reportIntro}</p><p>${text.reportBody}</p><p><strong>${text.reportLabel}</strong></p>${list(text.reportItems)}<a class="btn btn-danger" href="${prefix}/report">${text.reportButton} <span>→</span></a>`)}
            ${section('👤', text.accountTitle, `<p>${text.accountIntro}</p>${list(text.accountItems)}<a class="btn btn-primary" href="${prefix}/login">${text.accountButton} <span>→</span></a>`)}
            ${section('📍', text.mapTitle, `<p>${text.mapBody}</p><p>${text.mapMore}</p><a class="btn btn-secondary" href="${prefix}/map">${text.mapButton} <span>→</span></a>`)}
            ${section('❓', text.contactTitle, `<p>${text.contactBody}</p><a class="btn btn-secondary" href="${prefix}/contact">${text.contactButton} <span>→</span></a>`)}
        </div>
        <footer class="help-footer"><h2>${text.footerTitle}</h2><nav aria-label="${text.footerTitle}"><a href="${prefix}/help">${text.footerHelp}</a><a href="${prefix}/contact">${text.footerContact}</a><a href="${prefix}/report">${text.footerReport}</a><a href="${prefix}/security">${text.footerSecurity}</a><a href="${prefix}/privacy">${text.footerPrivacy}</a><a href="${prefix}/terms">${text.footerTerms}</a></nav></footer>`;
};

const buildTermsPageMarkup = (locale = 'fr') => {
    const isFrench = locale === 'fr';
    const prefix = `/${locale}`;
    const text = isFrench ? {
        update: 'Dernière mise à jour : 3 septembre 2026', welcome: 'Bienvenue sur RETROOVA', toc: 'Sommaire',
        intro: 'RETROOVA est une plateforme numérique destinée à faciliter la déclaration, la recherche et la restitution d’objets perdus ou trouvés. En utilisant RETROOVA, vous acceptez les présentes Conditions d’utilisation. Si vous n’acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.',
        tocItems: [['privacy', '🔐 Votre confidentialité'], ['collect', '📋 Ce que nous collectons'], ['why', '🎯 Pourquoi nous le faisons'], ['protect', '🛡️ Comment nous protégeons vos données'], ['rights', '👤 Vos droits'], ['reporting', '🚨 Signalement et sécurité'], ['objects', '📦 Règles concernant les objets'], ['responsibilities', '⚖️ Vos responsabilités']],
        principleTitle: '🤝 Notre principe', principle: 'RETROOVA existe pour rapprocher les objets de leurs propriétaires, pas pour exposer inutilement les personnes qui les recherchent.'
    } : {
        update: 'Last updated: September 3, 2026', welcome: 'Welcome to RETROOVA', toc: 'Contents',
        intro: 'RETROOVA is a digital platform designed to make it easier to report, search for and return lost or found items. By using RETROOVA, you agree to these Terms of Use. If you do not accept these terms, please do not use the platform.',
        tocItems: [['privacy', '🔐 Your privacy'], ['collect', '📋 What we collect'], ['why', '🎯 Why we do it'], ['protect', '🛡️ How we protect your data'], ['rights', '👤 Your rights'], ['reporting', '🚨 Reporting and security'], ['objects', '📦 Item rules'], ['responsibilities', '⚖️ Your responsibilities']],
        principleTitle: '🤝 Our principle', principle: 'RETROOVA exists to bring items closer to their owners, not to unnecessarily expose the people looking for them.'
    };
    const sections = isFrench ? [
        ['1. Objet de RETROOVA', '<p>RETROOVA permet notamment aux utilisateurs de :</p><ul><li>déclarer un objet perdu ;</li><li>déclarer un objet trouvé ;</li><li>rechercher des annonces ;</li><li>consulter certaines informations publiées ;</li><li>communiquer dans le cadre de la restitution d’un objet ;</li><li>signaler une annonce ou un comportement ;</li><li>utiliser les fonctionnalités proposées par la plateforme.</li></ul><p>RETROOVA facilite la mise en relation mais <strong>ne garantit pas la restitution d’un objet</strong>.</p>'],
        ['2. Création d’un compte', '<p>Certaines fonctionnalités nécessitent la création d’un compte. Vous vous engagez à fournir des informations exactes, maintenir vos informations à jour, protéger vos identifiants, ne pas partager votre mot de passe et ne pas utiliser le compte d’une autre personne.</p><p>Vous êtes responsable des activités réalisées depuis votre compte, sauf en cas d’utilisation frauduleuse dont vous avez informé RETROOVA dans un délai raisonnable.</p>'],
        ['3. Publication d’une annonce', '<p>Lorsque vous publiez une annonce, vous devez fournir des informations aussi exactes que possible. Une annonce doit correspondre réellement à un objet perdu ou trouvé, contenir des informations honnêtes, ne pas induire volontairement les autres utilisateurs en erreur et respecter les lois applicables.</p><p>Vous devez disposer du droit de publier les photographies et informations que vous transmettez à RETROOVA.</p>'],
        ['4. Informations personnelles', '<p>Pour votre propre sécurité, vous ne devez pas publier dans une annonce de numéro de téléphone, adresse personnelle, numéro de CNI, numéro de passeport, coordonnées bancaires, mot de passe ou informations confidentielles appartenant à une autre personne.</p><p>RETROOVA peut masquer, modifier, suspendre ou supprimer une annonce présentant un risque pour la sécurité ou la vie privée.</p>'],
        ['5. Objets trouvés', '<p>Si vous trouvez un objet, vous devez agir de manière honnête et raisonnable afin de faciliter sa restitution à son propriétaire légitime.</p><p>Vous ne devez pas vous approprier frauduleusement un objet, réclamer une récompense en menaçant son propriétaire, falsifier des informations, publier de fausses informations pour obtenir un objet ou utiliser RETROOVA pour organiser une transaction frauduleuse.</p><p>RETROOVA ne détermine pas automatiquement la propriété juridique d’un objet.</p>'],
        ['6. Objets perdus', '<p>Une personne qui réclame un objet doit être en mesure de fournir des éléments permettant raisonnablement de vérifier qu’elle en est le propriétaire ou qu’elle est autorisée à le récupérer.</p><p><strong>Une photographie ou une description publique ne constitue pas à elle seule une preuve suffisante de propriété.</strong></p><p>Lorsque cela est nécessaire, privilégiez une restitution dans un lieu sûr.</p>'],
        ['7. Comportements interdits', '<p>Il est interdit d’utiliser RETROOVA pour publier de fausses annonces, escroquer ou tenter d’escroquer une personne, usurper une identité, harceler ou menacer un utilisateur, publier des informations personnelles sans autorisation, diffuser des contenus illégaux, spammer, contourner les mesures de sécurité, accéder à un compte ou des données sans autorisation, perturber le service, utiliser des moyens automatisés abusifs ou exploiter RETROOVA à des fins frauduleuses.</p>'],
        ['8. Signalement et modération', '<p>Tout utilisateur peut signaler une annonce ou un comportement suspect. RETROOVA peut demander des informations complémentaires, masquer temporairement une annonce, modifier ou supprimer un contenu, suspendre ou désactiver un compte, conserver certaines informations nécessaires à la sécurité ou à un litige, et transmettre certaines informations aux autorités compétentes lorsque la loi l’exige ou le permet.</p>'],
        ['9. Exactitude des annonces', '<p>RETROOVA ne garantit pas que toutes les informations publiées par les utilisateurs sont exactes. Chaque utilisateur est responsable du contenu qu’il publie. RETROOVA peut mettre en place des mécanismes de vérification, de modération et de signalement afin de limiter les abus.</p>'],
        ['10. Restitution des objets', '<p>RETROOVA facilite la mise en relation mais <strong>n’est pas automatiquement partie à la restitution entre utilisateurs</strong>.</p><p>Avant de remettre un objet, vérifiez l’identité de la personne, posez des questions permettant de confirmer la propriété, privilégiez un lieu sûr, ne communiquez pas inutilement d’informations personnelles et ne remettez jamais un objet uniquement sur la base d’une photo publiée.</p>'],
        ['11. Sécurité', '<p>Toute tentative de piratage, contournement d’authentification, exploitation d’une vulnérabilité, accès non autorisé, extraction abusive de données ou perturbation volontaire du service est interdite.</p><p>Si vous découvrez une vulnérabilité de sécurité, contactez RETROOVA plutôt que de l’exploiter.</p>'],
        ['12. Contenu utilisateur', '<p>Vous restez responsable des contenus que vous publiez. En publiant du contenu sur RETROOVA, vous autorisez RETROOVA à l’héberger, l’afficher et le traiter dans la mesure nécessaire au fonctionnement de la plateforme.</p><p>Vous devez disposer des droits nécessaires sur les contenus transmis. RETROOVA peut retirer un contenu qui enfreint les présentes conditions, la sécurité de la plateforme ou la réglementation applicable.</p>'],
        ['13. Propriété intellectuelle', '<p>Les éléments propres à RETROOVA, notamment la marque, le logo, l’interface, le design, les textes, les logiciels, les éléments graphiques et la structure du service, sont protégés par les droits applicables. Ils ne peuvent être reproduits ou exploités sans autorisation lorsqu’une telle autorisation est requise.</p>'],
        ['14. Disponibilité du service', '<p>RETROOVA cherche à maintenir un service accessible et fiable. Cependant, certaines interruptions peuvent survenir notamment en raison de maintenance, d’incidents techniques, de problèmes d’hébergement, de pannes de réseau ou d’événements indépendants de notre volonté.</p><p>RETROOVA ne garantit pas une disponibilité permanente et ininterrompue du service.</p>'],
        ['15. Limitation du rôle de RETROOVA', '<p>RETROOVA est une <strong>plateforme de mise en relation et d’assistance à la restitution</strong>. RETROOVA ne garantit pas qu’un objet sera retrouvé, qu’une annonce est toujours exacte, qu’un utilisateur est réellement propriétaire d’un objet, qu’une restitution aboutira ou qu’une interaction entre utilisateurs sera sans risque.</p><p>Les utilisateurs doivent exercer leur propre jugement et prendre les précautions nécessaires.</p>'],
        ['16. Sécurité des utilisateurs', '<p>Nous encourageons fortement les utilisateurs à ne pas communiquer leur mot de passe, ne pas envoyer d’argent à un inconnu, ne pas publier leurs coordonnées personnelles, vérifier l’identité d’une personne avant restitution et signaler immédiatement une tentative de fraude.</p><p><strong>RETROOVA ne vous demandera jamais votre mot de passe.</strong></p>'],
        ['17. Suspension ou suppression d’un compte', '<p>RETROOVA peut suspendre ou désactiver un compte lorsqu’il existe des raisons sérieuses de penser que les présentes conditions sont violées, que la plateforme est utilisée frauduleusement, que la sécurité d’autres utilisateurs est menacée ou que le compte compromet le fonctionnement du service. Lorsque cela est approprié, l’utilisateur peut être informé.</p>'],
        ['18. Modification des fonctionnalités', '<p>RETROOVA peut faire évoluer, améliorer, modifier ou supprimer certaines fonctionnalités afin d’améliorer le service, renforcer la sécurité, respecter la réglementation ou répondre aux besoins des utilisateurs. Les modifications importantes peuvent être accompagnées d’une mise à jour des présentes conditions.</p>'],
        ['19. Données personnelles', `<p>L’utilisation de RETROOVA implique le traitement de certaines données personnelles. Ce traitement est décrit dans notre <a href="${prefix}/privacy">Politique de confidentialité</a>. Les deux documents doivent être lus conjointement.</p>`],
        ['20. Respect des lois', '<p>Les utilisateurs s’engagent à utiliser RETROOVA conformément aux lois et réglementations qui leur sont applicables. RETROOVA coopérera avec les autorités compétentes lorsque la loi l’exige.</p><p>En Côte d’Ivoire, la protection des données personnelles est notamment encadrée par la loi n°2013-450 du 19 juin 2013.</p>'],
        ['21. Contact', `<p>Pour toute question concernant les présentes conditions : <strong><a href="${prefix}/contact">Contactez l’équipe RETROOVA</a></strong>.</p>`],
        ['22. Acceptation', '<p>En créant un compte, en publiant une annonce ou en utilisant les fonctionnalités de RETROOVA, vous reconnaissez avoir pris connaissance des présentes Conditions d’utilisation et vous acceptez de les respecter.</p>']
    ] : [
        ['1. Purpose of RETROOVA', '<p>RETROOVA allows users to report lost items, report found items, search listings, view published information, communicate about returning an item, report a listing or behavior, and use the platform’s features.</p><p>RETROOVA helps connect people but <strong>does not guarantee that an item will be returned</strong>.</p>'],
        ['2. Creating an account', '<p>Some features require an account. You agree to provide accurate information, keep it up to date, protect your credentials, never share your password, and never use another person’s account.</p><p>You are responsible for activity from your account unless you notify RETROOVA within a reasonable time of fraudulent use.</p>'],
        ['3. Publishing a listing', '<p>When publishing a listing, provide information that is as accurate as possible. A listing must relate to a real lost or found item, contain honest information, not deliberately mislead users, and comply with applicable laws. You must have the right to publish photographs and information sent to RETROOVA.</p>'],
        ['4. Personal information', '<p>For your safety, do not publish a phone number, home address, national ID number, passport number, banking details, password, or another person’s confidential information in a listing.</p><p>RETROOVA may hide, edit, suspend, or remove a listing that creates a security or privacy risk.</p>'],
        ['5. Found items', '<p>If you find an item, act honestly and reasonably to help return it to its rightful owner. Do not fraudulently keep an item, demand a reward through threats, falsify information, publish false information to obtain an item, or use RETROOVA to arrange a fraudulent transaction.</p><p>RETROOVA does not automatically determine legal ownership of an item.</p>'],
        ['6. Lost items', '<p>A person claiming an item must provide information that reasonably helps verify that they own it or are authorized to recover it.</p><p><strong>A public photograph or description alone is not sufficient proof of ownership.</strong></p><p>When necessary, arrange the return in a safe place.</p>'],
        ['7. Prohibited behavior', '<p>You may not use RETROOVA to publish false listings, scam or attempt to scam someone, impersonate another person, harass or threaten a user, publish personal information without permission, distribute illegal content, spam, bypass security, access accounts or data without permission, disrupt RETROOVA, abuse automated tools, or pursue fraudulent purposes.</p>'],
        ['8. Reporting and moderation', '<p>Any user may report a suspicious listing or behavior. RETROOVA may review reports and request more information, temporarily hide a listing, edit or remove content, suspend or permanently disable an account, retain information needed for security or disputes, or share information with competent authorities when required or permitted by law.</p>'],
        ['9. Listing accuracy', '<p>RETROOVA does not guarantee that all user-published information is accurate. Each user is responsible for their content. RETROOVA may use verification, moderation, and reporting tools to limit abuse.</p>'],
        ['10. Returning items', '<p>RETROOVA helps connect users but <strong>is not automatically a party to a return between users</strong>.</p><p>Before handing over an item, verify the person’s identity, ask questions that confirm ownership, choose a safe place, avoid sharing unnecessary personal information, and never hand over an item based only on a published photograph.</p>'],
        ['11. Security', '<p>Hacking, bypassing authentication, exploiting a vulnerability, unauthorized access, abusive data extraction, and deliberately disrupting the service are prohibited. If you discover a security vulnerability, contact RETROOVA instead of exploiting it.</p>'],
        ['12. User content', '<p>You remain responsible for the content you publish. By publishing content on RETROOVA, you allow RETROOVA to host, display, and process it as necessary to operate the platform. You must have the necessary rights. RETROOVA may remove content that breaches these terms, platform security, or applicable regulations.</p>'],
        ['13. Intellectual property', '<p>RETROOVA’s brand, logo, interface, design, text, software, graphics, and service structure are protected by applicable rights. They may not be reproduced or exploited without permission where permission is required.</p>'],
        ['14. Service availability', '<p>RETROOVA aims to keep the service accessible and reliable. Interruptions may occur because of maintenance, technical incidents, hosting or network problems, or events beyond our control. RETROOVA does not guarantee permanent uninterrupted availability.</p>'],
        ['15. RETROOVA’s limited role', '<p>RETROOVA is a <strong>platform for connecting users and assisting with returns</strong>. It does not guarantee that an item will be found, a listing will always be accurate, a user truly owns an item, a return will succeed, or an interaction will be risk-free. Users must exercise their own judgment and take necessary precautions.</p>'],
        ['16. User safety', '<p>We strongly encourage users not to share their password, send money to strangers, publish personal contact details, or skip identity checks before a return. Report attempted fraud immediately.</p><p><strong>RETROOVA will never ask for your password.</strong></p>'],
        ['17. Account suspension or deletion', '<p>RETROOVA may suspend or disable an account when there are serious reasons to believe that these terms are breached, the platform is being used fraudulently, other users’ safety is threatened, or the account compromises the service. Where appropriate, the user may be informed.</p>'],
        ['18. Feature changes', '<p>RETROOVA may evolve, improve, modify, or remove features to improve the service, strengthen security, comply with regulations, or meet user needs. Significant changes may be accompanied by an update to these terms.</p>'],
        ['19. Personal data', `<p>Using RETROOVA involves processing some personal data. This processing is described in our <a href="${prefix}/privacy">Privacy policy</a>. The two documents should be read together.</p>`],
        ['20. Compliance with laws', '<p>Users agree to use RETROOVA in accordance with the laws and regulations applicable to them. RETROOVA will cooperate with competent authorities when required by law. In Côte d’Ivoire, personal data protection is notably governed by Law No. 2013-450 of June 19, 2013.</p>'],
        ['21. Contact', `<p>For questions about these terms, <strong><a href="${prefix}/contact">contact the RETROOVA team</a></strong>.</p>`],
        ['22. Acceptance', '<p>By creating an account, publishing a listing, or using RETROOVA features, you acknowledge that you have read these Terms of Use and agree to comply with them.</p>']
    ];
    const anchorIds = ['objects', 'responsibilities', 'objects', 'privacy', 'objects', 'objects', 'responsibilities', 'reporting', 'why', 'objects', 'protect', 'responsibilities', 'responsibilities', 'why', 'why', 'protect', 'responsibilities', 'why', 'collect', 'responsibilities', 'rights', 'responsibilities'];
    const toc = text.tocItems.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('');
    const renderedSections = sections.map(([title, body], index) => `<section id="${anchorIds[index]}" class="terms-section"><h2>${title}</h2>${body}</section>`).join('');
    return `<p class="terms-updated"><strong>${text.update}</strong></p><section class="terms-intro"><h2>${text.welcome}</h2><p>${text.intro}</p></section><nav class="terms-toc" aria-label="${text.toc}"><h2>${text.toc}</h2><ul>${toc}</ul></nav>${renderedSections}<section class="terms-principle"><h2>${text.principleTitle}</h2><blockquote><strong>${text.principle}</strong></blockquote></section>`;
};

const buildPrivacyPageMarkup = (locale = 'fr') => {
    const isFrench = locale === 'fr';
    const prefix = `/${locale}`;
    const text = isFrench ? {
        update: 'Dernière mise à jour : 3 septembre 2026', title: 'Votre confiance compte.', toc: 'Sommaire',
        intro: 'RETROOVA est une plateforme destinée à faciliter la déclaration, la recherche et la restitution d’objets perdus et trouvés. Parce que cette mission peut nécessiter le traitement d’informations concernant les utilisateurs et les objets déclarés, nous accordons une attention particulière à la protection de la vie privée, à la sécurité des données et à la transparence. Cette politique explique quelles données nous pouvons collecter, pourquoi nous les utilisons, comment nous les protégeons et quels sont vos droits.',
        tocItems: [['identity', '👤 Qui est RETROOVA ?'], ['collect', '📋 Informations collectées'], ['use', '🎯 Utilisation des données'], ['public', '🌐 Informations publiques'], ['photos', '🖼️ Protection des photographies'], ['protect', '🛡️ Protection des données'], ['retention', '⏳ Durée de conservation'], ['rights', '⚖️ Vos droits'], ['sharing', '🤝 Partage et transferts'], ['cookies', '🍪 Cookies'], ['safety', '🚨 Sécurité et signalement']],
        engagement: '🤝 Notre engagement', principle: 'RETROOVA est construit autour d’une idée simple : retrouver un objet ne doit jamais obliger quelqu’un à sacrifier sa vie privée.'
    } : {
        update: 'Last updated: September 3, 2026', title: 'Your trust matters.', toc: 'Contents',
        intro: 'RETROOVA is a platform designed to make it easier to report, search for and return lost and found items. Because this mission may require processing information about users and reported items, we pay particular attention to privacy, data security and transparency. This policy explains what data we may collect, why we use it, how we protect it and what rights you have.',
        tocItems: [['identity', '👤 Who is RETROOVA?'], ['collect', '📋 Information we collect'], ['use', '🎯 How we use data'], ['public', '🌐 Public information'], ['photos', '🖼️ Photo protection'], ['protect', '🛡️ Data protection'], ['retention', '⏳ Data retention'], ['rights', '⚖️ Your rights'], ['sharing', '🤝 Sharing and transfers'], ['cookies', '🍪 Cookies'], ['safety', '🚨 Security and reporting']],
        engagement: '🤝 Our commitment', principle: 'RETROOVA is built around a simple idea: finding an item should never require someone to sacrifice their privacy.'
    };
    const sections = isFrench ? [
        ['1. Qui est RETROOVA ?', '<p>RETROOVA est une plateforme numérique permettant aux personnes ayant perdu ou retrouvé un objet de publier et consulter des annonces afin de faciliter sa restitution.</p><p>RETROOVA agit principalement comme <strong>intermédiaire numérique</strong> entre les utilisateurs. La plateforme ne garantit pas à elle seule qu’un objet sera retrouvé ou restitué et ne devient pas propriétaire des objets publiés.</p>'],
        ['2. Quelles informations pouvons-nous collecter ?', '<p>Selon votre utilisation de RETROOVA, nous pouvons collecter différentes catégories d’informations.</p><h3>Informations de compte</h3><p>Lors de la création d’un compte, nous pouvons demander notamment :</p><ul><li>nom ou nom d’utilisateur ;</li><li>adresse e-mail ;</li><li>numéro de téléphone lorsqu’il est fourni ;</li><li>ville ;</li><li>mot de passe sous forme sécurisée et protégée.</li></ul><h3>Informations relatives aux annonces</h3><p>Nous pouvons traiter le type d’annonce, le titre, la catégorie, la description, la marque ou le modèle, la couleur, la date, la ville, le lieu général, les photographies, l’identifiant de l’annonce et les informations nécessaires à sa gestion.</p><h3>Informations relatives aux échanges</h3><p>Lorsque vous utilisez les fonctionnalités de contact, de signalement ou d’assistance, nous pouvons conserver les informations nécessaires au traitement de votre demande.</p><h3>Données techniques</h3><p>RETROOVA peut traiter l’adresse IP, le navigateur, le système d’exploitation, les informations de session, les journaux techniques, ainsi que la date et l’heure des connexions ou actions importantes.</p>'],
        ['3. Pourquoi utilisons-nous vos données ?', '<p>Les données sont utilisées uniquement lorsqu’elles sont nécessaires au fonctionnement et à la sécurité de RETROOVA. Elles peuvent notamment servir à :</p><ul><li>créer et gérer votre compte ;</li><li>publier et administrer vos annonces ;</li><li>permettre la recherche d’objets ;</li><li>faciliter la mise en relation entre utilisateurs ;</li><li>sécuriser les comptes ;</li><li>prévenir les abus et les fraudes ;</li><li>traiter les signalements ;</li><li>répondre aux demandes d’assistance ;</li><li>améliorer le fonctionnement de la plateforme ;</li><li>assurer la sécurité technique ;</li><li>respecter nos obligations légales.</li></ul><p><strong>RETROOVA ne vend pas vos données personnelles.</strong></p>'],
        ['4. Quelles informations sont visibles publiquement ?', '<p>Certaines informations doivent pouvoir être consultées par les visiteurs afin de permettre la recherche d’un objet. Nous cherchons cependant à limiter l’exposition inutile des informations personnelles.</p><p>Une annonce peut rendre visibles le type d’objet, sa catégorie, une description, une ville ou zone générale, une date, une photographie protégée lorsque nécessaire et un identifiant public RETROOVA.</p><h3>Informations qui ne doivent pas être publiées</h3><p>Ne publiez jamais de numéro de téléphone, adresse personnelle, numéro de CNI, numéro de passeport, informations bancaires, mots de passe ou informations confidentielles.</p><p>RETROOVA peut masquer, modifier ou supprimer certains contenus présentant un risque pour la vie privée ou la sécurité.</p>'],
        ['5. Protection des photographies', '<p>Certaines annonces peuvent concerner des documents ou objets contenant des informations personnelles. Lorsque cela est nécessaire, RETROOVA peut appliquer des mécanismes de protection des images, notamment le <strong>floutage ou le masquage de certaines informations sensibles</strong>.</p><p>Cette protection peut concerner les cartes d’identité, passeports, permis, cartes bancaires et documents administratifs.</p><p><strong>Important :</strong> les utilisateurs restent responsables des contenus qu’ils publient.</p>'],
        ['6. Comment protégeons-nous vos données ?', '<p>RETROOVA met en œuvre des mesures techniques et organisationnelles destinées à protéger les données contre l’accès ou la modification non autorisés, la perte, la divulgation et l’utilisation abusive.</p><p>Ces mesures peuvent inclure le chiffrement des communications, la protection des mots de passe, le contrôle des accès, la validation des données, la sécurisation des fichiers téléchargés, la surveillance des événements techniques et la limitation des accès aux informations nécessaires.</p><p>Aucune transmission ou conservation de données sur Internet ne peut cependant être garantie comme totalement exempte de risque.</p>'],
        ['7. Combien de temps conservons-nous vos données ?', '<p>Nous conservons les données uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, sauf lorsqu’une durée plus longue est requise ou autorisée par la réglementation applicable.</p><p>La durée peut dépendre de l’existence de votre compte, de la durée de publication d’une annonce, des besoins de sécurité, des obligations légales ou du traitement d’un litige ou d’un signalement.</p><p>Lorsqu’une donnée n’est plus nécessaire, elle peut être supprimée, anonymisée ou archivée.</p>'],
        ['8. Vos droits', `<p>Selon la réglementation applicable, vous pouvez disposer d’un droit d’accès, de rectification, de suppression de certaines données, d’opposition à certains traitements, de retrait du consentement et d’information sur l’utilisation de vos données.</p><p>Pour exercer vos droits, contactez RETROOVA via la page <a href="${prefix}/contact">Contact</a>. L’Autorité de Protection de Côte d’Ivoire rappelle également que les personnes disposent de droits à l’égard du traitement de leurs données personnelles.</p>`],
        ['9. Partage des données', '<p>RETROOVA ne vend pas les données personnelles de ses utilisateurs. Certaines données peuvent toutefois être communiquées à des prestataires techniques ou partenaires nécessaires au fonctionnement du service, dans la limite de ce qui est nécessaire.</p><p>Lorsque des prestataires interviennent pour le compte de RETROOVA, des mesures appropriées doivent être mises en place afin de protéger les informations traitées.</p>'],
        ['10. Transferts internationaux', '<p>RETROOVA peut utiliser des services techniques ou d’hébergement situés dans différents pays. Lorsque des données sont susceptibles d’être transférées ou accessibles depuis un autre pays, RETROOVA cherche à appliquer les mesures nécessaires conformément aux règles applicables.</p>'],
        ['11. Cookies et technologies similaires', '<p>RETROOVA peut utiliser des cookies ou technologies similaires nécessaires au fonctionnement du site, notamment pour maintenir une session, assurer la sécurité, mémoriser certaines préférences, améliorer l’expérience utilisateur et mesurer certaines performances lorsque cela est activé.</p><p>Les technologies non essentielles ne doivent être utilisées que dans les conditions prévues par la réglementation applicable.</p>'],
        ['12. Protection des mineurs', '<p>RETROOVA n’est pas destiné à collecter volontairement des informations personnelles auprès de mineurs en dehors des conditions prévues par la réglementation applicable.</p><p>Si vous pensez qu’un mineur a fourni des informations personnelles de manière inappropriée, contactez-nous afin que nous puissions examiner la situation.</p>'],
        ['13. Sécurité et signalement', `<p>Si vous constatez une annonce suspecte, une tentative de fraude, une exposition d’informations personnelles, une utilisation abusive d’un compte ou un problème de sécurité, utilisez la fonctionnalité <a href="${prefix}/report">Signaler</a> ou contactez RETROOVA.</p>`],
        ['14. Modifications de cette politique', '<p>Cette politique peut être mise à jour afin de tenir compte de l’évolution de RETROOVA, de nouvelles fonctionnalités, de changements techniques ou réglementaires. La date de dernière mise à jour sera indiquée en haut de cette page.</p>'],
        ['15. Nous contacter', `<p>Pour toute question concernant vos données personnelles ou l’exercice de vos droits, <a href="${prefix}/contact"><strong>contactez RETROOVA</strong></a>.</p><p>Nous vous recommandons de ne jamais transmettre par e-mail ou formulaire des informations sensibles qui ne sont pas nécessaires au traitement de votre demande.</p>`]
    ] : [
        ['1. Who is RETROOVA?', '<p>RETROOVA is a digital platform that allows people who have lost or found an item to publish and browse listings to help return it.</p><p>RETROOVA primarily acts as a <strong>digital intermediary</strong> between users. The platform does not itself guarantee that an item will be found or returned and does not become the owner of published items.</p>'],
        ['2. What information may we collect?', '<p>Depending on how you use RETROOVA, we may collect account information such as your name or username, email address, phone number when provided, city, and a securely protected password.</p><h3>Listing information</h3><p>We may process the listing type, item title, category, description, brand or model, colour, date, city, general location, photographs, listing ID, and information needed to manage the listing.</p><h3>Messages and technical data</h3><p>When you use contact, reporting, or support features, we may retain information needed to handle your request. RETROOVA may also process your IP address, browser, operating system, session information, technical logs, and the date and time of important connections or actions.</p>'],
        ['3. Why do we use your data?', '<p>Data is used only when necessary for RETROOVA’s operation and security, including to manage accounts and listings, enable item searches, connect users, secure accounts, prevent abuse and fraud, handle reports and support requests, improve the platform, maintain technical security, and meet legal obligations.</p><p><strong>RETROOVA does not sell your personal data.</strong></p>'],
        ['4. What information is public?', '<p>Some information must be viewable by visitors so they can search for an item. We seek to limit unnecessary exposure of personal information.</p><p>A listing may show the item type, category, description, city or general area, date, a protected photograph where necessary, and a public RETROOVA ID.</p><h3>Information that must not be published</h3><p>Never publish a phone number, home address, national ID number, passport number, banking information, passwords, or confidential information. RETROOVA may hide, edit, or remove content that creates a privacy or security risk.</p>'],
        ['5. Photo protection', '<p>Some listings may involve documents or items containing personal information. Where necessary, RETROOVA may protect images through <strong>blurring or masking sensitive information</strong>, including on identity cards, passports, driving licences, bank cards, and administrative documents.</p><p><strong>Important:</strong> users remain responsible for the content they publish.</p>'],
        ['6. How do we protect your data?', '<p>RETROOVA uses technical and organizational measures designed to protect data from unauthorized access or modification, loss, disclosure, and misuse.</p><p>These measures may include encrypted communications, password protection, access controls, data validation, secure uploaded files, technical event monitoring, and limiting access to information that is needed.</p><p>No transmission or storage of data over the Internet can be guaranteed to be completely risk-free.</p>'],
        ['7. How long do we keep your data?', '<p>We keep data only for as long as necessary for the purposes for which it was collected, unless a longer period is required or permitted by applicable regulations.</p><p>The period may depend on whether you have an account, how long a listing is published, security needs, legal obligations, or the handling of a dispute or report. When data is no longer necessary, it may be deleted, anonymized, or archived.</p>'],
        ['8. Your rights', `<p>Depending on applicable regulations, you may have rights to access and correct your data, request deletion of certain data, object to certain processing, withdraw consent where processing relies on it, and receive information about how your data is used.</p><p>To exercise your rights, contact RETROOVA through the <a href="${prefix}/contact">Contact</a> page. Côte d’Ivoire’s data protection authority also recognizes rights regarding the processing of personal data.</p>`],
        ['9. Data sharing', '<p>RETROOVA does not sell users’ personal data. Some data may nevertheless be shared with technical providers or partners needed to operate the service, limited to what is necessary.</p><p>When providers act on RETROOVA’s behalf, appropriate measures must be implemented to protect the information processed.</p>'],
        ['10. International transfers', '<p>RETROOVA may use technical or hosting services located in different countries. When data may be transferred to or accessed from another country, RETROOVA seeks to apply the measures required by applicable data-protection rules.</p>'],
        ['11. Cookies and similar technologies', '<p>RETROOVA may use cookies or similar technologies needed to operate the site, maintain a session, provide security, remember preferences, improve user experience, and measure service performance when enabled.</p><p>Non-essential technologies should only be used in accordance with applicable regulations.</p>'],
        ['12. Protection of minors', '<p>RETROOVA is not intended to knowingly collect personal information from minors outside the conditions provided by applicable regulations.</p><p>If you believe a minor has provided personal information inappropriately, contact us so we can review the situation.</p>'],
        ['13. Security and reporting', `<p>If you notice a suspicious listing, attempted fraud, exposed personal information, abusive account use, or a security issue, use the <a href="${prefix}/report">Report</a> feature or contact RETROOVA.</p>`],
        ['14. Changes to this policy', '<p>This policy may be updated to reflect changes to RETROOVA, new features, technical changes, or regulatory changes. The last-updated date will appear at the top of this page.</p>'],
        ['15. Contact us', `<p>For questions about your personal data or exercising your rights, <a href="${prefix}/contact"><strong>contact RETROOVA</strong></a>.</p><p>We recommend that you never send sensitive information by email or form unless it is necessary to handle your request.</p>`]
    ];
    const anchorIds = ['identity', 'collect', 'use', 'public', 'photos', 'protect', 'retention', 'rights', 'sharing', 'sharing', 'cookies', 'rights', 'safety', 'use', 'rights'];
    const toc = text.tocItems.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('');
    const renderedSections = sections.map(([heading, body], index) => `<section id="${anchorIds[index]}" class="terms-section privacy-section"><h2>${heading}</h2>${body}</section>`).join('');
    return `<p class="terms-updated"><strong>${text.update}</strong></p><section class="terms-intro"><h2>${text.title}</h2><p>${text.intro}</p></section><nav class="terms-toc" aria-label="${text.toc}"><h2>${text.toc}</h2><ul>${toc}</ul></nav>${renderedSections}<section class="terms-principle"><h2>${text.engagement}</h2><blockquote><strong>${text.principle}</strong></blockquote></section>`;
};

const buildSecurityPageMarkup = (locale = 'fr') => {
    const isFrench = locale === 'fr';
    const prefix = `/${locale}`;
    const text = isFrench ? {
        update: 'Dernière mise à jour : 3 septembre 2026', title: 'La sécurité au cœur de RETROOVA', toc: 'Sommaire',
        intro: 'Retrouver un objet est important. Le faire en toute sécurité l’est encore davantage. RETROOVA est conçu pour faciliter la mise en relation entre les personnes ayant perdu ou trouvé un objet, tout en limitant les risques liés aux fraudes, aux informations personnelles et aux échanges entre utilisateurs.',
        tocItems: [['privacy', '🔐 Informations personnelles'], ['documents', '🪪 Documents et photos sensibles'], ['return', '🤝 Vérifier avant restitution'], ['safe-place', '📍 Privilégier un lieu sûr'], ['money', '💰 Attention aux demandes d’argent'], ['reporting', '🚨 Signaler un comportement suspect'], ['accounts', '👤 Sécurité des comptes'], ['technical', '🔒 Sécurité technique'], ['community', '🧠 La communauté et les failles'], ['principles', '📋 Nos principes de sécurité']],
        mission: 'Faciliter les retrouvailles sans compromettre votre sécurité.', help: 'Besoin d’aide ?', engagement: 'Votre sécurité fait partie de notre mission.', closing: 'RETROOVA rapproche les objets de leurs propriétaires, tout en protégeant les personnes qui utilisent la plateforme.'
    } : {
        update: 'Last updated: September 3, 2026', title: 'Security at the heart of RETROOVA', toc: 'Contents',
        intro: 'Finding an item matters. Doing so safely matters even more. RETROOVA is designed to connect people who have lost or found an item while limiting risks related to fraud, personal information, and user interactions.',
        tocItems: [['privacy', '🔐 Personal information'], ['documents', '🪪 Documents and sensitive photos'], ['return', '🤝 Verify before returning'], ['safe-place', '📍 Choose a safe place'], ['money', '💰 Beware money requests'], ['reporting', '🚨 Report suspicious behavior'], ['accounts', '👤 Account security'], ['technical', '🔒 Technical security'], ['community', '🧠 Community and vulnerabilities'], ['principles', '📋 Our security principles']],
        mission: 'Make reconnections possible without compromising your safety.', help: 'Need help?', engagement: 'Your safety is part of our mission.', closing: 'RETROOVA brings items closer to their owners while protecting the people who use the platform.'
    };
    const sections = isFrench ? [
        ['privacy', '1. Protéger vos informations personnelles', '<p>Une annonce peut concerner un objet, un lieu de perte ou de découverte et parfois des documents personnels. Ne publiez jamais de numéro de téléphone, adresse personnelle, numéro de CNI ou de passeport, coordonnées bancaires, mot de passe, informations confidentielles ou informations appartenant à une autre personne.</p><p>Certaines informations peuvent être masquées ou protégées automatiquement lorsque cela est nécessaire.</p><blockquote><strong>Une annonce doit permettre d’identifier l’objet, pas d’exposer inutilement la personne.</strong></blockquote>'],
        ['documents', '2. Documents d’identité et photos sensibles', '<p>Les cartes nationales d’identité, passeports, permis, cartes professionnelles, cartes bancaires et documents administratifs peuvent contenir des informations sensibles.</p><p>RETROOVA peut appliquer des mécanismes de protection des images, notamment le <strong>floutage ou le masquage</strong> d’informations sensibles. Vérifiez néanmoins votre image avant publication et ne publiez jamais volontairement d’informations confidentielles.</p>'],
        ['phone', '3. Ne publiez pas votre numéro de téléphone', `<p>Évitez d’inscrire votre numéro directement dans le titre ou la description d’une annonce. Utilisez plutôt les fonctionnalités prévues par RETROOVA pour entrer en contact avec les personnes concernées.</p><blockquote><strong>Votre numéro de téléphone est personnel. Évitez de le rendre public dans une annonce.</strong></blockquote>`],
        ['return', '4. Vérifiez avant de restituer un objet', '<p>Une photo ou une description publiée ne constitue pas à elle seule une preuve de propriété. Demandez des éléments que seul le véritable propriétaire pourrait connaître : détail non visible, contenu, caractéristique particulière, lieu précis ou circonstances de la perte.</p><p><strong>Ne remettez jamais un objet uniquement parce qu’une personne affirme qu’il lui appartient.</strong></p>'],
        ['safe-place', '5. Privilégiez un lieu sûr', '<p>Pour une restitution, privilégiez un lieu public, fréquenté, professionnel, un établissement connu ou, lorsqu’il sera disponible, un point partenaire RETROOVA. Évitez de communiquer votre adresse personnelle lorsque cela n’est pas nécessaire.</p>'],
        ['money', '6. Attention aux demandes d’argent', '<p>Méfiez-vous d’une personne qui demande de l’argent ou des frais inhabituels, vos informations bancaires, un code reçu par SMS, votre mot de passe, ou l’installation d’un logiciel ou le clic sur un lien suspect.</p><p><strong>En cas de doute, arrêtez l’échange et signalez l’annonce ou le comportement à RETROOVA.</strong></p>'],
        ['reporting', '7. Signaler une annonce ou un comportement suspect', `<p>Vous pouvez signaler une annonce frauduleuse, fausse, exposant des données personnelles, utilisant une image inappropriée, tentant de tromper les utilisateurs, concernant un objet déjà restitué ou présentant un comportement suspect.</p><p>Chaque signalement contribue à maintenir un environnement plus sûr pour la communauté.</p><p><a class="btn btn-danger" href="${prefix}/report">Signaler une annonce <span>→</span></a></p>`],
        ['accounts', '8. Sécurité des comptes', '<p>Votre compte RETROOVA est personnel. Choisissez un mot de passe long et difficile à deviner, ne le réutilisez pas sur plusieurs services, ne le communiquez jamais et déconnectez-vous sur un appareil partagé. Contactez RETROOVA si vous pensez que votre compte a été compromis.</p><p>RETROOVA applique des mesures destinées à protéger les comptes et les sessions, avec notamment des contrôles contre les tentatives automatisées.</p>'],
        ['technical', '9. Sécurité technique', '<p>RETROOVA met en œuvre, selon les fonctionnalités concernées, des mesures destinées à protéger la plateforme et les informations traitées : communications HTTPS, protection des mots de passe, contrôle des accès, validation des données reçues, protection des sessions, contrôle des fichiers téléchargés, limitation des abus et surveillance des événements de sécurité.</p><p>Les contrôles d’autorisation doivent empêcher un utilisateur authentifié d’accéder aux données ou actions d’un autre utilisateur. Aucune mesure ne supprime cependant tous les risques.</p>'],
        ['files', '10. Sécurité des fichiers et des photos', '<p>Les contrôles appliqués aux fichiers envoyés peuvent comprendre la limitation de taille, le contrôle des formats acceptés, la génération de noms sécurisés, la validation côté serveur, le traitement des images et des mesures destinées à limiter les fichiers malveillants.</p>'],
        ['admin', '11. Protection de l’administration', '<p>L’espace d’administration bénéficie de contrôles d’accès spécifiques et ne doit pas être accessible aux utilisateurs ordinaires. Les comptes privilégiés doivent respecter le principe de moindre privilège. Des protections renforcées, comme la double authentification, pourront être ajoutées à terme ; elles ne sont pas présentées ici comme déjà disponibles.</p>'],
        ['fraud', '12. Prévention des fraudes', '<p>RETROOVA peut utiliser différents mécanismes pour limiter les comportements inhabituels ou abusifs : création massive de comptes, publications répétitives, tentatives de fraude, abus du signalement, activité automatisée excessive, tentatives répétées de connexion ou utilisation abusive de fonctionnalités.</p><p>La sécurité repose sur plusieurs couches de protection et aucun système ne détecte seul toutes les fraudes.</p>'],
        ['community', '13. La sécurité repose aussi sur la communauté', '<p>Ne prenez pas de risque : ne transmettez pas d’informations sensibles, ne versez pas d’argent et ne cliquez pas sur un lien suspect. Signalez ce qui vous semble anormal à RETROOVA.</p>'],
        ['vulnerability', '14. Vous pensez avoir découvert une faille ?', `<p>N’exploitez pas la vulnérabilité. Contactez RETROOVA en indiquant si possible la page concernée, une description, les étapes de reproduction et une capture d’écran si nécessaire.</p><p><a class="btn btn-primary" href="${prefix}/contact">Contacter RETROOVA <span>→</span></a></p>`],
        ['privacy-link', '15. Protection de votre vie privée', `<p>La sécurité et la confidentialité sont étroitement liées. RETROOVA cherche à limiter l’exposition inutile des informations personnelles et à utiliser les données dans le cadre nécessaire au fonctionnement du service.</p><p><a href="${prefix}/privacy"><strong>Consulter la Politique de confidentialité</strong></a></p>`],
        ['principles', '16. Nos principes de sécurité', '<div class="info-value-list"><div><strong>Minimiser</strong><p>Ne pas exposer plus d’informations que nécessaire.</p></div><div><strong>Protéger</strong><p>Mettre en place des mesures adaptées.</p></div><div><strong>Vérifier</strong><p>Encourager la vérification avant restitution.</p></div><div><strong>Signaler</strong><p>Permettre à la communauté d’alerter.</p></div><div><strong>Améliorer</strong><p>Faire évoluer continuellement les mécanismes de sécurité.</p></div></div>'],
        ['mission', '17. La sécurité avant la restitution', '<p>Une personne peut signaler un objet perdu, une autre un objet trouvé, et les deux peuvent entrer en relation dans de bonnes conditions.</p><blockquote><strong>Retrouver un objet est une réussite. Le restituer en toute sécurité en est une autre.</strong></blockquote>']
    ] : [
        ['privacy', '1. Protecting your personal information', '<p>A listing may concern an item, a place, or personal documents. Never publish a phone number, home address, national ID or passport number, banking details, password, confidential information, or another person’s personal information.</p><p>Some information may be automatically hidden or protected where necessary.</p><blockquote><strong>A listing should identify the item, not unnecessarily expose the person.</strong></blockquote>'],
        ['documents', '2. Identity documents and sensitive photos', '<p>Identity cards, passports, driving licences, professional cards, bank cards, and administrative documents may contain sensitive information.</p><p>RETROOVA may protect images by <strong>blurring or masking</strong> sensitive information. Still review images before publishing and never knowingly publish confidential information.</p>'],
        ['phone', '3. Do not publish your phone number', `<p>Avoid placing your phone number in a listing title or description. Use RETROOVA features to contact the people concerned.</p><blockquote><strong>Your phone number is personal. Avoid making it public in a listing.</strong></blockquote>`],
        ['return', '4. Verify before returning an item', '<p>A published photo or description alone is not proof of ownership. Ask for details only the true owner could know, such as a hidden detail, contents, a specific feature, the precise loss location, or the circumstances of the loss.</p><p><strong>Never return an item only because someone claims it belongs to them.</strong></p>'],
        ['safe-place', '5. Choose a safe place', '<p>For a return, choose a public, busy, professional, or known place, or a RETROOVA partner point when available. Avoid sharing your home address unless necessary.</p>'],
        ['money', '6. Beware money requests', '<p>Be cautious if someone asks for money, unusual fees, banking information, an SMS code, your password, software installation, or a click on a suspicious link.</p><p><strong>When in doubt, stop the exchange and report the listing or behavior to RETROOVA.</strong></p>'],
        ['reporting', '7. Report suspicious listings or behavior', `<p>You can report fraud, false information, exposed personal data, inappropriate images, attempts to deceive, an already returned item, or suspicious behavior.</p><p>Every report helps maintain a safer community.</p><p><a class="btn btn-danger" href="${prefix}/report">Report a listing <span>→</span></a></p>`],
        ['accounts', '8. Account security', '<p>Your RETROOVA account is personal. Choose a long, hard-to-guess password, do not reuse it across services, never share it, and sign out on shared devices. Contact RETROOVA if you think your account was compromised.</p><p>RETROOVA applies measures intended to protect accounts and sessions, including controls against automated attempts.</p>'],
        ['technical', '9. Technical security', '<p>Depending on the feature, RETROOVA may use HTTPS communications, password protection, access controls, input validation, session protection, uploaded-file controls, abuse limiting, and security-event monitoring.</p><p>Authorization controls should prevent an authenticated user from accessing another user’s data or actions. No measure removes every risk.</p>'],
        ['files', '10. File and photo security', '<p>Controls for uploaded files may include size limits, accepted-format checks, secure filename generation, server-side validation, image processing, and measures intended to limit malicious files.</p>'],
        ['admin', '11. Administration protection', '<p>The administration area has specific access controls and should not be available to ordinary users. Privileged accounts should follow least privilege. Stronger protections such as MFA may be added in the future; they are not presented here as already available.</p>'],
        ['fraud', '12. Fraud prevention', '<p>RETROOVA may use mechanisms to limit unusual or abusive behavior, including mass account creation, repeated listings, fraud attempts, reporting abuse, excessive automation, repeated login attempts, or misuse of features.</p><p>Security uses several layers, and no system detects every fraud on its own.</p>'],
        ['community', '13. Security also relies on the community', '<p>Do not take risks: do not share sensitive information, send money, or click suspicious links. Report anything unusual to RETROOVA.</p>'],
        ['vulnerability', '14. Think you found a vulnerability?', `<p>Do not exploit it. Contact RETROOVA and, if possible, include the affected page, a description, reproduction steps, and a screenshot.</p><p><a class="btn btn-primary" href="${prefix}/contact">Contact RETROOVA <span>→</span></a></p>`],
        ['privacy-link', '15. Protecting your privacy', `<p>Security and privacy are closely connected. RETROOVA seeks to limit unnecessary exposure of personal information and use data only as needed to operate the service.</p><p><a href="${prefix}/privacy"><strong>Read the Privacy policy</strong></a></p>`],
        ['principles', '16. Our security principles', '<div class="info-value-list"><div><strong>Minimize</strong><p>Do not expose more information than necessary.</p></div><div><strong>Protect</strong><p>Use appropriate measures.</p></div><div><strong>Verify</strong><p>Encourage checks before returns.</p></div><div><strong>Report</strong><p>Let the community raise alerts.</p></div><div><strong>Improve</strong><p>Continuously improve security measures.</p></div></div>'],
        ['mission', '17. Security before the return', '<p>One person can report a lost item, another a found item, and both can connect under better conditions.</p><blockquote><strong>Finding an item is a success. Returning it safely is another.</strong></blockquote>']
    ];
    const toc = text.tocItems.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('');
    const renderedSections = sections.map(([id, heading, body]) => `<section id="${id}" class="terms-section security-section"><h2>${heading}</h2>${body}</section>`).join('');
    return `<p class="terms-updated"><strong>${text.update}</strong></p><section class="terms-intro"><h2>${text.title}</h2><p>${text.intro}</p><blockquote><strong>${text.mission}</strong></blockquote></section><nav class="terms-toc" aria-label="${text.toc}"><h2>${text.toc}</h2><ul>${toc}</ul></nav>${renderedSections}<section class="security-help"><h2>${text.help}</h2><p><a href="${prefix}/help">Centre d’aide / Help Center</a> · <a href="${prefix}/report">Signaler / Report</a> · <a href="${prefix}/contact">Contact</a> · <a href="${prefix}/privacy">Politique de confidentialité / Privacy policy</a></p></section><section class="security-closing"><h2>${text.engagement}</h2><p><strong>${text.closing}</strong></p></section>`;
};

const buildAboutPageMarkup = (locale = 'fr') => {
    const isFrench = locale === 'fr';
    const prefix = `/${locale}`;
    const text = isFrench ? ({
        title: 'Donner une seconde chance aux objets perdus', intro: 'Chaque jour, des objets sont perdus. Et chaque jour, d’autres sont retrouvés par des personnes qui ne savent pas toujours comment retrouver leur propriétaire.',
        missionIntro: 'Notre mission est de faciliter la déclaration, la recherche et la restitution des objets perdus et trouvés grâce à une plateforme simple, accessible et sécurisée.',
        linkPartners: 'Découvrez nos possibilités de partenariat.', partners: 'Partenariats', help: 'Centre d’aide', contact: 'Nous contacter', security: 'Sécurité', privacy: 'Politique de confidentialité', terms: 'Conditions d’utilisation',
        sections: [
            ['platform', '🌍 Une plateforme pensée pour rapprocher', '<p>RETROOVA est née d’une idée simple : <strong>et si retrouver un objet perdu devenait aussi simple que le signaler ?</strong></p><p>Lorsqu’une personne perd un téléphone, un portefeuille, un document, des clés, un sac ou tout autre objet important, elle dispose souvent de peu de moyens pour faire savoir qu’elle le recherche.</p><p>De l’autre côté, une personne peut retrouver cet objet sans savoir à qui le remettre. RETROOVA cherche à créer un espace commun où les objets <strong>perdus</strong> et <strong>trouvés</strong> peuvent être déclarés, recherchés et rapprochés.</p>'],
            ['how', '🔎 Comment fonctionne RETROOVA ?', '<p>Le principe est simple : une annonce claire, une recherche attentive, puis une vérification avant toute restitution.</p><div class="about-steps"><div><span>01</span><h3>Déclarer</h3><p>Créez une annonce avec les informations utiles pour identifier l’objet.</p></div><div><span>02</span><h3>Rechercher</h3><p>Trouvez des annonces correspondant à l’objet, la catégorie ou la localisation.</p></div><div><span>03</span><h3>Vérifier</h3><p>Les informations publiques ne constituent pas à elles seules une preuve de propriété.</p></div><div><span>04</span><h3>Contacter</h3><p>Lorsque cela est pertinent, les utilisateurs peuvent échanger pour confirmer la correspondance.</p></div><div><span>05</span><h3>Restituer</h3><p>Les personnes peuvent organiser la restitution dans des conditions adaptées et sûres.</p></div></div>'],
            ['mission', '🧭 Notre mission', '<p class="about-callout-title"><strong>Faciliter les retrouvailles.</strong></p><blockquote><strong>Aider les objets perdus à retrouver leur chemin vers leurs propriétaires.</strong></blockquote><div class="about-pillars"><div><strong>Simple</strong><span>Déclarer un objet ne devrait pas être compliqué.</span></div><div><strong>Accessible</strong><span>La perte d’un objet peut arriver à n’importe qui.</span></div><div><strong>Sécurisée</strong><span>Retrouver un objet ne doit pas exposer inutilement les personnes.</span></div><div><strong>Responsable</strong><span>Les informations publiées doivent être utilisées avec respect.</span></div><div><strong>Internationale</strong><span>Le problème des objets perdus ne s’arrête pas aux frontières.</span></div></div>'],
            ['trust', '🛡️ La confiance avant tout', '<p>Nous encourageons les utilisateurs à vérifier l’identité du propriétaire avant une restitution, ne pas publier d’informations sensibles, rester prudents lors des rencontres, signaler les annonces suspectes et ne jamais envoyer d’argent à une personne simplement parce qu’elle affirme être propriétaire.</p><blockquote><strong>Identifier suffisamment l’objet pour permettre sa restitution, sans exposer inutilement la personne.</strong></blockquote>'],
            ['technology', '🔐 La technologie au service d’une mission humaine', '<p>La recherche, la localisation, les comptes utilisateurs, les annonces, les systèmes de signalement et les mécanismes de protection permettent de créer un environnement dans lequel les utilisateurs peuvent agir plus facilement.</p><p>Mais la technologie ne remplace pas le discernement humain. Une correspondance trouvée sur RETROOVA doit toujours être <strong>vérifiée avant toute restitution</strong>.</p>'],
            ['partners', '🤝 Plus qu’une plateforme pour les particuliers', `<p>La perte d’objets concerne aussi les hôtels, restaurants, aéroports, gares, transports, établissements scolaires, entreprises, administrations, centres commerciaux, associations et lieux accueillant du public.</p><p>Ces organisations peuvent jouer un rôle essentiel dans la récupération et la restitution des objets retrouvés.</p><p><strong>Vous représentez une organisation ?</strong> <a href="${prefix}/partnerships">Découvrez nos possibilités de partenariat.</a></p><p><a class="btn btn-primary" href="${prefix}/partnerships">Partenariats <span>→</span></a></p>`],
            ['ambition', '🌍 Une ambition internationale', '<p>Un téléphone oublié dans un taxi, un passeport perdu dans un aéroport, un sac laissé dans un hôtel ou des clés oubliées dans un lieu public : ces situations peuvent arriver partout.</p><p>RETROOVA a vocation à évoluer au-delà d’un seul pays ou d’une seule ville, afin de faciliter progressivement les recherches localement, nationalement et à terme internationalement.</p>'],
            ['vision', '🚀 Notre vision', '<p>Nous imaginons un monde dans lequel une personne qui perd un objet ne se demande plus seulement : <em>« Comment vais-je pouvoir le retrouver ? »</em>, mais aussi : <em>« Est-ce que quelqu’un l’a déjà déclaré sur RETROOVA ? »</em></p><p>Nous voulons devenir un point de référence où particuliers, entreprises et institutions contribuent à rendre les restitutions <strong>plus simples, plus rapides et plus sûres</strong>.</p>'],
            ['values', '💙 Nos valeurs', '<div class="info-value-list about-values"><div><strong>Confiance</strong><p>Créer un environnement où les utilisateurs peuvent interagir avec davantage de sécurité.</p></div><div><strong>Respect</strong><p>Respecter les personnes, leurs informations et leurs biens.</p></div><div><strong>Transparence</strong><p>Expliquer clairement comment fonctionne la plateforme.</p></div><div><strong>Responsabilité</strong><p>Encourager chaque utilisateur à agir honnêtement.</p></div><div><strong>Innovation</strong><p>Utiliser la technologie lorsqu’elle améliore réellement la restitution.</p></div><div><strong>Impact</strong><p>Mesurer notre réussite par les objets qui retrouvent leur propriétaire.</p></div></div>'],
            ['success', '📊 Notre vision de la réussite', '<p>Pour RETROOVA, une annonce publiée n’est pas une fin.</p><div class="about-recovery-flow"><strong>Objet perdu</strong><span>↓</span><strong>Objet retrouvé</strong><span>↓</span><strong>Propriétaire identifié</strong><span>↓</span><strong>Restitution</strong></div><p class="about-success-note">❤️ <strong>Objet retrouvé. Histoire terminée.</strong></p>'],
            ['safety', '🛡️ Votre sécurité compte', `<p>La protection de la vie privée et la sécurité font partie intégrante de notre approche.</p><div class="about-link-row"><a href="${prefix}/security">Sécurité</a><a href="${prefix}/privacy">Politique de confidentialité</a><a href="${prefix}/terms">Conditions d’utilisation</a></div>`],
            ['together', '🤝 Construisons RETROOVA ensemble', `<p>RETROOVA est conçu pour évoluer avec ses utilisateurs. Vos remarques, suggestions et expériences peuvent contribuer à améliorer la plateforme.</p><p>Vous avez une idée ? Vous rencontrez un problème ? Vous souhaitez collaborer avec RETROOVA ?</p><p><strong>Nous sommes à votre écoute.</strong></p><div class="about-link-row"><a class="btn btn-primary" href="${prefix}/contact">Nous contacter <span>→</span></a><a class="btn btn-secondary" href="${prefix}/partnerships">Partenariats <span>→</span></a></div>`]
        ]
    }) : ({
        title: 'Give lost items a second chance', intro: 'Every day, items are lost. And every day, others are found by people who do not always know how to reach their owner.',
        missionIntro: 'Our mission is to make reporting, searching for, and returning lost and found items easier through a simple, accessible, and secure platform.',
        linkPartners: 'Discover our partnership opportunities.', partners: 'Partnerships', help: 'Help Center', contact: 'Contact us', security: 'Security', privacy: 'Privacy policy', terms: 'Terms of use',
        sections: [
            ['platform', '🌍 A platform designed to reconnect', '<p>RETROOVA was born from a simple idea: <strong>what if finding a lost item became as easy as reporting it?</strong></p><p>When someone loses a phone, wallet, document, keys, bag, or any other important item, they often have few ways to let people know they are looking for it.</p><p>Someone else may find that item without knowing who to return it to. RETROOVA creates a shared space where <strong>lost</strong> and <strong>found</strong> items can be reported, searched, and brought closer together.</p>'],
            ['how', '🔎 How does RETROOVA work?', '<p>The principle is simple: a clear listing, a careful search, and verification before any return.</p><div class="about-steps"><div><span>01</span><h3>Report</h3><p>Create a listing with useful information to identify the item.</p></div><div><span>02</span><h3>Search</h3><p>Find listings matching the item, category, or location.</p></div><div><span>03</span><h3>Verify</h3><p>Public information alone is not proof of ownership.</p></div><div><span>04</span><h3>Contact</h3><p>When relevant, users can exchange information to confirm a match.</p></div><div><span>05</span><h3>Return</h3><p>People can arrange a return in suitable and safe conditions.</p></div></div>'],
            ['mission', '🧭 Our mission', '<p class="about-callout-title"><strong>Make reconnections possible.</strong></p><blockquote><strong>Help lost items find their way back to their owners.</strong></blockquote><div class="about-pillars"><div><strong>Simple</strong><span>Reporting an item should not be complicated.</span></div><div><strong>Accessible</strong><span>Anyone can lose something important.</span></div><div><strong>Secure</strong><span>Finding an item should not unnecessarily expose people.</span></div><div><strong>Responsible</strong><span>Published information must be treated with respect.</span></div><div><strong>International</strong><span>Lost items do not stop at borders.</span></div></div>'],
            ['trust', '🛡️ Trust comes first', '<p>We encourage users to verify an owner’s identity before a return, avoid publishing sensitive information, stay careful during meetings, report suspicious listings, and never send money simply because someone claims to own an item.</p><blockquote><strong>Identify the item well enough for its return without unnecessarily exposing the person.</strong></blockquote>'],
            ['technology', '🔐 Technology serving a human mission', '<p>Search, location, user accounts, listings, reporting systems, and protection mechanisms help create an environment where users can act more easily.</p><p>Technology does not replace human judgment. A potential match found on RETROOVA must always be <strong>verified before any return</strong>.</p>'],
            ['partners', '🤝 More than a platform for individuals', `<p>Lost items also concern hotels, restaurants, airports, stations, transport companies, schools, businesses, public administrations, shopping centers, associations, and public venues.</p><p>These organizations can play an essential role in recovering and returning found items.</p><p><strong>Do you represent an organization?</strong> <a href="${prefix}/partnerships">Discover our partnership opportunities.</a></p><p><a class="btn btn-primary" href="${prefix}/partnerships">Partnerships <span>→</span></a></p>`],
            ['ambition', '🌍 An international ambition', '<p>A phone left in a taxi, a passport lost at an airport, a bag left in a hotel, or keys forgotten in a public place: these situations can happen anywhere.</p><p>RETROOVA is intended to grow beyond one country or city and progressively make searches easier locally, nationally, and eventually internationally.</p>'],
            ['vision', '🚀 Our vision', '<p>We imagine a world where someone who loses an item no longer asks only <em>“How will I find it?”</em>, but also <em>“Has someone already reported it on RETROOVA?”</em></p><p>We want to become a reference point where individuals, businesses, and institutions help make returns <strong>simpler, faster, and safer</strong>.</p>'],
            ['values', '💙 Our values', '<div class="info-value-list about-values"><div><strong>Trust</strong><p>Create an environment where users can interact more safely.</p></div><div><strong>Respect</strong><p>Respect people, their information, and their belongings.</p></div><div><strong>Transparency</strong><p>Explain clearly how the platform works.</p></div><div><strong>Responsibility</strong><p>Encourage every user to act honestly.</p></div><div><strong>Innovation</strong><p>Use technology when it genuinely improves returns.</p></div><div><strong>Impact</strong><p>Measure success by the items that reach their owners.</p></div></div>'],
            ['success', '📊 How we define success', '<p>For RETROOVA, a published listing is not the end.</p><div class="about-recovery-flow"><strong>Lost item</strong><span>↓</span><strong>Found item</strong><span>↓</span><strong>Owner identified</strong><span>↓</span><strong>Return</strong></div><p class="about-success-note">❤️ <strong>Item recovered. Story complete.</strong></p>'],
            ['safety', '🛡️ Your safety matters', `<p>Privacy and security are part of our approach.</p><div class="about-link-row"><a href="${prefix}/security">Security</a><a href="${prefix}/privacy">Privacy policy</a><a href="${prefix}/terms">Terms of use</a></div>`],
            ['together', '🤝 Let’s build RETROOVA together', `<p>RETROOVA is designed to evolve with its users. Your feedback, suggestions, and experiences can help improve the platform.</p><p>Have an idea? Encountered a problem? Want to collaborate with RETROOVA?</p><p><strong>We are listening.</strong></p><div class="about-link-row"><a class="btn btn-primary" href="${prefix}/contact">Contact us <span>→</span></a><a class="btn btn-secondary" href="${prefix}/partnerships">Partnerships <span>→</span></a></div>`]
        ]
    });
    const renderedSections = text.sections.map(([id, heading, body]) => `<section id="about-${id}" class="about-section"><h2>${heading}</h2>${body}</section>`).join('');
    const toc = text.sections.map(([id, heading]) => `<li><a href="#about-${id}">${heading}</a></li>`).join('');
    return `<section class="about-hero"><p class="about-kicker">RETROOVA · LOST · FOUND · RETURNED</p><h2>${text.title}</h2><p class="about-hero-intro">${text.intro}</p><blockquote><strong>${isFrench ? 'Un objet perdu n’est pas forcément un objet perdu pour toujours.' : 'A lost item is not necessarily lost forever.'}</strong></blockquote></section><section class="about-mission-intro"><p>${text.missionIntro}</p></section><nav class="about-toc" aria-label="${isFrench ? 'Sommaire de la page À propos' : 'About page contents'}"><h2>${isFrench ? 'Sommaire' : 'Contents'}</h2><ul>${toc}</ul></nav>${renderedSections}<section class="about-final-mark"><p>RETROOVA</p><strong>Lost. Found. Returned.</strong><span>${isFrench ? 'Perdu. Trouvé. Restitué.' : 'Lost. Found. Returned.'}</span><blockquote><strong>${isFrench ? 'Parce qu’un objet perdu mérite une chance de retrouver son propriétaire.' : 'Because a lost item deserves a chance to find its owner.'}</strong></blockquote></section>`;
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
        fr: ['À propos de RETROOVA', 'Une plateforme conçue pour rapprocher les objets perdus de leurs propriétaires.', () => buildAboutPageMarkup('fr')],
        en: ['About RETROOVA', 'A platform designed to reconnect lost items with their owners.', () => buildAboutPageMarkup('en')]
    },
    '/privacy': {
        fr: ['Politique de confidentialité', 'Protection des données, sécurité des utilisateurs et transparence.', () => buildPrivacyPageMarkup('fr')],
        en: ['Privacy policy', 'Data protection, user security and transparency.', () => buildPrivacyPageMarkup('en')]
    },
    '/terms': {
        fr: ["Conditions d'utilisation", 'Les règles essentielles pour une utilisation sûre et responsable de RETROOVA.', () => buildTermsPageMarkup('fr')],
        en: ['Terms of use', 'The key rules for a safe and responsible use of RETROOVA.', () => buildTermsPageMarkup('en')]
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
        fr: ['Sécurité', 'Votre sécurité est notre priorité.', () => buildSecurityPageMarkup('fr')],
        en: ['Security', 'Your safety is our priority.', () => buildSecurityPageMarkup('en')]
    },
    '/help': {
        fr: ['Centre d’aide RETROOVA', 'Comment pouvons-nous vous aider ?', () => buildHelpPageMarkup('fr')],
        en: ['RETROVA Help Center', 'How can we help?', () => buildHelpPageMarkup('en')]
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
    contact = (req, res) => res.render('pages/contact', {
        title: req.t('contact.title', 'Parlons de votre besoin'),
        formData: {},
        error: req.query.error === 'attachment' ? req.t('contact.invalidAttachment', 'La pièce jointe est invalide ou dépasse 5 Mo.') : ''
    });
    show = (req, res) => {
        const locale = req.locale || 'fr';
        const page = getLocalizedPage(pages[req.path] || pages['/help'], locale);
        const [title, lead, content] = Array.isArray(page) ? page : [page.title, page.lead, page.content];
        const currentFaqItems = req.path === '/help' ? [] : getLocalizedFaqItems(locale);
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
    submitContact = async (req, res) => {
        const formData = {
            name: String(req.body.name || '').trim(),
            email: String(req.body.email || '').trim().toLowerCase(),
            subject: String(req.body.subject || '').trim(),
            itemReference: String(req.body.item_reference || '').trim(),
            message: String(req.body.message || '').trim()
        };
        const subjects = new Set(['general', 'technical', 'account', 'listing', 'suggestion', 'partnership', 'press', 'other']);
        const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        if (formData.name.length < 2 || formData.name.length > 120 || !emailIsValid || !subjects.has(formData.subject) || formData.itemReference.length > 80 || formData.message.length < 2 || formData.message.length > 5000) {
            return res.status(422).render('pages/contact', { title: req.t('contact.title', 'Parlons de votre besoin'), formData, error: req.t('contact.invalid', 'Vérifiez les champs obligatoires puis réessayez.') });
        }
        const now = new Date();
        const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const publicReference = `RET-CON-${datePart}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        const requestId = crypto.randomUUID();
        await this.adminModel.createContactRequest({ id: requestId, publicReference, ...formData, attachment: req.file?.filename });
        res.render('pages/contact-success', { title: req.t('contact.successTitle', 'Message envoyé avec succès !'), publicReference });
    };
    report = (req, res) => res.redirect('/help');
}

module.exports = InfoController;
