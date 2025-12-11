import { isDefined } from '@nordcraft/core/dist/utils/util';
const handler = ([url, title, text]) => {
    if (!isDefined(navigator.canShare)) {
        return false;
    }
    const validInput = (value) => isDefined(value) && typeof value === 'string';
    if (!validInput(url) && !validInput(title) && !validInput(text)) {
        return false;
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
    // See https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
    return navigator.canShare(data);
};
export default handler;
//# sourceMappingURL=handler.js.map