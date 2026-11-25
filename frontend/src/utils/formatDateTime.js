export default function formatDateTime(value) {
    if (!value) return '';

    const timestamp = String(value);
    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp);
    const date = new Date(hasTimezone ? timestamp : `${timestamp}Z`);

    if (Number.isNaN(date.getTime())) return timestamp;

    const formatted = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).format(date);

    return `${formatted} IST`;
}
