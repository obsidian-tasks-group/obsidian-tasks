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

    /**
     * Delete the given custom status.
     * Returns true if deleted, and false if not.
     * @param status
     */
    public deleteCustomStatus(status: StatusConfiguration) {
        const index = this.customStatusTypes.indexOf(status);
        if (index <= -1) {
            return false;
        }
        this.customStatusTypes.splice(index, 1);
        return true;
    }
}
