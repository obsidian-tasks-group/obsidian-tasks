import type { StatusConfiguration } from '../Status';

export interface StatusSettings {
    customStatusTypes: StatusConfiguration[];
}

export const defaultStatusSettings: StatusSettings = {
    customStatusTypes: [],
};
