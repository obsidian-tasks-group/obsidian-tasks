import type { Task } from '../../Task/Task';
import type { GrouperFunction } from '../Group/Grouper';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';
import { TextField } from './TextField';

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

            const header = task.precedingHeader;
            if (header === null) {
                return ['[[' + filename + ']]'];
            }

            // Always append the header, to ensure we navigate to the correct section of the file:
            return [`[[${filename}#${header}|${filename} > ${header}]]`];
        };
    }
}
