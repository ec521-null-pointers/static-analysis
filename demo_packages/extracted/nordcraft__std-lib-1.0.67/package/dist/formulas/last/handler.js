const handler = ([list]) => {
    if (typeof list === 'string' || Array.isArray(list)) {
        return list[list.length - 1];
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map