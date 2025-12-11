const handler = ([list]) => {
    if (Array.isArray(list)) {
        return shuffle(list);
    }
    if (typeof list === 'string') {
        return shuffle(list.split('')).join('');
    }
    return null;
};
function shuffle(input) {
    const array = [...input];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)) // random index from 0 to i
        ;
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
export default handler;
//# sourceMappingURL=handler.js.map