/**
 * Similar to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
 * but requires the input to be an array of objects with `key` and `value` properties named as `key` and `value` respectively
 */
const handler = ([list]) => {
    if (Array.isArray(list)) {
        const object = {};
        for (const { key, value } of list) {
            object[key] = value;
        }
        return object;
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map