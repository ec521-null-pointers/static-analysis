import { isObject } from '@nordcraft/core/dist/utils/util';
const handler = ([collection, key, value], ctx) => {
    if (typeof key !== 'string' &&
        typeof key !== 'number' &&
        !Array.isArray(key)) {
        return null;
    }
    const [head, ...rest] = Array.isArray(key) ? key : [key];
    if (isObject(collection)) {
        const clone = Array.isArray(collection)
            ? [...collection]
            : { ...collection };
        clone[head] =
            rest.length === 0 ? value : handler([clone[head], rest, value], ctx);
        return clone;
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map