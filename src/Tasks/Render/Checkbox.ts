import { Status } from '../Status';
import { NodeTypes } from './NodeTypes';

export const CLASS_CHECKBOX = 'tasks-checkbox';
export class Checkbox {
    public static prependTo({
        listItem,
        taskStatus,
    }: {
        listItem: Element;
        taskStatus: Status;
    }): void {
        for (let i = 0; i < listItem.childNodes.length; i = i + 1) {
            const childNode = listItem.childNodes[i];
            if (
                // Prepend to the first text child in the list item.
                childNode.nodeType == NodeTypes.TEXT &&
                childNode.textContent !== null
            ) {
                childNode.textContent = Checkbox.removeStatusIfPresent(
                    childNode.textContent,
                );

                const checkbox: HTMLInputElement = document.createElement(
                    'INPUT',
                ) as HTMLInputElement;
                checkbox.type = 'checkbox';
                checkbox.addClass(CLASS_CHECKBOX);
                if (taskStatus !== Status.TODO) {
                    checkbox.checked = true;
                }
                listItem.prepend(checkbox);
                break; // Break loop as we only need one checkbox.
            }
        }
    }

    private static removeStatusIfPresent(text: string): string {
        const existingStatusRegex = /^(TODO|DONE) (.*)/u;
        const existingStatusMatch = text.match(existingStatusRegex);
        if (existingStatusMatch !== null) {
            text = existingStatusMatch[2];
        }

        return text;
    }
}
