import { Group } from '../Group';
import type { Task } from '../../Task';
import { TextField } from './TextField';
import { HeadingField } from './HeadingField';

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
            // Markdown characters in the file name must be escaped.
            filenameComponent = Group.escapeMarkdownCharacters(task.filename);
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

    public supportsGrouping(): boolean {
        return true;
    }
}
