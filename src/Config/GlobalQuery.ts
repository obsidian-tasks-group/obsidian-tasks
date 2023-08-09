import { getSettings } from './Settings';

export class GlobalQuery {
    /**
     * Retrieves the source of the global {@link Query}
     */
    static source(): { source: string } {
        return { source: getSettings().globalQuery };
    }
}
