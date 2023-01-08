import type { StatusConfiguration } from '../Status';

export class StatusSettings {
    constructor() {
        this.customStatusTypes = [];
    }
    customStatusTypes: StatusConfiguration[];

    /**
     * Add a new custom status. Currently, duplicates are allowed.
     * @param newStatus
     */
    public addCustomStatus(newStatus: StatusConfiguration) {
        this.customStatusTypes.push(newStatus);
    }
}
