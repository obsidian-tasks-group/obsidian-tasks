import { Task } from './Task';

export function generateUniqueId(existingIds: string[]) {
    let id = '';
    let keepGenerating = true;

    while (keepGenerating) {
        // from https://www.codemzy.com/blog/random-unique-id-javascript
        id = Math.random()
            .toString(36)
            .substring(2, 6 + 2);

        if (!existingIds.includes(id)) {
            keepGenerating = false;
        }
    }
    return id;
}

export function ensureTaskHasId(child: Task, existingIds: string[]) {
    if (child.id !== '') return child;

    return new Task({ ...child, id: generateUniqueId(existingIds) });
}

export function setDependenciesOnTasksWithIds(parent: Task, childrenWithIds: Task[]): Task {
    const newDependsOn = childrenWithIds.map((task) => {
        return task.id;
    });
    let newParent = parent;
    if (parent.dependsOn.toString() !== newDependsOn.toString()) {
        newParent = new Task({ ...parent, dependsOn: newDependsOn });
    }

    return newParent;
}

export function addDependencyToParent(parent: Task, child: Task) {
    let newParent = parent;
    if (!parent.dependsOn.includes(child.id)) {
        const newDependsOn = [...parent.dependsOn, child.id];
        newParent = new Task({ ...parent, dependsOn: newDependsOn });
    }
    return newParent;
}

export function addDependency(parent: Task, child: Task, existingIds: string[]) {
    const newChild = ensureTaskHasId(child, existingIds);

    return [addDependencyToParent(parent, newChild), newChild];
}

export function removeDependency(parent: Task, child: Task) {
    let newParent = parent;
    if (parent.dependsOn.includes(child.id)) {
        const newDependsOn = parent.dependsOn.filter((dependsOn) => dependsOn !== child.id);
        newParent = new Task({ ...parent, dependsOn: newDependsOn });
    }

    return newParent;
}

export function firstTaskDependingOnThisIDWithAnyStatus(id: string, allTasks: Readonly<Task[]>): Task | undefined {
    return allTasks.find((task) => {
        return task.dependsOn.includes(id);
    });
}

export function firstTaskThisDependsOnWithAnyStatus(task: Task, allTasks: Readonly<Task[]>): Task | undefined {
    if (task.dependsOn.length === 0) {
        return undefined;
    }

    for (const depId of task.dependsOn) {
        const depTask = allTasks.find((task) => task.id === depId);
        if (!depTask) {
            // There is no task with this id.
            continue;
        }

        // We found a task that this depends on:
        return depTask;
    }

    return undefined;
}
