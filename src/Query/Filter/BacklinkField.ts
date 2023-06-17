import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { TextField } from './TextField';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

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
            if (filename === null) {
                return ['Unknown Location'];
            }

            // Always escape the filename, to prevent any underscores being interpreted as markdown:
            let result = TextField.escapeMarkdownCharacters(filename);

            // Only append the heading if it differs from the un-escaped fileanme:
            if (task.precedingHeader && task.precedingHeader !== filename) {
                // We don't escape the heading, as any markdown characters in it really are markdown styling:
                result += ' > ' + task.precedingHeader;
            }
            return [result];
        };
    }
}
