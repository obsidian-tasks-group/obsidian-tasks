import type { StatusConfiguration } from '../Status';

export class StatusSettings {
    constructor() {
        this.customStatusTypes = [];
    }
    customStatusTypes: StatusConfiguration[];
}
