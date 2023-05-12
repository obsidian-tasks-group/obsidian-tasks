import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { TextField } from './TextField';
import { FilterOrErrorMessage } from './Filter';

export class BacklinkField extends TextField {
    public fieldName(): string {
        return 'backlink';
    }

    public value(task: Task): string {
        const linkText = task.getLinkText({ isFilenameUnique: true });
        if (linkText === null) {
            return 'Unknown Location';
        }
        return linkText;
    }

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'backlink field does not support filtering');
    }

    canCreateFilterForLine(_line: string): boolean {
        return false;
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            const filename = task.filename;
            if (filename !== null) {
                const backlink = this.value(task);
                if (filename !== backlink) {
                    // In case backlink is 'file_name > heading', the filename only shall be escaped
                    return [TextField.escapeMarkdownCharacters(filename) + backlink.substring(filename.length)];
                }
            }

            return [TextField.escapeMarkdownCharacters(this.value(task))];
        };
    }
}
