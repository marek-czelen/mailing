const CONTACT_TAG_RULES = [
    { tag: 'przedszkole', pattern: /przedszkol/ },
    { tag: 'szkoła podstawowa', pattern: /podstawow/ },
    { tag: 'gimnazjum', pattern: /gimnazj/ },
    { tag: 'liceum', pattern: /liceum|liceal/ },
    { tag: 'technikum', pattern: /technikum/ },
    { tag: 'szkoła zawodowa', pattern: /zawodow|branzow/ },
    { tag: 'uczelnia wyższa', pattern: /uczeln|uniwersytet|politechnik|szkola\s+wyzsza|akademia/ },
    { tag: 'szkoła prywatna', pattern: /prywatn|niepubliczn/ }
];

export function generateContactTags(...values) {
    const searchableText = values
        .filter(value => value !== null && value !== undefined)
        .map(value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
        .join(' ');

    return CONTACT_TAG_RULES
        .filter(({ pattern }) => pattern.test(searchableText))
        .map(({ tag }) => tag);
}