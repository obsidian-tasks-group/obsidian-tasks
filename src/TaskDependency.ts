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

export function ensureTaskHasId(childTask: Task, existingIds: string[]) {
    if (childTask.id !== '') return childTask;

    return new Task({ ...childTask, id: generateUniqueId(existingIds) });
}

export function setDependenciesOnTasksWithIds(parentTask: Task, childTasksWithIds: Task[]): Task {
    const newDependsOn = childTasksWithIds.map((task) => {
        return task.id;
    });
    let newParent = parentTask;
    if (parentTask.dependsOn.toString() !== newDependsOn.toString()) {
        newParent = new Task({ ...parentTask, dependsOn: newDependsOn });
    }

    return newParent;
}

export function addDependencyToParent(parentTask: Task, child: Task) {
    let newParent = parentTask;
    if (!parentTask.dependsOn.includes(child.id)) {
        const newDependsOn = [...parentTask.dependsOn, child.id];
        newParent = new Task({ ...parentTask, dependsOn: newDependsOn });
    }
    return newParent;
}

export function addDependency(parentTask: Task, childTask: Task, existingIds: string[]) {
    const newChild = ensureTaskHasId(childTask, existingIds);

    return [addDependencyToParent(parentTask, newChild), newChild];
}

export function removeDependency(parentTask: Task, childTask: Task) {
    let newParent = parentTask;
    if (parentTask.dependsOn.includes(childTask.id)) {
        const newDependsOn = parentTask.dependsOn.filter((dependsOn) => dependsOn !== childTask.id);
        newParent = new Task({ ...parentTask, dependsOn: newDependsOn });
    }

    return newParent;
}
