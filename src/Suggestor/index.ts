import type { Task } from 'Task/Task';
import type { Settings } from '../Config/Settings';

/*
 * A suggestion presented to the user and some metadata about it.
 */
export type SuggestInfo = {
    suggestionType?: 'match' | 'default' | 'empty';
    /** What to display to the user  */
    displayText: string;
    /** What to append to the note  */
    appendText: string;
    /** At what index in the line to do the insertion (if not specified, the cursor location is used) */
    insertAt?: number;
    /** How many characters to skip from the original line (e.g. if replacing existing text) */
    insertSkip?: number;
    /** Text to match with the user input if matching against the display text is not desirable */
    textToMatch?: string;
    /** Task which needs too be Updated on Select */
    taskItDependsOn?: Task;
};

/*
 * Return a list of suggestions, either generic or more fine-grained to the words at the cursor.
 */
export type SuggestionBuilder = (
    line: string,
    cursorPos: number,
    settings: Settings,
    allTasks: Task[],
    taskToSuggestFor?: Task,
) => SuggestInfo[];
