import { type App, SuggestModal } from 'obsidian';
import type { Task } from '../Task/Task';
import { getTaskLineAndFile } from '../Obsidian/File';

export interface TaskSearchSuggestionText {
    description: string;
    source: string;
    heading: string;
}

export function filterIncompleteTasksByDescription(tasks: readonly Task[], query: string): Task[] {
    const normalizedQuery = query.toLowerCase();
    return tasks.filter((task) => !task.isDone && task.description.toLowerCase().includes(normalizedQuery));
}

export function taskSearchSuggestionText(task: Task): TaskSearchSuggestionText {
    return {
        description: task.description,
        source: task.path.split('/').pop() ?? task.path,
        heading: task.precedingHeader ?? 'No heading',
    };
}

export async function openTaskAtSourceLocation(task: Task, app: App): Promise<void> {
    const result = await getTaskLineAndFile(task, app.vault);
    if (result === undefined) {
        return;
    }

    const [line, file] = result;
    await app.workspace.getLeaf(false).openFile(file, { eState: { line } });
}

export class SearchTasksModal extends SuggestModal<Task> {
    constructor(app: App, private readonly getTasks: () => Task[]) {
        super(app);
        this.setPlaceholder('Search incomplete tasks');
    }

    public getSuggestions(query: string): Task[] {
        return filterIncompleteTasksByDescription(this.getTasks(), query);
    }

    public renderSuggestion(task: Task, el: HTMLElement): void {
        const suggestion = taskSearchSuggestionText(task);
        el.createDiv({ text: suggestion.description });
        el.createDiv({ text: `${suggestion.source} · ${suggestion.heading}`, cls: 'suggestion-note' });
    }

    public onChooseSuggestion(task: Task, _evt: MouseEvent | KeyboardEvent): void {
        void openTaskAtSourceLocation(task, this.app);
    }
}
