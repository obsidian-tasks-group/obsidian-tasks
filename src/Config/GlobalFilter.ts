import { getSettings } from './Settings';

export class GlobalFilter {
    value: string;
    length: number;

    constructor(value: string) {
        this.value = value;
        this.length = value.length;
    }

    matches(searchIn: string): boolean {
        return searchIn.includes(this.value);
    }

    removeFrom(aString: string): string {
        return aString.replace(this.value, '').trim();
    }
}

export const getGlobalFilter = (): GlobalFilter => {
    const { globalFilter } = getSettings();
    return globalFilter;
};
