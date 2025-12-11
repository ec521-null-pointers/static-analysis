const handler = ([value, min, max]) => {
    if (typeof value !== 'number') {
        return null;
    }
    if (typeof min !== 'number') {
        return null;
    }
    if (typeof max !== 'number') {
        return null;
    }
    return Math.min(Math.max(value, min), max);
};
export default handler;
//# sourceMappingURL=handler.js.map