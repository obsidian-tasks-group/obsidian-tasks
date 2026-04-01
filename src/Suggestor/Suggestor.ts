import type { Editor, EditorPosition } from 'obsidian';

import { Task } from '../Task/Task';
import { GlobalFilter } from '../Config/GlobalFilter';
import { StatusType } from '../Statuses/StatusConfiguration';
export {
    DEFAULT_MAX_GENERIC_SUGGESTIONS,
    showDependencySuggestionsDefault,
    type SuggestorParameters,
    makeDefaultSuggestionBuilder,
    matchIfCursorInRegex,
    lastOpenBracket,
    onlySuggestIfBracketOpen,
} from './DefaultSuggestionBuilder';

/**
 * Return true if the Auto-Suggest menu may be shown on the current line,
 * and false value otherwise.
 *
 * This checks for simple pre-conditions:
 *  - Does the parent editor explicitly request it?
 *  - Is the global filter (if set) in the line?
 *  - Is the line a task line (with a checkbox)?
 * @param line
 * @param cursor - the cursor position, when ch is 0 it is presumed to mean 'at the start of the line'.
 *                          See https://docs.obsidian.md/Reference/TypeScript+API/EditorPosition
 * @param editor - the editor instance to which the suggest belongs
 */
export function canSuggestForLine(line: string, cursor: EditorPosition, editor: Editor) {
    const lineHasGlobalFilter = GlobalFilter.getInstance().includedIn(line);
    const didEditorRequest = editorIsRequestingSuggest(editor, cursor, lineHasGlobalFilter);

    if (typeof didEditorRequest === 'boolean') return didEditorRequest;
    return lineHasGlobalFilter && cursorIsInTaskLineDescription(line, cursor.ch);
}

/**
 * This function is to specifically allow other plugins to offer Tasks auto suggest.
 *
 * Plugins that have a showTasksPluginAutoSuggest() method on their Editor can
 * allow their users to use the Tasks auto-suggest menu if they wish.
 * See more details in https://publish.obsidian.md/tasks/Advanced/Tasks+Api#Auto-Suggest+Integration
 *
 * Return
 * - true if the parent editor is explicitly requesting that the suggest be displayed
 * - false if it is requesting that it be hidden
 * - undefined if the parent editor wants to defer to the default behavior
 *
 * @param editor - the editor instance from the other plugin which would want to use Tasks' auto suggest
 * @param cursor - the cursor position
 * @param lineHasGlobalFilter
 */
function editorIsRequestingSuggest(
    editor: Editor,
    cursor: EditorPosition,
    lineHasGlobalFilter: boolean,
): boolean | undefined {
    return (editor as any)?.editorComponent?.showTasksPluginAutoSuggest?.(cursor, editor, lineHasGlobalFilter);
}

/**
 * Return true if:
 * - line is a task line, that is, it is a list item with a checkbox.
 * - the checkbox status character is not a NON_TASK type.
 * - the cursor is in a task line's description.
 *
 * Here, description includes any task signifiers, as well as the vanilla description.
 * @param line
 * @param cursorPosition
 */
function cursorIsInTaskLineDescription(line: string, cursorPosition: number) {
    if (line.length === 0) {
        return false;
    }

    const components = Task.extractTaskComponents(line);
    if (!components) {
        // It is not a task line, that is, it is not a list item with a checkbox:
        return false;
    }

    if (components.status.type === StatusType.NON_TASK) {
        // The user's settings say this status is not a task:
        return false;
    }

    // Reconstruct the contents of the line, up to the space after the closing ']' in the checkbox:
    const beforeDescription = components.indentation + components.listMarker + ' [' + components.status.symbol + '] ';

    return cursorPosition >= beforeDescription.length;
}
