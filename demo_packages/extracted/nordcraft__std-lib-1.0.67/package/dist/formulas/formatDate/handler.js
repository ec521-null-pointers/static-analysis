/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 */
const handler = ([date, loc, opt]) => {
    if (!date || !(date instanceof Date)) {
        return null;
    }
    const locales = typeof loc === 'string' && loc.length > 0
        ? loc
        : Array.isArray(loc) && loc.every((l) => typeof l === 'string')
            ? loc
            : undefined;
    if (!opt || typeof opt !== 'object') {
        return Intl.DateTimeFormat(locales).format(date);
    }
    const validateString = (value, allowedValues) => typeof value === 'string' && (allowedValues?.includes(value) ?? true)
        ? value
        : undefined;
    const options = opt;
    const dateStyle = validateString(options.dateStyle, ['full', 'long', 'medium', 'short']);
    const timeStyle = validateString(options.timeStyle, ['full', 'long', 'medium', 'short']);
    const calendar = validateString(options.calendar);
    const weekday = validateString(options.weekday, ['long', 'short', 'narrow']);
    const era = validateString(options.era, [
        'long',
        'short',
        'narrow',
    ]);
    const year = validateString(options.year, ['numeric', '2-digit']);
    const month = validateString(options.month, ['long', 'short', 'narrow', 'numeric', '2-digit']);
    const day = validateString(options.day, [
        'numeric',
        '2-digit',
    ]);
    const hour = validateString(options.hour, ['numeric', '2-digit']);
    const minute = validateString(options.minute, ['numeric', '2-digit']);
    const second = validateString(options.second, ['numeric', '2-digit']);
    const timeZoneName = validateString(options.timeZoneName, [
        'long',
        'short',
        'shortOffset',
        'longOffset',
        'shortGeneric',
        'longGeneric',
    ]);
    const timeZone = validateString(options.timeZone);
    const hour12 = options.hour12 === true
        ? true
        : options.hour12 === false
            ? false
            : undefined;
    return Intl.DateTimeFormat(locales, {
        dateStyle,
        timeStyle,
        calendar,
        weekday,
        era,
        year,
        month,
        day,
        hour,
        minute,
        second,
        timeZoneName,
        timeZone,
        hour12,
    }).format(date);
};
export default handler;
//# sourceMappingURL=handler.js.map