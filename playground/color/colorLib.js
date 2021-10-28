const cylindrical = (prefix) => new RegExp(`^${prefix}a?\\(\\s*([+-]?(?:\\d{0,3}\\.)?\\d+)(?:deg)?\\s*,?\\s*([+-]?[\\d\\.]+)%\\s*,?\\s*([+-]?[\\d\\.]+)%\\s*(?:[,|\\\\/]\\s*([+-]?[\\d\\.]+)\\s*)?\\)$`);
const rgba = /^rgba?\(\s*([+-]?(?:\d{0,3}\.)?\d+)\s*,?\s*([+-]?[\d\.]+)\s*,?\s*([+-]?[\d\.]+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)\s*)?\)$/;
const rgbaP = /^rgba?\(\s*([+-]?(?:\d{0,3}\.)?\d+)%\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?[\d\.]+)\s*)?\)$/;
const hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i, abbr = /^#([a-f0-9]{3,4})$/i;
const DEFAULT_CONFIG = { useComma: true, useDegrees: true, useDivision: false, usePercentage: false };
const HEX_DECIMAL_ACCURACY = 1000;
function parseConfig(color) {
    return {
        useDegrees: color.includes('deg'),
        usePercentage: color.includes('%'),
        useDivision: color.includes('/'),
        useComma: color.includes(','),
        isHex: color.includes('#'),
    };
}
function parseCylindrical(colorSpace, color) {
    var match = color.match(cylindrical(colorSpace));
    if (match) {
        var alpha = parseFloat(match[4]);
        return [
            (parseFloat(match[1]) + 360) % 360,
            clamp(parseFloat(match[2]), 0, 100),
            clamp(parseFloat(match[3]), 0, 100),
            clamp(isNaN(alpha) ? 1 : alpha, 0, 1),
        ];
    }
    return [-1, -1, -1, -1];
}
function parseRGB(color) {
    return getRGBArray(color).map((v, i) => {
        const rounded = i === 3 ? Math.round((v + Number.EPSILON) * HEX_DECIMAL_ACCURACY) / HEX_DECIMAL_ACCURACY : Math.round(v);
        return isNaN(rounded) ? 1 : clamp(rounded, 0, i == 3 ? 1 : 255);
    });
}
function getRGBArray(rgb) {
    let value = [0, 1, 2, 3], match;
    if ((match = rgb.match(hex))) {
        value = value.map((i) => parseInt(match[1].slice(i + i, i + i + 2), 16));
        if (match[2])
            value[3] = parseInt(match[2], 16) / 255;
        return value;
    }
    if (match = rgb.match(abbr)) {
        return value.map((i) => parseInt(match[1][i] + match[1][i], 16) / (i == 3 ? 255 : 1));
    }
    if (match = rgb.match(rgba)) {
        return value.map((i) => parseFloat(match[i + 1]));
    }
    if (match = rgb.match(rgbaP)) {
        return value.map((i) => parseFloat(match[i + 1]) * (i == 3 ? 1 : 2.55));
    }
    return [-1, -1, -1, -1];
}
function clamp(num, min, max) {
    return Math.min(Math.max(min, num), max);
}
export function toString(color) {
    var _a, _b;
    if (!isValid(color))
        return undefined;
    const { config, colorSpace } = color;
    const { useComma, useDegrees, useDivision, usePercentage } = config !== null && config !== void 0 ? config : DEFAULT_CONFIG;
    const formatValues = (arr) => usePercentage
        ? arr.map(x => `${x}%`)
        : arr.map(x => `${x}`);
    const formatAlpha = (alpha) => alpha >= 0
        ? (useDivision ? ' / ' : ', ') + `${alpha}`.replace('0.', '.')
        : '';
    const formatString = (values) => {
        const alpha = formatAlpha(color.a);
        return `${colorSpace}${alpha ? 'a' : ''}(${values.join(useComma ? ', ' : ' ')}${alpha})`;
    };
    if (colorSpace === 'hsl' || colorSpace === 'hwb') {
        const col = color;
        return formatString([
            `${col.h}${useDegrees ? 'deg' : ''}`,
            ...formatValues([(_a = col.s) !== null && _a !== void 0 ? _a : col.w, (_b = col.l) !== null && _b !== void 0 ? _b : col.w])
        ]);
    }
    if (colorSpace === 'rgb') {
        const { r, g, b, a } = color;
        if (config === null || config === void 0 ? void 0 : config.isHex) {
            const rgba = [r, g, b, Math.floor(a * 255)];
            const hexArray = rgba.map((v) => v.toString(16).padStart(2, '0'));
            return ['#', ...hexArray].join('').toUpperCase();
        }
        return formatString(formatValues([r, g, b]));
    }
    return undefined;
}
export function isValid(colorString) {
    if (typeof colorString === 'string') {
        const prefix = colorString.substring(0, 3).toLowerCase();
        const isCylindrical = (prefix === 'hsl' || prefix === 'hwb') && colorString.match(cylindrical(prefix));
        return isCylindrical || colorString.match(rgba) || colorString.match(rgbaP) || colorString.match(abbr) || colorString.match(hex);
    }
    const color = colorString;
    return color.a !== -1 && color.colorSpace !== 'null';
}
export default function parse(colorString) {
    var _a;
    const prefix = `${((_a = colorString.match(/(?:hwb)|(?:rgb)|(?:hsl)|(?:#)/g)) !== null && _a !== void 0 ? _a : ['null'])[0]}`.replace('#', 'rgb');
    if (prefix === 'null')
        return undefined;
    const color = { config: parseConfig(colorString) };
    if (prefix === 'hsl') {
        const [h, s, l, a] = parseCylindrical(prefix, colorString);
        Object.assign(color, { colorSpace: prefix, h, s, l, a });
    }
    else if (prefix === 'hwb') {
        const [h, w, b, a] = parseCylindrical(prefix, colorString);
        Object.assign(color, { colorSpace: prefix, h, w, b, a });
    }
    else {
        const [r, g, b, a] = parseRGB(colorString);
        Object.assign(color, { colorSpace: 'rgb', r, g, b, a });
    }
    return color.a === -1 ? undefined : color;
}
