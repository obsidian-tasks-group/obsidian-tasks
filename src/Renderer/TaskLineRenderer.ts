import type { Moment } from 'moment';
import { type App, Component, MarkdownRenderer } from 'obsidian';
import { GlobalFilter } from '../Config/GlobalFilter';
import { TASK_FORMATS, getSettings } from '../Config/Settings';
import type { QueryLayoutOptions } from '../Layout/QueryLayoutOptions';
import { TaskLayoutComponent, type TaskLayoutOptions } from '../Layout/TaskLayoutOptions';
import { replaceTaskWithTasks } from '../Obsidian/File';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import { Task } from '../Task/Task';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';
import { StatusMenu } from '../ui/Menus/StatusMenu';
import { momentAdjusted } from '../DateTime/DateAdjusted';
import type { AllTaskDateFields } from '../DateTime/DateFieldTypes';
import { defaultTaskSaver, showMenu } from '../ui/Menus/TaskEditingMenu';
import { promptForDate } from '../ui/Menus/DatePicker';
import { splitDateText } from '../DateTime/Postponer';
import { DateMenu } from '../ui/Menus/DateMenu';
import type { ListItem } from '../Task/ListItem';
import { TaskFieldRenderer } from './TaskFieldRenderer';

/**
 * The function used to render a Markdown task line into an existing HTML element.
 */
export type TextRenderer = (
    app: App,
    text: string,
    element: HTMLSpanElement,
    path: string,
    obsidianComponent: Component | null, // null is allowed here only for tests
) => Promise<void>;

/**
 * Create an HTML element, and append it to a parent element.
 *
 * Unlike the equivalent Obsidian convenience function li.createEl(),
 * this can be called from our automated tests.
 *
 * @param tagName - the type of element to be created, for example 'ul', 'div', 'span', 'li'.
 * @param parentElement - the parent element, to which the created element will be appended.
 *
 * @example <caption>Example call:</caption>
 * const li = createAndAppendElement('li', parentElement);
 */
export function createAndAppendElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    parentElement: HTMLElement,
): HTMLElementTagNameMap[K] {
    // Maintenance note:
    //  We don't use the Obsidian convenience function li.createEl() here, because we don't have it available
    //  when running tests, and we want the tests to be able to create the full div and span structure,
    //  so had to convert all of these to the equivalent but more elaborate document.createElement() and
    //  appendChild() calls.

    const el: HTMLElementTagNameMap[K] = document.createElement(tagName);
    parentElement.appendChild(el);
    return el;
}

/**
 * `TaskLineRenderer` is responsible for rendering task details as HTML list items with
 * various customization options.
 *
 * It integrates with Obsidian's rendering system and includes functionalities such as priority,
 * due dates, and user interactions.
 *
 * Individual fields in {@link Task} are rendered by {@link TaskFieldRenderer}.
 */
export class TaskLineRenderer {
    private readonly textRenderer: TextRenderer;
    private readonly obsidianApp: App;
    private readonly obsidianComponent: Component | null;
    private readonly parentUlElement: HTMLElement;
    private readonly taskLayoutOptions: TaskLayoutOptions;
    private readonly queryLayoutOptions: QueryLayoutOptions;

    public static async obsidianMarkdownRenderer(
        app: App,
        text: string,
        element: HTMLSpanElement,
        path: string,
        obsidianComponent: Component | null,
    ) {
        if (!obsidianComponent) {
            return;
        }

        await MarkdownRenderer.render(app, text, element, path, obsidianComponent);
    }

    /**
     * Builds a renderer for tasks with various options.
     *
     * @param textRenderer The optional renderer to be used. Skip this parameter for Obsidian rendering.
     * For test purposes mock renderers shall be used.
     *
     * @param obsidianComponent One of the parameters needed by `MarkdownRenderer.renderMarkdown()` Obsidian API,
     * that is called by the Obsidian renderer. Set this to null in test code.
     *
     * @param parentUlElement HTML element where the task shall be rendered.
     *
     * @param taskLayoutOptions See {@link TaskLayoutOptions}.
     *
     * @param queryLayoutOptions See {@link QueryLayoutOptions}.
     */
    constructor({
        textRenderer = TaskLineRenderer.obsidianMarkdownRenderer,
        obsidianApp,
        obsidianComponent,
        parentUlElement,
        taskLayoutOptions,
        queryLayoutOptions,
    }: {
        textRenderer?: TextRenderer;
        obsidianApp: App;
        obsidianComponent: Component | null;
        parentUlElement: HTMLElement;
        taskLayoutOptions: TaskLayoutOptions;
        queryLayoutOptions: QueryLayoutOptions;
    }) {
        this.textRenderer = textRenderer;
        this.obsidianApp = obsidianApp;
        this.obsidianComponent = obsidianComponent;
        this.parentUlElement = parentUlElement;
        this.taskLayoutOptions = taskLayoutOptions;
        this.queryLayoutOptions = queryLayoutOptions;
    }

    /**
     * Renders a given Task object into an HTML List Item (LI) element.
     *
     * The element includes the task and its various components (description, priority, block link etc.), the
     * checkbox on the left with its event handling of completing the task, and the button for editing the task.
     *
     * @returns an HTML rendered List Item element (LI) for a task.
     * @note Output is based on the {@link DefaultTaskSerializer}'s format, with default (emoji) symbols
     * @param task The task to be rendered.
     * @param taskIndex Task's index in the list. This affects `data-line` data attributes of the list item.
     * @param isTaskInQueryFile
     * @param isFilenameUnique Whether the name of the file that contains the task is unique in the vault.
     *                         If it is undefined, the outcome will be the same as with a unique file name:
     *                         the file name only. If set to `true`, the full path will be returned.
     */
    public async renderTaskLine({
        task,
        taskIndex,
        isTaskInQueryFile,
        isFilenameUnique,
    }: {
        task: Task;
        taskIndex: number;
        isTaskInQueryFile: boolean;
        isFilenameUnique?: boolean;
    }): Promise<HTMLLIElement> {
        const li = createAndAppendElement('li', this.parentUlElement);
        li.classList.add('task-list-item', 'plugin-tasks-list-item');

        const textSpan = createAndAppendElement('span', li);
        textSpan.classList.add('tasks-list-text');
        await this.taskToHtml(task, textSpan, li, isTaskInQueryFile);

        // NOTE: this area is mentioned in `CONTRIBUTING.md` under "How does Tasks handle status changes". When
        // moving the code, remember to update that reference too.
        const checkbox = createAndAppendElement('input', li);
        checkbox.classList.add('task-list-item-checkbox');
        checkbox.type = 'checkbox';
        if (task.status.symbol !== ' ') {
            checkbox.checked = true;
            li.classList.add('is-checked');
        }

        // If we don't have a path, the task is likely to be in a card on a canvas file,
        // and we cannot save any edits, so there is no point listening for any events on the task.
        // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2130
        const addEventListeners = task.taskLocation.hasKnownPath;
        if (addEventListeners) {
            checkbox.addEventListener('click', (event: MouseEvent) => {
                event.preventDefault();
                // It is required to stop propagation so that obsidian won't write the file with the
                // checkbox (un)checked. Obsidian would write after us and overwrite our change.
                event.stopPropagation();

                // Should be re-rendered as enabled after update in file.
                checkbox.disabled = true;
                const toggledTasks = task.toggleWithRecurrenceInUsersOrder();
                replaceTaskWithTasks({
                    originalTask: task,
                    newTasks: toggledTasks,
                });
            });

            checkbox.addEventListener('contextmenu', (ev: MouseEvent) => {
                showMenu(ev, new StatusMenu(StatusRegistry.getInstance(), task));
            });
            checkbox.setAttribute('title', 'Right-click for options');
        }

        li.prepend(checkbox);

        // Set these to be compatible with stock obsidian lists:
        li.setAttribute('data-task', task.status.symbol.trim()); // Trim to ensure empty attribute for space. Same way as obsidian.
        li.setAttribute('data-line', taskIndex.toString());
        li.setAttribute('data-task-status-name', task.status.name);
        li.setAttribute('data-task-status-type', task.status.type);
        checkbox.setAttribute('data-line', taskIndex.toString());

        if (this.queryLayoutOptions.shortMode) {
            this.addTooltip(task, textSpan, isFilenameUnique);
        }

        return li;
    }

    private async taskToHtml(
        task: Task,
        parentElement: HTMLElement,
        li: HTMLLIElement,
        isTaskInQueryFile: boolean,
    ): Promise<void> {
        const fieldRenderer = new TaskFieldRenderer();
        const emojiSerializer = TASK_FORMATS.tasksPluginEmoji.taskSerializer;
        // Render and build classes for all the task's visible components
        for (const component of this.taskLayoutOptions.shownComponents) {
            const componentString = emojiSerializer.componentToString(
                task,
                this.queryLayoutOptions.shortMode,
                component,
            );
            if (componentString) {
                // Create the text span that will hold the rendered component
                const span = createAndAppendElement('span', parentElement);

                // Inside that text span, we are creating another internal span, that will hold the text itself.
                // This may seem redundant, and by default it indeed does nothing, but we do it to allow the CSS
                // to differentiate between the container of the text and the text itself, so it will be possible
                // to do things like surrounding only the text (rather than its whole placeholder) with a highlight
                const internalSpan = createAndAppendElement('span', span);
                await this.renderComponentText(internalSpan, componentString, component, task, isTaskInQueryFile);
                this.addInternalClasses(component, internalSpan);

                // Add the component's CSS class describing what this component is (priority, due date etc.)
                fieldRenderer.addClassName(span, component);

                // Add the component's attribute ('priority-medium', 'due-past-1d' etc.)
                fieldRenderer.addDataAttribute(span, task, component);
                fieldRenderer.addDataAttribute(li, task, component);

                if (Task.allDateFields().includes(component)) {
                    const componentDateField = component as AllTaskDateFields;

                    // Note: The more convenient span.onClickEvent() doesn't work here, as it is not available when tests are run.
                    span.addEventListener('click', (ev: MouseEvent) => {
                        ev.preventDefault(); // suppress the default click behavior
                        ev.stopPropagation(); // suppress further event propagation
                        promptForDate(span, task, componentDateField, defaultTaskSaver);
                    });

                    span.addEventListener('contextmenu', (ev: MouseEvent) => {
                        showMenu(ev, new DateMenu(componentDateField, task, defaultTaskSaver));
                    });
                    span.setAttribute(
                        'title',
                        `Click to edit ${splitDateText(componentDateField)}, Right-click for more options`,
                    );
                }
            }
        }

        // Now build classes for the hidden task components without rendering them
        for (const component of this.taskLayoutOptions.hiddenComponents) {
            fieldRenderer.addDataAttribute(li, task, component);
        }

        // If a task has no priority field set, its priority will not be rendered as part of the loop above, and
        // it will not be set a priority data attribute.
        // In such a case we want the upper task LI element to mark the task has a 'normal' priority.
        // So if the priority was not rendered, force it through the pipe of getting the component data for the
        // priority field.
        if (li.dataset.taskPriority === undefined) {
            fieldRenderer.addDataAttribute(li, task, TaskLayoutComponent.Priority);
        }
    }

    /*
     * Renders the given component into the given HTML span element.
     */
    private async renderComponentText(
        span: HTMLSpanElement,
        componentString: string,
        component: TaskLayoutComponent,
        task: Task,
        isTaskInQueryFile: boolean,
    ) {
        if (component === TaskLayoutComponent.Description) {
            return await this.renderDescription(task, span, isTaskInQueryFile);
        }
        span.innerHTML = componentString;
    }

    private async renderDescription(task: Task, span: HTMLSpanElement, isTaskInQueryFile: boolean) {
        let description = this.adjustRelativeLinksInDescription(task, isTaskInQueryFile);
        description = GlobalFilter.getInstance().removeAsWordFromDependingOnSettings(description);

        const { debugSettings } = getSettings();
        if (debugSettings.showTaskHiddenData) {
            // Add some debug output to enable hidden information in the task to be inspected.
            description += `<br>🐛 <b>${task.lineNumber}</b> . ${task.sectionStart} . ${task.sectionIndex} . '<code>${task.originalMarkdown}</code>'<br>'<code>${task.path}</code>' > '<code>${task.precedingHeader}</code>'<br>`;
        }
        await this.textRenderer(this.obsidianApp, description, span, task.path, this.obsidianComponent);

        // If the task is a block quote, the block quote wraps the p-tag that contains the content.
        // In that case, we need to unwrap the p-tag *inside* the surrounding block quote.
        // Otherwise, we unwrap the p-tag as a direct descendant of the span.
        const blockQuote = span.querySelector('blockquote');
        const directParentOfPTag = blockQuote ?? span;

        // Unwrap the p-tag that was created by the MarkdownRenderer:
        const pElement = directParentOfPTag.querySelector('p');
        if (pElement !== null) {
            while (pElement.firstChild) {
                directParentOfPTag.insertBefore(pElement.firstChild, pElement);
            }
            pElement.remove();
        }

        // Remove an empty trailing p-tag that the MarkdownRenderer appends when there is a block link:
        span.querySelectorAll('p').forEach((pElement) => {
            if (!pElement.hasChildNodes()) {
                pElement.remove();
            }
        });

        // Remove the footnote that the MarkdownRenderer appends when there is a footnote in the task:
        span.querySelectorAll('.footnotes').forEach((footnoteElement) => {
            footnoteElement.remove();
        });
    }

    private adjustRelativeLinksInDescription(task: Task, isTaskInQueryFile: boolean) {
        // Skip if task is from the same file as the query
        if (isTaskInQueryFile) {
            return task.description;
        }

        // Skip if the task is in a file with no links
        const linkCache = task.file.cachedMetadata.links;
        if (!linkCache) {
            return task.description;
        }

        // Find links in the task description
        const taskLinks = linkCache.filter((link) => {
            return (
                link.position.start.line === task.taskLocation.lineNumber &&
                task.description.includes(link.original) &&
                link.link.startsWith('#')
            );
        });

        let description = task.description;
        if (taskLinks.length !== 0) {
            // a task can only be from one file, so we can replace all the internal links
            //in the description with the new file path
            for (const link of taskLinks) {
                const fullLink = `[[${task.path}${link.link}|${link.displayText}]]`;
                // Replace the first instance of this link:
                description = description.replace(link.original, fullLink);
            }
        }
        return description;
    }

    /*
     * Adds internal classes for various components (right now just tags actually), meaning that we modify the existing
     * rendered element to add classes inside it.
     * In the case of tags, Obsidian renders a Markdown description with <a class="tag"> elements for tags. We want to
     * enable users to style these, so we modify the rendered Markdown by adding the specific tag classes for these <a>
     * elements.
     */
    private addInternalClasses(component: TaskLayoutComponent, internalSpan: HTMLSpanElement) {
        /*
         * Sanitize tag names, so they will be valid attribute values according to the HTML spec:
         * https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(double-quoted)-state
         */
        function tagToAttributeValue(tag: string) {
            // eslint-disable-next-line no-control-regex
            const illegalChars = /["&\x00\r\n]/g;
            let sanitizedTag = tag.replace(illegalChars, '-');
            // And if after sanitization the name starts with dashes or underscores, remove them.
            sanitizedTag = sanitizedTag.replace(/^[-_]+/, '');
            if (sanitizedTag.length > 0) return sanitizedTag;
            else return null;
        }

        if (component === TaskLayoutComponent.Description) {
            const tags = internalSpan.getElementsByClassName('tag');
            for (let i = 0; i < tags.length; i++) {
                const tagName = tags[i].textContent;
                if (tagName) {
                    const className = tagToAttributeValue(tagName);
                    const element = tags[i] as HTMLElement;
                    if (className) element.dataset.tagName = className;
                }
            }
        }
    }

    private addTooltip(task: Task, element: HTMLSpanElement, isFilenameUnique: boolean | undefined) {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        const {
            recurrenceSymbol,
            startDateSymbol,
            createdDateSymbol,
            scheduledDateSymbol,
            dueDateSymbol,
            cancelledDateSymbol,
            doneDateSymbol,
        } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

        element.addEventListener('mouseenter', () => {
            function addDateToTooltip(tooltip: HTMLDivElement, date: Moment | null, signifier: string) {
                if (date) {
                    const createdDateDiv = tooltip.createDiv();
                    createdDateDiv.setText(
                        toTooltipDate({
                            signifier: signifier,
                            date: date,
                        }),
                    );
                }
            }

            function toTooltipDate({ signifier, date }: { signifier: string; date: Moment }): string {
                return `${signifier} ${date.format(TaskRegularExpressions.dateFormat)} (${date.from(
                    momentAdjusted().startOf('day'),
                )})`;
            }

            const tooltip = element.createDiv();
            tooltip.addClasses(['tooltip', 'pop-up']);

            // NEW_TASK_FIELD_EDIT_REQUIRED
            if (task.recurrence) {
                const recurrenceDiv = tooltip.createDiv();
                recurrenceDiv.setText(`${recurrenceSymbol} ${task.recurrence.toText()}`);
            }

            addDateToTooltip(tooltip, task.createdDate, createdDateSymbol);
            addDateToTooltip(tooltip, task.startDate, startDateSymbol);
            addDateToTooltip(tooltip, task.scheduledDate, scheduledDateSymbol);
            addDateToTooltip(tooltip, task.dueDate, dueDateSymbol);
            addDateToTooltip(tooltip, task.cancelledDate, cancelledDateSymbol);
            addDateToTooltip(tooltip, task.doneDate, doneDateSymbol);

            const linkText = task.getLinkText({ isFilenameUnique });
            if (linkText) {
                const backlinkDiv = tooltip.createDiv();
                backlinkDiv.setText(`🔗 ${linkText}`);
            }

            element.addEventListener('mouseleave', () => {
                tooltip.remove();
            });
        });
    }

    public async renderListItem(taskList: HTMLUListElement, listItem: ListItem, listItemIndex: number) {
        const li = createAndAppendElement('li', taskList);

        if (listItem.statusCharacter) {
            const checkbox = createAndAppendElement('input', li);
            checkbox.classList.add('task-list-item-checkbox');
            checkbox.type = 'checkbox';

            checkbox.addEventListener('click', (event: MouseEvent) => {
                event.preventDefault();
                // It is required to stop propagation so that obsidian won't write the file with the
                // checkbox (un)checked. Obsidian would write after us and overwrite our change.
                event.stopPropagation();

                // Should be re-rendered as enabled after update in file.
                checkbox.disabled = true;

                const checkedOrUncheckedListItem = listItem.checkOrUncheck();
                replaceTaskWithTasks({ originalTask: listItem, newTasks: checkedOrUncheckedListItem });
            });

            if (listItem.statusCharacter !== ' ') {
                checkbox.checked = true;
                li.classList.add('is-checked');
            }

            li.classList.add('task-list-item');

            // Set these to be compatible with stock obsidian lists:
            li.setAttribute('data-task', listItem.statusCharacter.trim());
            // Trim to ensure empty attribute for space. Same way as obsidian.
            li.setAttribute('data-line', listItemIndex.toString());
        }

        const span = createAndAppendElement('span', li);
        await this.textRenderer(
            this.obsidianApp,
            listItem.description,
            span,
            listItem.findClosestParentTask()?.path ?? '',
            this.obsidianComponent,
        );

        // Unwrap the p-tag that was created by the MarkdownRenderer:
        const pElement = span.querySelector('p');
        if (pElement !== null) {
            while (pElement.firstChild) {
                span.insertBefore(pElement.firstChild, pElement);
            }
            pElement.remove();
        }

        return li;
    }
}
