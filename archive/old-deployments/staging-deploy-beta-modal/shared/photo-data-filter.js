export function containsBase64ImageData(str) {
    if (typeof str !== 'string')
        return false;
    const dataUrlPattern = /^data:image\/[a-zA-Z]*;base64,/;
    if (dataUrlPattern.test(str))
        return true;
    const base64Pattern = /^[A-Za-z0-9+/]{100,}={0,2}$/;
    if (base64Pattern.test(str))
        return true;
    return false;
}
export function filterPhotoDataFromObject(obj) {
    if (!obj || typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => filterPhotoDataFromObject(item));
    }
    const filtered = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            if (containsBase64ImageData(value)) {
                filtered[key] = `[IMAGE_DATA_FILTERED - ${value.length} chars]`;
            }
            else if (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo')) {
                if (value.length > 500) {
                    filtered[key] = `[IMAGE_DATA_FILTERED - ${value.length} chars]`;
                }
                else {
                    filtered[key] = value;
                }
            }
            else {
                filtered[key] = value;
            }
        }
        else if (typeof value === 'object' && value !== null) {
            filtered[key] = filterPhotoDataFromObject(value);
        }
        else {
            filtered[key] = value;
        }
    }
    return filtered;
}
export function safeConsoleLog(message, ...args) {
    const filteredArgs = args.map(arg => {
        if (typeof arg === 'string' && containsBase64ImageData(arg)) {
            return '[IMAGE_DATA_FILTERED]';
        }
        if (typeof arg === 'object') {
            return filterPhotoDataFromObject(arg);
        }
        return arg;
    });
    console.log(message, ...filteredArgs);
}
export function safeConsoleError(message, ...args) {
    const filteredArgs = args.map(arg => {
        if (typeof arg === 'string' && containsBase64ImageData(arg)) {
            return '[IMAGE_DATA_FILTERED]';
        }
        if (typeof arg === 'object') {
            return filterPhotoDataFromObject(arg);
        }
        return arg;
    });
    console.error(message, ...filteredArgs);
}
export function filterNetworkData(data) {
    return filterPhotoDataFromObject(data);
}
