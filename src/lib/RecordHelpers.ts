export function renameKeyInRecordPreservingOrder<T>(
    record: Record<string, T>,
    oldKey: string,
    newKey: string,
): Record<string, T> {
    if (oldKey === newKey || !Object.prototype.hasOwnProperty.call(record, oldKey)) {
        return { ...record };
    }

    const newRecord: Record<string, T> = {};

    for (const [key, value] of Object.entries(record)) {
        if (key === oldKey) {
            newRecord[newKey] = value;
        } else {
            newRecord[key] = value;
        }
    }

    return newRecord;
}
