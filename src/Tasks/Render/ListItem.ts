import { Component, MarkdownRenderer } from 'obsidian';
import { CLASS_ITEM, DATA_PAGE_INDEX, DATA_PATH, Task } from '../Task';
import { Checkbox } from './Checkbox';

export class ListItem {
    public static async fromTask({
        task,
        parentComponent,
    }: {
        task: Task;
        parentComponent: Component;
    }): Promise<HTMLLIElement> {
        const listItem = document.createElement('li');

        await MarkdownRenderer.renderMarkdown(
            task.toLiString(),
            listItem,
            task.path,
            parentComponent,
        );

        // Unwrap the p-tag that was created by the MarkdownRenderer:
        const pElement = listItem.querySelector('p');
        if (pElement !== null) {
            listItem.innerHTML = pElement.innerHTML;
            pElement.remove();
        }

        ListItem.addAttributes({ listItem, task });
        Checkbox.prependTo({ listItem, taskStatus: task.status });

        return listItem;
    }

    public static addAttributes({
        listItem,
        task,
    }: {
        listItem: Element;
        task: Task;
    }): void {
        listItem.addClass(CLASS_ITEM);
        listItem.setAttribute(DATA_PATH, task.path);
        if (task.pageIndex !== undefined) {
            listItem.setAttribute(DATA_PAGE_INDEX, task.pageIndex.toString());
        }
    }
}
