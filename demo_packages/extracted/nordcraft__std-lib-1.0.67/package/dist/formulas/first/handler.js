const handler = ([list]) => {
    if (typeof list === 'string' || Array.isArray(list)) {
        return list[0];
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map