const handler = ([list, count]) => {
    if (typeof count !== 'number') {
        return null;
    }
    if (Array.isArray(list)) {
        return list.slice(0, count);
    }
    if (typeof list === 'string') {
        return list.substring(0, count);
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map