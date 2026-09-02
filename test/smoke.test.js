const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

async function registerAndLogin(agent) {
    const password = 'motdepasse-test';
    const email = `smoke-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
    const registerPage = await agent.get('/register');
    const registerCsrf = /name="_csrf"\s+value="([^"]+)"/s.exec(registerPage.text)?.[1];
    await agent.post('/register').type('form').send({
        name: 'Smoke User', email, password, passwordConfirm: password, city: 'Abidjan', _csrf: registerCsrf
    });
    const loginPage = await agent.get('/login');
    const loginCsrf = /name="_csrf"\s+value="([^"]+)"/s.exec(loginPage.text)?.[1];
    return agent.post('/login').type('form').send({ email, password, _csrf: loginCsrf });
}

test('les pages d’information du footer sont traduites selon la locale', async () => {
    const agent = request.agent(app);

    const frPage = await agent.get('/fr/how-it-works');
    assert.equal(frPage.status, 200);
    assert.match(frPage.text, /Comment fonctionne RETROOVA/i);

    const enPage = await agent.get('/en/how-it-works');
    assert.equal(enPage.status, 200);
    assert.match(enPage.text, /How RETROOVA works/i);

    const frPrivacy = await agent.get('/fr/privacy');
    assert.equal(frPrivacy.status, 200);
    assert.match(frPrivacy.text, /Politique de confidentialité/i);

    const enPrivacy = await agent.get('/en/privacy');
    assert.equal(enPrivacy.status, 200);
    assert.match(enPrivacy.text, /Privacy policy/i);
});

test('pages publiques répondent et exposent les protections', async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get('/login');
    assert.equal(loginPage.status, 200);
    assert.match(loginPage.text, /style\.css/);
    assert.match(loginPage.text, /name="_csrf"/);

    const loginResponse = await registerAndLogin(agent);
    assert.equal(loginResponse.status, 302);
    assert.ok(['/dashboard', '/admin'].includes(loginResponse.headers.location));

    const search = await agent.get('/search');
    assert.equal(search.status, 200);
    const map = await agent.get('/map');
    assert.equal(map.status, 200);
    const howItWorks = await agent.get('/how-it-works');
    assert.equal(howItWorks.status, 200);
    const about = await agent.get('/about');
    assert.equal(about.status, 200);
    const partnership = await agent.get('/partnerships');
    assert.equal(partnership.status, 200);
    const partnershipAlias = await agent.get('/partenariats');
    assert.equal(partnershipAlias.status, 200);
    const privacy = await agent.get('/privacy');
    assert.equal(privacy.status, 200);
    const report = await agent.get('/report');
    assert.equal(report.status, 302);
    assert.equal(report.headers.location, '/help');
});

test('le formulaire de partenariat enregistre une demande et l’admin l’affiche', async () => {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        return;
    }

    const agent = request.agent(app);
    const partnershipPage = await agent.get('/partnerships');
    assert.equal(partnershipPage.status, 200);
    assert.match(partnershipPage.text, /RETROOVA PARTNERS/);
    assert.match(partnershipPage.text, /Devenir partenaire/);

    const csrf = /name="_csrf"\s+value="([^"]+)"/s.exec(partnershipPage.text)?.[1];
    assert.ok(csrf, 'Le formulaire doit intégrer un token CSRF');

    const submission = await agent.post('/partnerships').type('form').send({
        organization_name: 'ABC Hotels',
        contact_name: 'Jean Kouassi',
        email: 'jean@abchotels.com',
        partnership_type: 'Hôtel / Tourisme',
        country: 'Côte d’Ivoire',
        message: 'Nous souhaitons intégrer RETROOVA à notre process de gestion des objets trouvés.',
        _csrf: csrf
    });

    assert.equal(submission.status, 302);
    assert.equal(submission.headers.location, '/partnerships?success=1');

    const adminAgent = request.agent(app);
    const adminLoginPage = await adminAgent.get('/login');
    const adminCsrf = /name="_csrf"\s+value="([^"]+)"/s.exec(adminLoginPage.text)?.[1];
    const adminLogin = await adminAgent.post('/login').type('form').send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        _csrf: adminCsrf
    });
    assert.equal(adminLogin.status, 302);
    assert.equal(adminLogin.headers.location, '/admin');

    const adminResponse = await adminAgent.get('/admin');
    assert.equal(adminResponse.status, 200);
    assert.match(adminResponse.text, /Demandes de partenariat/);
    assert.match(adminResponse.text, /ABC Hotels/);
});

test('les pages protégées redirigent et le profil ne contient plus de liens cassés', async () => {
    const response = await request(app).get('/profile');
    assert.equal(response.status, 302);
    assert.equal(response.headers.location, '/login');

    const agent = request.agent(app);
    const loginResponse = await registerAndLogin(agent);
    assert.equal(loginResponse.status, 302);

    const profile = await agent.get('/profile');
    assert.equal(profile.status, 200);
    assert.doesNotMatch(profile.text, /\/profile\/change-password|\/profile\/delete-account/);
});

test('routes protégées redirigent vers la connexion', async () => {
    const response = await request(app).get('/messages');
    assert.equal(response.status, 302);
    assert.equal(response.headers.location, '/login');
});

test('un utilisateur authentifié peut déclarer un objet perdu ou trouvé avec CSRF multipart', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    for (const type of ['lost', 'found']) {
        const formPage = await agent.get(`/${type}/create`);
        assert.equal(formPage.status, 200);
        const csrf = /name="_csrf"\s+value="([^"]+)"/s.exec(formPage.text)?.[1];
        assert.ok(csrf, `Le formulaire ${type} doit intégrer un token CSRF`);

        const submission = await agent.post(`/${type}/create`)
            .field('_csrf', csrf)
            .field('category', 'phone')
            .field('title', `Objet ${type} smoke`)
            .field('city', 'Abidjan');

        assert.equal(submission.status, 302);
        assert.match(submission.headers.location, /^\/items\//);
    }
});

test('un utilisateur non authentifié ne peut pas déclarer un objet', async () => {
    for (const type of ['lost', 'found']) {
        const response = await request(app).get(`/${type}/create`);
        assert.equal(response.status, 302);
        assert.equal(response.headers.location, '/login');
    }
});

test('une photo valide est acceptée et une photo trop volumineuse est expliquée', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    const formPage = await agent.get('/lost/create');
    const csrf = /name="_csrf"\s+value="([^"]+)"/s.exec(formPage.text)?.[1];
    assert.ok(csrf);

    const validPhoto = await agent.post('/lost/create')
        .field('_csrf', csrf)
        .field('category', 'phone')
        .field('title', 'Objet avec photo valide')
        .field('city', 'Abidjan')
        .attach('photo', Buffer.from('valid photo'), { filename: 'photo.png', contentType: 'image/png' });
    assert.equal(validPhoto.status, 302);

    const oversizedPhoto = await agent.post('/found/create')
        .field('_csrf', csrf)
        .field('category', 'wallet')
        .field('title', 'Objet avec photo trop volumineuse')
        .field('city', 'Abidjan')
        .attach('photo', Buffer.alloc(5 * 1024 * 1024 + 1), { filename: 'photo.png', contentType: 'image/png' });
    assert.equal(oversizedPhoto.status, 413);
    assert.match(oversizedPhoto.text, /photo est trop volumineuse/i);
    assert.match(oversizedPhoto.text, /5 Mo/);
    assert.doesNotMatch(oversizedPhoto.text, /Erreur serveur/);

    const invalidPhoto = await agent.post('/lost/create')
        .field('_csrf', csrf)
        .field('category', 'phone')
        .field('title', 'Objet avec fichier invalide')
        .field('city', 'Abidjan')
        .attach('photo', Buffer.from('not an image'), { filename: 'photo.txt', contentType: 'text/plain' });
    assert.equal(invalidPhoto.status, 422);
    assert.match(invalidPhoto.text, /JPG, PNG, GIF ou WebP/i);
    assert.doesNotMatch(invalidPhoto.text, /Erreur serveur/);
});

test('POST sans CSRF est refusé', async () => {
    const response = await request(app).post('/login').type('form').send({ email: 'x@example.com', password: 'password' });
    assert.equal(response.status, 403);
});

test('le compte admin utilise /login et les routes admin restent protégées', { skip: !process.env.ADMIN_PASSWORD }, async () => {
    const invalidAgent = request.agent(app);
    const invalidPage = await invalidAgent.get('/login');
    const invalidCsrf = /name="_csrf"\s+value="([^"]+)"/s.exec(invalidPage.text)?.[1];
    const invalidLogin = await invalidAgent.post('/login').type('form').send({
        email: process.env.ADMIN_EMAIL,
        password: 'mot-de-passe-invalide',
        _csrf: invalidCsrf
    });
    assert.equal(invalidLogin.status, 200);
    assert.match(invalidLogin.text, /Identifiants invalides/);
    assert.doesNotMatch(invalidLogin.text, /agbaodessiraoul/);

    const adminAgent = request.agent(app);
    const adminPage = await adminAgent.get('/login');
    const adminCsrf = /name="_csrf"\s+value="([^"]+)"/s.exec(adminPage.text)?.[1];
    const adminLogin = await adminAgent.post('/login').type('form').send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        _csrf: adminCsrf
    });
    assert.equal(adminLogin.status, 302);
    assert.equal(adminLogin.headers.location, '/admin');
    assert.equal((await adminAgent.get('/admin')).status, 200);

    const userAgent = request.agent(app);
    const registerPage = await userAgent.get('/register');
    const registerCsrf = /name="_csrf"\s+value="([^"]+)"/s.exec(registerPage.text)?.[1];
    const email = `smoke-${Date.now()}@example.com`;
    const registration = await userAgent.post('/register').type('form').send({
        name: 'Smoke User',
        email,
        password: 'motdepasse-test',
        passwordConfirm: 'motdepasse-test',
        city: 'Abidjan',
        _csrf: registerCsrf
    });
    assert.equal(registration.status, 302);

    const userLoginPage = await userAgent.get('/login');
    const userCsrf = /name="_csrf"\s+value="([^"]+)"/s.exec(userLoginPage.text)?.[1];
    const userLogin = await userAgent.post('/login').type('form').send({ email, password: 'motdepasse-test', _csrf: userCsrf });
    assert.equal(userLogin.status, 302);
    assert.equal(userLogin.headers.location, '/dashboard');
    assert.equal((await userAgent.get('/admin')).status, 403);
});

test('SEO public et routes de référencement sont cohérentes', async () => {
    const homePage = await request(app).get('/');
    assert.equal(homePage.status, 200);
    assert.match(homePage.text, /<meta name="description"/);
    assert.match(homePage.text, /<link rel="canonical"/);
    assert.match(homePage.text, /retroova\.com|localhost/);

    const healthCheck = await request(app).get('/health');
    assert.equal(healthCheck.status, 200);
    assert.deepEqual(healthCheck.body, { status: 'ok' });

    const robots = await request(app).get('/robots.txt');
    assert.equal(robots.status, 200);
    assert.match(robots.text, /Sitemap:/);

    const sitemap = await request(app).get('/sitemap.xml');
    assert.equal(sitemap.status, 200);
    assert.match(sitemap.text, /<loc>.*retroova\.com/);
});
