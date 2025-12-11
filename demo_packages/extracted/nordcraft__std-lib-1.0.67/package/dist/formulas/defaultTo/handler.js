import { toBoolean } from '@nordcraft/core/dist/utils/util';
const handler = (values) => {
    for (const value of values) {
        if (toBoolean(value)) {
            return value;
        }
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map