import type { TaskBuilder } from '../TestingTools/TaskBuilder';

declare module 'vitest' {
    interface Matchers<R> {
        toBeIdenticalTo(builder2: TaskBuilder): R;
    }
}

export function toBeIdenticalTo(builder1: TaskBuilder, builder2: TaskBuilder) {
    const task1 = builder1.build();
    const task2 = builder2.build();
    const pass = task1.identicalTo(task2);

    if (pass) {
        return {
            message: () => 'Tasks treated as identical, but should be different',
            pass: true,
        };
    }
    return {
        message: () => {
            return 'Tasks should be identical, but are treated as different';
        },
        pass: false,
    };
}
