import type { App } from 'obsidian';
import type { Task } from '../../src/Task';
import { createOrEditTaskLineModal } from '../../src/Api/createOrEditTaskLineModal';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';

const app = {} as App;

/**
 * {@link TaskModal} needs to be mocked, because it depends on {@link obsidian.Modal}, which is not available.
 */
class MockTaskModal {
    public static instance: MockTaskModal;
    public readonly app: App;
    public readonly task: Task;
    public readonly onSubmit: (updateTasks: Task[]) => void;

    public readonly open: () => void;

    constructor({ app, task, onSubmit }: { app: App; task: Task; onSubmit: (updatedTasks: Task[]) => void }) {
        this.app = app;
        this.task = task;
        this.onSubmit = onSubmit;
        this.open = jest.fn();

        MockTaskModal.instance = this;
    }

    public submit(expected?: string) {
        let task = this.task;
        if (expected) {
            task = taskFromLine({ line: expected, path: '' });
        }
        this.onSubmit([task]);
    }

    public cancel(): void {
        this.onSubmit([]);
    }
}
jest.mock('../../src/TaskModal', () => {
    return {
        TaskModal: jest.fn(
            ({ app, task, onSubmit }: { app: App; task: Task; onSubmit: (updatedTasks: Task[]) => void }) => {
                return new MockTaskModal({ app, task, onSubmit });
            },
        ),
    };
});

describe('APIv1 - createOrEditTaskLineModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('TaskModal.open() should be called', () => {
        createOrEditTaskLineModal(app);
        expect(MockTaskModal.instance.open).toHaveBeenCalled();
    });

    it('should return the Markdown for a task if submitted', async () => {
        expect(await runCreateOrEditTaskLineModalTest('Submit')).toEqual('- [ ] ');
        expect(await runCreateOrEditTaskLineModalTest('Submit', '- [ ] test')).toEqual('- [ ] test');
    });

    it('should return an empty string if cancelled', async () => {
        expect(await runCreateOrEditTaskLineModalTest('Cancel')).toEqual('');
        expect(await runCreateOrEditTaskLineModalTest('Cancel', '- [ ] test')).toEqual('');
    });
});

type FormAction = 'Submit' | 'Cancel';

async function runCreateOrEditTaskLineModalTest(formAction: FormAction, initialTaskLine?: string): Promise<string> {
    let taskLinePromise: Promise<string>;

    if (initialTaskLine) {
        taskLinePromise = createOrEditTaskLineModal(app, initialTaskLine);
    } else {
        taskLinePromise = createOrEditTaskLineModal(app);
    }

    switch (formAction) {
        case 'Submit':
            MockTaskModal.instance.submit();
            break;
        case 'Cancel':
            MockTaskModal.instance.cancel();
            break;
    }

    return await taskLinePromise;
}
