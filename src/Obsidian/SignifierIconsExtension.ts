import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate, WidgetType } from '@codemirror/view';
import { editorLivePreviewField } from 'obsidian';
import { getSettings } from '../Config/Settings';
import type { AllTaskDateFields } from '../DateTime/DateFieldTypes';
import { splitDateText } from '../DateTime/Postponer';
import { TasksFile } from '../Scripting/TasksFile';
import { Task } from '../Task/Task';
import { TaskLocation } from '../Task/TaskLocation';
import { setTasksIcon } from '../ui/Icons';
import { promptForDate } from '../ui/Menus/DatePicker';
import { linesInsideCodeBlocks } from './EditorDecorations';
import { type SignifierRange, dateFieldOf, findSignifierRanges, propertyRangesForLine } from './SignifierIcons';

const dateTriggerClass = 'tasks-editor-date-trigger';

/**
 * Attributes that make an element open the date picker for a date property, when clicked.
 */
function dateTriggerAttributes(field: AllTaskDateFields): Record<string, string> {
    return { class: dateTriggerClass, 'data-date-field': field, title: `Click to change ${splitDateText(field)}` };
}

/**
 * Open the date picker for the task on the element's line, and write the new date into the editor.
 */
function openDatePicker(view: EditorView, element: HTMLElement, field: AllTaskDateFields) {
    const line = view.state.doc.lineAt(view.posAtDOM(element));
    const task = Task.fromLine({
        line: line.text,
        taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('')),
        fallbackDate: null,
    });
    if (task === null) {
        return;
    }

    promptForDate(element, task, field, async (_originalTask, newTasks) => {
        // Do nothing if the line was edited while the picker was open.
        const currentLine = view.state.doc.line(line.number);
        if (currentLine.text !== line.text) {
            return;
        }
        const tasks = Array.isArray(newTasks) ? newTasks : [newTasks];
        const insert = tasks.map((newTask) => newTask.toFileLineString()).join(view.state.lineBreak);
        view.dispatch({ changes: { from: currentLine.from, to: currentLine.to, insert } });
    });
}

class TaskPropertyWidget extends WidgetType {
    constructor(
        private readonly property: SignifierRange,
        private readonly useIcons: boolean,
    ) {
        super();
    }

    eq(other: TaskPropertyWidget) {
        return (
            other.useIcons === this.useIcons &&
            other.property.iconId === this.property.iconId &&
            other.property.label === this.property.label &&
            other.property.emoji === this.property.emoji &&
            other.property.text === this.property.text
        );
    }

    toDOM() {
        const { iconId, label, emoji, text } = this.property;
        const container = createSpan({ cls: 'tasks-editor-property' });
        container.setAttribute('title', text ? `${label}: ${text}` : label);
        const field = dateFieldOf(this.property);
        if (field) {
            const { class: cls, ...attributes } = dateTriggerAttributes(field);
            container.classList.add(cls);
            for (const [name, value] of Object.entries(attributes)) {
                container.setAttribute(name, value);
            }
        }

        if (this.useIcons) {
            const iconSpan = container.createSpan({ cls: 'tasks-icon' });
            iconSpan.setAttribute('aria-label', label);
            iconSpan.setAttribute('role', 'img');
            setTasksIcon(iconSpan, iconId);
        } else {
            container.createSpan({ cls: 'tasks-editor-property-emoji', text: emoji });
        }

        if (text) {
            container.createSpan({ cls: 'tasks-editor-property-value', text });
        }
        return container;
    }

    ignoreEvent() {
        // Let the editor handle clicks: they place the cursor, or open the date picker.
        return false;
    }
}

function buildDecorations(view: EditorView): DecorationSet {
    const settings = getSettings();
    if (view.state.field(editorLivePreviewField, false) !== true) {
        return Decoration.none;
    }

    const useIcons = settings.signifierDisplay === 'icons';
    const { doc, selection } = view.state;
    const visibleRanges = view.visibleRanges;
    if (visibleRanges.length === 0) {
        return Decoration.none;
    }
    const lastVisibleLine = doc.lineAt(visibleRanges[visibleRanges.length - 1].to);
    const insideCodeBlock = linesInsideCodeBlocks(
        doc.sliceString(0, lastVisibleLine.to).split('\n'),
        lastVisibleLine.number - 1,
    );

    const decorations: ReturnType<Decoration['range']>[] = [];
    for (const { from, to } of visibleRanges) {
        let pos = from;
        while (pos <= to) {
            const line = doc.lineAt(pos);
            pos = line.to + 1;
            if (insideCodeBlock[line.number - 1]) {
                continue;
            }

            const properties = settings.showIconsInEditor
                ? propertyRangesForLine(line.text, settings.taskFormat, settings.signifierDisplay)
                : [];
            const replacedStarts = new Set<number>();
            for (const property of properties) {
                const propertyFrom = line.from + property.from;
                const propertyTo = line.from + property.to;

                const isBeingEdited = selection.ranges.some(
                    (range) => range.from <= propertyTo && range.to >= propertyFrom,
                );
                if (isBeingEdited) {
                    continue;
                }

                replacedStarts.add(property.from);
                decorations.push(
                    Decoration.replace({ widget: new TaskPropertyWidget(property, useIcons) }).range(
                        propertyFrom,
                        propertyTo,
                    ),
                );
            }

            // Emoji date signifiers shown as text can also be clicked, to open the date picker.
            if (settings.taskFormat === 'tasksPluginEmoji') {
                for (const property of findSignifierRanges(line.text)) {
                    const field = dateFieldOf(property);
                    if (field && !replacedStarts.has(property.from)) {
                        decorations.push(
                            Decoration.mark({ attributes: dateTriggerAttributes(field) }).range(
                                line.from + property.from,
                                line.from + property.to,
                            ),
                        );
                    }
                }
            }
        }
    }
    return Decoration.set(decorations, true);
}

/**
 * In Live Preview, show task properties compactly, in the chosen property style, and let date signifiers
 * be clicked to open the date picker. A property's text is shown whenever the cursor or selection touches it.
 */
export function newSignifierIconsExtension() {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;

            constructor(view: EditorView) {
                this.decorations = buildDecorations(view);
            }

            update(update: ViewUpdate) {
                const livePreviewChanged =
                    update.startState.field(editorLivePreviewField, false) !==
                    update.state.field(editorLivePreviewField, false);
                if (update.docChanged || update.viewportChanged || update.selectionSet || livePreviewChanged) {
                    this.decorations = buildDecorations(update.view);
                }
            }
        },
        {
            decorations: (plugin) => plugin.decorations,
            eventHandlers: {
                mousedown(event: MouseEvent, view: EditorView) {
                    const target = event.target instanceof HTMLElement ? event.target : null;
                    const trigger = target?.closest<HTMLElement>(`.${dateTriggerClass}`);
                    const field = trigger?.dataset.dateField as AllTaskDateFields | undefined;
                    if (!trigger || !field || event.button !== 0) {
                        return false;
                    }
                    event.preventDefault();
                    openDatePicker(view, trigger, field);
                    return true;
                },
            },
        },
    );
}
