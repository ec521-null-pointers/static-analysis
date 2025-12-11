export const handler = ([items, func,]) => {
    if (typeof func !== 'function') {
        return null;
    }
    if (!items || typeof items !== 'object') {
        return null;
    }
    const list = Array.isArray(items) ? items : Object.entries(items);
    const res = {};
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const key = String(func({ item, i }));
        res[key] = item;
    }
    return res;
};
export default handler;
export const getArgumentInputData = ([items], argIndex, input) => {
    if (argIndex === 0) {
        return input;
    }
    if (Array.isArray(items)) {
        return { ...input, Args: { item: items[0], index: 0 } };
    }
    if (items && typeof items === 'object') {
        const [first] = Object.entries(items);
        if (first) {
            return { ...input, Args: { value: first[1], key: first[0] } };
        }
    }
    return input;
};
//# sourceMappingURL=handler.js.map