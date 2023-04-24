import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { TextField } from './TextField';
import { HeadingField } from './HeadingField';
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

        let filenameComponent = 'Unknown Location';

        if (task.filename !== null) {
            filenameComponent = task.filename;
        }

        if (task.precedingHeader === null || task.precedingHeader.length === 0) {
            return filenameComponent;
        }

        // Markdown characters in the heading must NOT be escaped.
        const headingGrouper = new HeadingField().createGrouper().grouper;
        const headingComponent = headingGrouper(task)[0];

        if (filenameComponent === headingComponent) {
            return filenameComponent;
        } else {
            return `${filenameComponent} > ${headingComponent}`;
        }
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
