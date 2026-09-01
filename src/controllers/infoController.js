const faqItems = [
    {
        question: 'Comment retrouver un objet perdu ?',
        answer: 'Déclarez la perte, utilisez les filtres de recherche et comparez les annonces similaires pour identifier une correspondance fiable.'
    },
    {
        question: 'Que faire si j’ai trouvé un objet ?',
        answer: 'Publiez une annonce avec une description claire, le lieu et la date de découverte, puis attendez les échanges sécurisés sur la plateforme.'
    },
    {
        question: 'Puis-je signaler une annonce suspecte ?',
        answer: 'Oui. Le système de signalement permet d’alerter la modération sur les annonces ou comportements anormaux.'
    }
];

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

const buildPartnershipPageMarkup = (csrfToken = '') => `
        <section class="partnership-hero">
            <div class="partnership-visual">
                <img src="/images/image_partenaires.png" alt="Illustration de partenaires RETROOVA" loading="lazy">
            </div>
            <div class="partnership-copy">
                <span class="eyebrow partnership-label">RETROOVA PARTNERS</span>
                <h2>Building the world's lost &amp; found network.</h2>
                <p><strong>RETROOVA accompagne les organisations qui veulent créer un écosystème plus sûr, plus utile et plus connecté autour des objets retrouvés.</strong></p>
                <p>Que vous soyez une entreprise, une structure publique, un établissement d'accueil, un réseau de transport ou une institution locale, votre collaboration peut aider davantage de personnes à retrouver ce qu'elles ont perdu.</p>
                <a href="#partnership-form" class="btn btn-primary">Devenir partenaire <span>→</span></a>
            </div>
        </section>
        <section>
            <h3>Pourquoi collaborer avec RETROOVA ?</h3>
            <div class="info-value-list">
                <div><strong>🤝 Visibilité locale</strong><p>Rendez votre organisation visible dans des situations concrètes où des objets sont perdus, retrouvés et réclamés.</p></div>
                <div><strong>🛡️ Sécurité renforcée</strong><p>Favorisez une gestion plus claire et plus fiable des objets retrouvés dans les lieux d'accueil, les gares, les hôtels ou les campus.</p></div>
                <div><strong>📍 Réseau de confiance</strong><p>Consolidez des partenariats utiles entre acteurs publics, privés et institutionnels autour d'un même objectif.</p></div>
                <div><strong>💬 Expérience utilisateur</strong><p>Offrez à vos visiteurs un service simple, utile et rassurant en intégrant une solution de restitution d'objets.</p></div>
            </div>
        </section>
        <section>
            <h3>Les organisations qui peuvent participer</h3>
            <ul>
                <li>hôtels, aéroports, gares et entreprises de transport ;</li>
                <li>universités, écoles, centres culturels et établissements publics ;</li>
                <li>structures sociales, associations et organisations locales ;</li>
                <li>plateformes ou services qui souhaitent accompagner les usagers dans la recherche d'objets perdus.</li>
            </ul>
        </section>
        <section>
            <h3>Comment se déroule un partenariat ?</h3>
            <ol>
                <li><strong>Échange de besoins</strong> : nous identifions les usages, les enjeux et les objectifs de votre organisation.</li>
                <li><strong>Définition du cadre</strong> : nous précisons les modalités de diffusion, de sensibilisation et d'accompagnement.</li>
                <li><strong>Activation</strong> : le partenariat est lancé avec une mise en œuvre adaptée à votre contexte.</li>
                <li><strong>Suivi</strong> : nous évaluons les résultats et ajustons la collaboration en fonction des retours.</li>
            </ol>
        </section>
        <section id="partnership-form" class="partnership-form-wrap">
            <div class="partnership-form-box">
                <div class="partnership-form-header">
                    <span class="eyebrow">DEVENIR PARTENAIRE</span>
                    <h3>Parlons de votre projet</h3>
                </div>
                <form method="POST" action="/partnerships" class="partnership-form">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <div class="form-grid">
                        <label class="form-group"><span>Nom / Organisation *</span><input type="text" name="organization_name" placeholder="Ex. ABC Hotels" required></label>
                        <label class="form-group"><span>Nom du contact *</span><input type="text" name="contact_name" placeholder="Votre nom" required></label>
                        <label class="form-group"><span>Email professionnel *</span><input type="email" name="email" placeholder="contact@entreprise.com" required></label>
                        <label class="form-group"><span>Type de partenariat *</span><select name="partnership_type" required><option value="">Sélection :</option>
                            <option>Entreprise</option>
                            <option>Hôtel / Tourisme</option>
                            <option>Aéroport / Compagnie aérienne</option>
                            <option>Transport &amp; mobilité</option>
                            <option>École / Université</option>
                            <option>Institution / Collectivité</option>
                            <option>Événement</option>
                            <option>Association / ONG</option>
                            <option>Partenaire technologique</option>
                            <option>Partenariat stratégique</option>
                            <option>Autre</option>
                        </select></label>
                        <label class="form-group form-span-2"><span>Pays / Région</span><input type="text" name="country" placeholder="Votre pays ou région"></label>
                        <label class="form-group form-span-2"><span>Votre projet ou proposition</span><textarea name="message" rows="5" placeholder="Expliquez-nous brièvement comment vous envisagez une collaboration avec RETROOVA..."></textarea></label>
                    </div>
                    <button type="submit" class="btn btn-primary partnership-submit">Envoyer une demande de partenariat <span>→</span></button>
                    <p class="partnership-note">Nous étudions chaque demande avec attention et vous recontacterons dans les meilleurs délais.</p>
                </form>
            </div>
        </section>
`;

const pages = {
    '/how-it-works': ['Comment ça marche', 'RETROOVA aide à rapprocher les objets perdus de leurs propriétaires.', `
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
    '/about': ['À propos de RETROOVA', 'Une plateforme conçue pour rapprocher les objets perdus de leurs propriétaires.', `
        <section>
            <h2>À propos de RETROOVA</h2>
            <p><strong>RETROOVA est une plateforme conçue pour rapprocher les objets perdus de leurs propriétaires.</strong></p>
            <p>Chaque jour, des personnes perdent des téléphones, portefeuilles, documents, clés, sacs, bagages et de nombreux autres objets.</p>
            <p>Dans le même temps, d'autres personnes retrouvent ces objets sans toujours savoir comment retrouver leur propriétaire.</p>
            <p><strong>RETROOVA crée le lien entre ces deux situations.</strong></p>
        </section>
        <section>
            <h3>Notre mission</h3>
            <p>Notre mission est de rendre la recherche et la restitution des objets perdus <strong>plus simples, plus rapides et plus sûres</strong>.</p>
            <ul>
                <li>une personne peut facilement déclarer ce qu'elle a perdu ;</li>
                <li>une personne ayant trouvé un objet peut facilement le signaler ;</li>
                <li>les déclarations pertinentes peuvent être rapprochées ;</li>
                <li>les échanges peuvent se faire dans un environnement plus sécurisé ;</li>
                <li>la vie privée des utilisateurs est respectée.</li>
            </ul>
        </section>
        <section>
            <h3>Notre vision</h3>
            <p>Nous souhaitons faire de RETROOVA une plateforme accessible au-delà des frontières, capable de connecter les personnes qui cherchent un objet avec celles qui l'ont retrouvé, où qu'elles se trouvent.</p>
        </section>
        <section>
            <h3>Nos valeurs</h3>
            <div class="info-value-list">
                <div><strong>🤝 Solidarité</strong><p>Parce que retrouver un objet peut parfois changer une journée, voire bien plus.</p></div>
                <div><strong>🔐 Confiance</strong><p>La sécurité et la protection des utilisateurs sont au cœur de notre conception.</p></div>
                <div><strong>🌍 Accessibilité</strong><p>Le service doit rester simple et compréhensible pour tous.</p></div>
                <div><strong>⚡ Simplicité</strong><p>Perdre un objet est déjà suffisamment stressant. Le processus de recherche ne devrait pas l'être davantage.</p></div>
            </div>
        </section>
    `],
    '/privacy': ['Politique de confidentialité', 'Protection des données, sécurité des utilisateurs et transparence.', `
        <section>
            <h2>Politique de confidentialité</h2>
            <p><strong>Dernière mise à jour : 24 août 2026</strong></p>
            <p>RETROOVA accorde une importance particulière à la protection des données personnelles de ses utilisateurs.</p>
            <p>La présente politique explique quelles informations peuvent être collectées, pourquoi elles sont utilisées et quelles mesures sont mises en place pour les protéger.</p>
        </section>
        <section>
            <h3>1. Données que nous pouvons collecter</h3>
            <p>Selon votre utilisation de RETROOVA, nous pouvons collecter :</p>
            <ul>
                <li>nom ou pseudonyme ;</li>
                <li>adresse électronique ;</li>
                <li>numéro de téléphone lorsque vous choisissez de le fournir ;</li>
                <li>pays et ville ;</li>
                <li>informations relatives aux objets perdus ou trouvés ;</li>
                <li>photographies publiées ;</li>
                <li>messages échangés via la plateforme ;</li>
                <li>informations techniques nécessaires au fonctionnement du service.</li>
            </ul>
        </section>
        <section>
            <h3>2. Utilisation des données</h3>
            <p>Les données peuvent être utilisées pour :</p>
            <ul>
                <li>créer et gérer votre compte ;</li>
                <li>publier vos déclarations ;</li>
                <li>rechercher des correspondances ;</li>
                <li>vous envoyer des notifications ;</li>
                <li>faciliter les échanges entre utilisateurs ;</li>
                <li>assurer la sécurité de la plateforme ;</li>
                <li>prévenir les abus et les fraudes ;</li>
                <li>améliorer le fonctionnement de RETROOVA.</li>
            </ul>
        </section>
        <section>
            <h3>3. Informations publiques</h3>
            <p>Certaines informations relatives à une annonce peuvent être visibles par les autres utilisateurs.</p>
            <p>Toutefois, RETROOVA ne doit pas exposer publiquement les informations personnelles sensibles telles que :</p>
            <ul>
                <li>adresse personnelle ;</li>
                <li>numéro de téléphone ;</li>
                <li>adresse électronique ;</li>
                <li>numéro complet d'un document officiel ;</li>
                <li>informations bancaires.</li>
            </ul>
        </section>
        <section>
            <h3>4. Documents officiels</h3>
            <p>Pour des raisons de sécurité, nous déconseillons fortement de publier des numéros complets de :</p>
            <ul>
                <li>carte d'identité ;</li>
                <li>passeport ;</li>
                <li>permis de conduire ;</li>
                <li>carte bancaire ;</li>
                <li>tout autre document contenant des données sensibles.</li>
            </ul>
        </section>
        <section>
            <h3>5. Conservation</h3>
            <p>Les données sont conservées uniquement pendant la durée nécessaire au fonctionnement du service ou conformément aux obligations légales applicables.</p>
        </section>
        <section>
            <h3>6. Vos droits</h3>
            <p>Selon votre pays et la réglementation applicable, vous pouvez notamment demander :</p>
            <ul>
                <li>l'accès à vos données ;</li>
                <li>leur rectification ;</li>
                <li>leur suppression ;</li>
                <li>la limitation de certains traitements ;</li>
                <li>la récupération de vos données lorsque cela est applicable.</li>
            </ul>
        </section>
        <section>
            <h3>7. Contact</h3>
            <p>Pour toute question concernant vos données personnelles :</p>
            <p><a href="mailto:cyberagba6@gmail.com">cyberagba6@gmail.com</a></p>
            <blockquote>Important : cette page devra être adaptée avec les mentions légales et obligations réellement applicables au pays où RETROOVA sera exploité.</blockquote>
        </section>
    `],
    '/terms': ["Conditions d'utilisation", 'Les règles essentielles pour une utilisation sûre et responsable de RETROOVA.', `
        <section>
            <h2>Conditions générales d'utilisation</h2>
            <p><strong>Dernière mise à jour : 24 août 2026</strong></p>
            <p>Bienvenue sur RETROOVA. En utilisant RETROOVA, vous acceptez les présentes conditions d'utilisation.</p>
        </section>
        <section>
            <h3>1. Objet du service</h3>
            <p>RETROOVA permet aux utilisateurs de publier et de rechercher des déclarations concernant des objets perdus ou trouvés.</p>
            <p>RETROOVA fournit une plateforme de mise en relation et ne garantit pas qu'un objet sera retrouvé ou restitué.</p>
        </section>
        <section>
            <h3>2. Responsabilité de l'utilisateur</h3>
            <p>Chaque utilisateur est responsable des informations qu'il publie. Il s'engage notamment à :</p>
            <ul>
                <li>fournir des informations exactes ;</li>
                <li>ne pas publier volontairement de fausses annonces ;</li>
                <li>ne pas usurper l'identité d'une autre personne ;</li>
                <li>ne pas utiliser RETROOVA à des fins frauduleuses ;</li>
                <li>respecter les autres utilisateurs ;</li>
                <li>ne pas publier de données personnelles sensibles.</li>
            </ul>
        </section>
        <section>
            <h3>3. Objets trouvés</h3>
            <p>La déclaration d'un objet trouvé ne constitue pas une preuve de propriété.</p>
            <p>Avant toute restitution, les utilisateurs doivent prendre les précautions nécessaires pour vérifier que la personne qui réclame l'objet en est réellement le propriétaire.</p>
        </section>
        <section>
            <h3>4. Communications</h3>
            <p>RETROOVA peut proposer des outils permettant aux utilisateurs de communiquer.</p>
            <p>Les utilisateurs doivent rester vigilants et ne jamais transmettre inutilement :</p>
            <ul>
                <li>mots de passe ;</li>
                <li>codes bancaires ;</li>
                <li>codes de validation ;</li>
                <li>informations financières sensibles.</li>
            </ul>
        </section>
        <section>
            <h3>5. Contenus interdits</h3>
            <p>Sont notamment interdits :</p>
            <ul>
                <li>fausses déclarations ;</li>
                <li>escroquerie ;</li>
                <li>usurpation d'identité ;</li>
                <li>contenu illégal ;</li>
                <li>menaces ;</li>
                <li>harcèlement ;</li>
                <li>publication de données personnelles sans autorisation.</li>
            </ul>
        </section>
        <section>
            <h3>6. Suspension</h3>
            <p>RETROOVA peut suspendre ou supprimer un compte ou une annonce lorsqu'une utilisation abusive ou contraire aux règles est constatée.</p>
        </section>
        <section>
            <h3>7. Limitation</h3>
            <p>RETROOVA facilite la mise en relation mais ne peut garantir :</p>
            <ul>
                <li>l'exactitude de toutes les annonces ;</li>
                <li>l'identité réelle de chaque utilisateur ;</li>
                <li>la récupération d'un objet ;</li>
                <li>la restitution effective d'un objet.</li>
            </ul>
            <p>Les utilisateurs restent responsables de leurs échanges et décisions.</p>
        </section>
    `],
    '/contact': ['Contact', 'Une question, une suggestion ou un problème ?', `
        <section>
            <h2>Contactez RETROOVA</h2>
            <p><strong>Une question, une suggestion ou un problème ? Notre équipe est à votre écoute.</strong></p>
        </section>
        <section>
            <h3>Problème avec une annonce ?</h3>
            <p>Utilisez le système de signalement associé à l'annonce concernée.</p>
            <p><a href="/report" class="btn btn-primary">Signaler une annonce</a></p>
        </section>
        <section>
            <h3>Question générale</h3>
            <p><a href="mailto:cyberagba6@gmail.com">cyberagba6@gmail.com</a></p>
        </section>
        <section>
            <h3>Sécurité et confidentialité</h3>
            <p>Pour une question concernant la sécurité ou vos données personnelles :</p>
            <p><a href="mailto:cyberagba6@gmail.com">cyberagba6@gmail.com</a></p>
        </section>
        <section>
            <h3>Partenariats</h3>
            <p>Vous représentez une entreprise, une université, un hôtel, un aéroport, un service de transport ou une organisation souhaitant collaborer avec RETROOVA ?</p>
            <p><strong>Oui</strong> ou <strong>non</strong> selon votre cas, contactez-nous par e-mail pour entamer la discussion.</p>
        </section>
    `],
    '/partnerships': ['Partenariats', 'Des collaborations concrètes pour renforcer la sécurité, la visibilité et la restitution des objets retrouvés.', (csrfToken = '') => buildPartnershipPageMarkup(csrfToken)],
    '/partenariats': ['Partenariats', 'Des collaborations concrètes pour renforcer la sécurité, la visibilité et la restitution des objets retrouvés.', (csrfToken = '') => buildPartnershipPageMarkup(csrfToken)],
    '/security': ['Sécurité', 'Votre sécurité est notre priorité.', `
        <section>
            <h2>Votre sécurité est notre priorité</h2>
            <p>RETROOVA est conçu pour faciliter les retrouvailles tout en limitant l'exposition des informations personnelles.</p>
        </section>
        <section>
            <h3>Protection des informations personnelles</h3>
            <p>Nous évitons d'afficher publiquement les informations permettant d'identifier ou de contacter directement un utilisateur.</p>
            <p>Les échanges peuvent être effectués à travers la plateforme.</p>
        </section>
        <section>
            <h3>Protection des documents</h3>
            <p>Les documents officiels peuvent contenir des informations particulièrement sensibles.</p>
            <p><strong>Ne publiez jamais une photographie permettant de lire intégralement un numéro de document, un numéro bancaire ou toute autre information confidentielle.</strong></p>
        </section>
        <section>
            <h3>Vérification de propriété</h3>
            <p>Lorsqu'une personne réclame un objet, elle peut être invitée à fournir des informations permettant de démontrer qu'elle en est bien propriétaire.</p>
        </section>
        <section>
            <h3>Signalement des comportements suspects</h3>
            <p>Vous pouvez signaler :</p>
            <ul>
                <li>une annonce suspecte ;</li>
                <li>une tentative d'escroquerie ;</li>
                <li>une usurpation d'identité ;</li>
                <li>un comportement abusif ;</li>
                <li>une publication contenant des informations sensibles.</li>
            </ul>
        </section>
        <section>
            <h3>Notre recommandation</h3>
            <blockquote>Ne payez jamais quelqu'un simplement parce qu'il affirme avoir retrouvé votre objet sans avoir préalablement vérifié son identité et la propriété de l'objet.</blockquote>
            <p>En cas de situation suspecte, interrompez la conversation et utilisez le système de signalement.</p>
        </section>
    `],
    '/help': ['Aide', 'Centre d’aide RETROOVA', `
        <section class="help-overview">
            <h2>Comment pouvons-nous vous aider ?</h2>
            <p>Créer ici une interface avec de grosses catégories plutôt qu'une longue page de texte.</p>
        </section>
        <div class="help-category-grid">
            <article class="help-category">
                <h3>🔎 Rechercher un objet</h3>
                <ul>
                    <li>Comment rechercher un objet ?</li>
                    <li>Comment utiliser les filtres ?</li>
                    <li>Comment fonctionne une correspondance ?</li>
                </ul>
            </article>
            <article class="help-category">
                <h3>📢 Déclarer un objet</h3>
                <ul>
                    <li>Comment déclarer un objet perdu ?</li>
                    <li>Comment déclarer un objet trouvé ?</li>
                    <li>Puis-je modifier mon annonce ?</li>
                    <li>Comment supprimer mon annonce ?</li>
                </ul>
            </article>
            <article class="help-category">
                <h3>🎯 Correspondances</h3>
                <ul>
                    <li>Qu'est-ce qu'une correspondance ?</li>
                    <li>Comment vérifier qu'un objet est bien le mien ?</li>
                    <li>Que faire lorsqu'une correspondance est trouvée ?</li>
                </ul>
            </article>
            <article class="help-category">
                <h3>💬 Messages</h3>
                <ul>
                    <li>Comment contacter un autre utilisateur ?</li>
                    <li>Comment bloquer un utilisateur ?</li>
                    <li>Comment signaler une conversation ?</li>
                </ul>
            </article>
            <article class="help-category">
                <h3>🔐 Compte et sécurité</h3>
                <ul>
                    <li>Comment modifier mon profil ?</li>
                    <li>J'ai oublié mon mot de passe.</li>
                    <li>Comment supprimer mon compte ?</li>
                    <li>Comment signaler une activité suspecte ?</li>
                </ul>
            </article>
            <article class="help-category">
                <h3>🪪 Documents</h3>
                <ul>
                    <li>Puis-je publier une CNI ?</li>
                    <li>Comment protéger mes informations personnelles ?</li>
                    <li>Quelles informations ne dois-je jamais publier ?</li>
                </ul>
            </article>
        </div>
    `],
    '/report': ['Signaler', 'Signalement d’un comportement ou d’une annonce suspecte.', `
        <section>
            <h2>Signaler un problème</h2>
            <p>Vous avez rencontré une annonce ou un comportement qui vous semble suspect ?</p>
            <p><strong>Votre signalement contribue à maintenir RETROOVA sûr pour tous.</strong></p>
        </section>
        <section>
            <h3>Que souhaitez-vous signaler ?</h3>
            <ul>
                <li>🚨 Une annonce frauduleuse</li>
                <li>👤 Un utilisateur suspect</li>
                <li>🔐 Une donnée personnelle publiée</li>
                <li>💬 Un message inapproprié</li>
                <li>💰 Une tentative d'escroquerie</li>
                <li>📷 Une photo problématique</li>
                <li>⚠️ Autre</li>
            </ul>
        </section>
        <section>
            <h3>Que se passe-t-il après votre signalement ?</h3>
            <ol>
                <li>Votre signalement est enregistré.</li>
                <li>Les informations nécessaires sont examinées.</li>
                <li>Des mesures peuvent être prises lorsque cela est justifié.</li>
                <li>L'annonce ou le compte peut être limité, masqué ou suspendu.</li>
            </ol>
            <p><strong>Les signalements sont traités avec sérieux.</strong></p>
        </section>
    `]
};

class InfoController {
    constructor(adminModel) { this.adminModel = adminModel; }
    show = (req, res) => {
        const [title, lead, content] = pages[req.path] || pages['/help'];
        const currentFaqItems = req.path === '/help' ? faqItems : [];
        const renderedContent = typeof content === 'function' ? content(req.session?.csrfToken || '') : content;
        res.render('pages/info', {
            title,
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
