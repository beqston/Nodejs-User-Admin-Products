export default function sanitizeObject(obj) {
    const clean = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
        clean[key] = xss(obj[key]);
        } else {
        clean[key] = obj[key]; // or recursively sanitize
        }
    }
return clean;
}