(() => {
    const i18n = window.retroovaI18n || {};
    const mapElement = document.getElementById('retroova-map');
    if (!mapElement || typeof L === 'undefined') return;

    const centers = {
        abidjan: [5.3484, -4.0305], cocody: [5.3599, -3.9678], plateau: [5.3267, -4.0244], yopougon: [5.3364, -4.0887]
    };
    const map = L.map(mapElement).setView(centers.abidjan, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    (window.retroovaItems || []).forEach((item) => {
        const key = `${item.district || ''} ${item.city || ''}`.toLowerCase();
        const center = Object.entries(centers).find(([name]) => key.includes(name))?.[1] || centers.abidjan;
        const popup = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = item.title || '';
        const details = document.createElement('div');
        details.textContent = `${item.type === 'lost' ? i18n.lost : i18n.found} · ${item.city || ''}`;
        const link = document.createElement('a');
        link.href = `/items/${encodeURIComponent(item.id)}`;
        link.textContent = i18n.viewAd;
        popup.append(title, document.createElement('br'), details, document.createElement('br'), link);
        L.marker(center).addTo(map).bindPopup(popup);
    });
})();
