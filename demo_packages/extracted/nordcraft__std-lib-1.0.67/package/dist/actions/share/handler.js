import { isDefined } from '@nordcraft/core/dist/utils/util';
const handler = ([url, title, text]) => {
    const validInput = (value) => isDefined(value) && typeof value === 'string';
    if (!validInput(url) && !validInput(title) && !validInput(text)) {
        throw new Error(`Either url, text or title must be provided`);
    }
    const data = {};
    if (validInput(title)) {
        data.title = title;
    }
    if (validInput(text)) {
        data.text = text;
    }
    if (validInput(url)) {
        data.url = url;
    }
    // Later we can add support for data.files as well
    if (isDefined(navigator.share) && navigator.canShare(data)) {
        return navigator.share(data);
    }
};
export default handler;
//# sourceMappingURL=handler.js.map