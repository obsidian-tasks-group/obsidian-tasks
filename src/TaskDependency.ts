import { Task } from './Task';

export function ensureTaskHasId(childTask: Task, _existingIds: string[]) {
    let newChild = childTask;
    if (childTask.id === '') {
        // from https://www.codemzy.com/blog/random-unique-id-javascript
        const id = Math.random()
            .toString(36)
            .substring(2, 6 + 2);
        newChild = new Task({ ...childTask, id });
    }
    return newChild;
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

export function addDependency(parentTask: Task, childTask: Task, existingIds: string[]) {
    const newChild = ensureTaskHasId(childTask, existingIds);

    let newParent = parentTask;
    if (!parentTask.dependsOn.includes(newChild.id)) {
        const newDependsOn = [...parentTask.dependsOn, newChild.id];
        newParent = new Task({ ...parentTask, dependsOn: newDependsOn });
    }

    return [newParent, newChild];
}

export function removeDependency(parentTask: Task, childTask: Task) {
    let newParent = parentTask;
    if (parentTask.dependsOn.includes(childTask.id)) {
        const newDependsOn = parentTask.dependsOn.filter((dependsOn) => dependsOn !== childTask.id);
        newParent = new Task({ ...parentTask, dependsOn: newDependsOn });
    }

    return [newParent, childTask];
}
