/**
 * Resolves spatial date strings like 'now', 'today', 'yesterday', 'tomorrow' to Date objects.
 * Also parses ISO date strings.
 *
 * @param value The value to resolve
 * @returns Date object or null if invalid
 */
export function resolveDateValue(value: unknown): Date | null {
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const str = value.trim().toLowerCase();

    if (str === 'now') {
        return new Date();
    }

    if (str === 'today') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    if (str === 'yesterday') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    if (str === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }

    return null;
}
