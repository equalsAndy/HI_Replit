const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 12;
export function generateInviteCode() {
    let code = '';
    const charsetLength = CHARSET.length;
    for (let i = 0; i < CODE_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * charsetLength);
        code += CHARSET[randomIndex];
    }
    return code.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3');
}
export function normalizeInviteCode(code) {
    return code.replace(/-/g, '').toUpperCase();
}
export function validateInviteCode(code) {
    const normalizedCode = normalizeInviteCode(code);
    if (normalizedCode.length !== CODE_LENGTH) {
        return false;
    }
    const validChars = new Set(CHARSET.split(''));
    for (const char of normalizedCode) {
        if (!validChars.has(char)) {
            return false;
        }
    }
    return true;
}
export function formatInviteCode(code) {
    const normalized = normalizeInviteCode(code);
    return normalized.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3');
}
