import { Task } from './Task';

export function ensureTaskHasId(childTask: Task) {
    let newChild = childTask;
    if (childTask.id === '') {
        const id = 'abcdef';
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

export function addDependency(parentTask: Task, childTask: Task) {
    const newChild = ensureTaskHasId(childTask);

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
