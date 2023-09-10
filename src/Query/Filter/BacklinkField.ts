import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
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

            // Only append the heading if it differs from the filename:
            if (task.precedingHeader && task.precedingHeader !== filename) {
                return [`[[${filename}#${task.precedingHeader}|${filename} > ${task.precedingHeader}]]`];
            }
            return ['[[' + filename + ']]'];
        };
    }
}
