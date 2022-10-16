import type { Moment } from 'moment/moment';
import { getSettings } from './Config/Settings';

/**
 * Implement date from path detection
 */
export class DateFallback {
    /**
     * Attempt to parse the filename to extract a date taking user settings into account. If date inference is not
     * enabled parsing is bypassed and null is returned.
     * @param path the full path of the file
     * @return a Moment or null if no date was found.
     */
    public static fromPath(path: string): Moment | null {
        const { enableDateFallback, dateFallbackFolders } = getSettings();

        if (!enableDateFallback) {
            // feature is disabled
            return null;
        }

        if (!this.matchesAnyFolder(dateFallbackFolders, path)) {
            // file is not in any folder or subfolder that was selected for date inference
            return null;
        }

        return this.extractDateFromPath(path);
    }

    private static matchesAnyFolder(folders: string[], path: string) {
        if (folders.length === 0) {
            // no constraints on matching folders
            return true;
        }

        // folders never end with a '/', and paths contain at least on slash (separating the folder from the
        // filename)
        return folders.some((folder) => path.startsWith(folder + '/'));
    }

    private static extractDateFromPath(path: string): Moment | null {
        const firstPos = Math.max(0, path.lastIndexOf('/') + 1);
        const lastPos = path.lastIndexOf('.');

        const basename = path.substring(firstPos, lastPos);

        let dateMatch = /(\d{4})-(\d{2})-(\d{2})/.exec(basename);
        if (!dateMatch) dateMatch = /(\d{4})(\d{2})(\d{2})/.exec(basename);

        if (dateMatch) {
            const date = window.moment([parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3])]);
            if (date.isValid()) {
                return date;
            }
        }

        return null;
    }
}
