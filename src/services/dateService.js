const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(value, locale = 'fr') {
    if (!value) return '';

    let date;
    const stringValue = String(value);
    if (DATE_ONLY_PATTERN.test(stringValue)) {
        const [year, month, day] = stringValue.split('-').map(Number);
        date = new Date(year, month - 1, day);
    } else {
        date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

module.exports = { formatDate };
