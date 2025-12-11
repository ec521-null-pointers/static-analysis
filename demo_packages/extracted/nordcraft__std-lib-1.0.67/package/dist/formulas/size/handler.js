import { isObject } from '@nordcraft/core/dist/utils/util';
const handler = ([collection]) => {
    if (Array.isArray(collection)) {
        return collection.length;
    }
    if (isObject(collection)) {
        return Object.keys(collection).length;
    }
    if (typeof collection === 'string') {
        return collection.length;
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map