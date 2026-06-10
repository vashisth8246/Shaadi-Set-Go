const CITY_ALIASES = {
    banglore: 'Bangalore',
    bengaluru: 'Bangalore',
    bombay: 'Mumbai'
};

const toTitleCase = (value = '') => {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const normalizeCityName = (city = '') => {
    const cleaned = city.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cleaned) return '';

    if (CITY_ALIASES[cleaned]) {
        return CITY_ALIASES[cleaned];
    }

    return toTitleCase(cleaned);
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();

module.exports = {
    normalizeCityName,
    normalizeEmail,
    toTitleCase
};
