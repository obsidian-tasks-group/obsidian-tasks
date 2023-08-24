import { Task } from '../src/Task';
import { TaskBuilder } from './TestingTools/TaskBuilder';

function addDependency(parentTask: Task, childTask: Task) {
    let newChild = childTask;

    if (childTask.id === '') {
        const id = 'abcdef';
        newChild = new Task({ ...childTask, id });
    }
    const newDependsOn = [...parentTask.dependsOn];
    newDependsOn.push(newChild.id);

    return [new Task({ ...parentTask, dependsOn: newDependsOn }), newChild];
}

describe('TaskDependency', () => {
    it('Should add dependency on existing id', () => {
        const childTask = new TaskBuilder().id('123456').build();
        const parentTask = new TaskBuilder().description('parent task').build();

        const [newParent, newChild] = addDependency(parentTask, childTask);

        expect(parentTask.dependsOn).toEqual([]);
        expect(newParent.dependsOn).toEqual(['123456']);
        expect(childTask.id).toEqual('123456');
        expect(newChild.id).toEqual('123456');
        expect(newChild === childTask).toEqual(true);
    });

    it('Should add an id to a child task with no id', () => {
        const childTask = new TaskBuilder().build();
        const parentTask = new TaskBuilder().description('parent task').build();

        const [newParent, newChild] = addDependency(parentTask, childTask);

        expect(newChild.id).not.toEqual('');
        expect(newParent.dependsOn).toEqual([newChild.id]);
    });
});
