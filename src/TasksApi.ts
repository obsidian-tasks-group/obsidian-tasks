import type { App } from 'obsidian';
import type { Task } from './Task';
import { TaskModal } from './TaskModal';
import { taskFromLine } from './Commands/CreateOrEditTaskParser';

export class TasksApi {
    public static GetApi(app: App) {
        return {
            showUi: (): Promise<string> => {
                return this.showUi(app);
            },
        };
    }

    public static showUi(app: App): Promise<string> {
        let resolvePromise: (input: string) => void;
        const waitForClose = new Promise<string>((resolve, _) => {
            resolvePromise = resolve;
        });

        const onSubmit = (updatedTasks: Task[]): void => {
            const line = updatedTasks.map((task: Task) => task.toFileLineString()).join('\n');
            resolvePromise(line);
        };

        const taskModal = new TaskModal({
            app,
            task: taskFromLine({ line: '', path: '' }),
            onSubmit,
        });
        taskModal.open();
        return waitForClose;
    }
}
