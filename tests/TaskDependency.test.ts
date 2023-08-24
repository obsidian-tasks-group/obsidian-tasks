import { Task } from '../src/Task';
import { TaskBuilder } from './TestingTools/TaskBuilder';

function addDependency(parentTask: Task, childTask: Task) {
    const id = childTask.id === '' ? 'abcdef' : childTask.id;
    const newDependsOn = [...parentTask.dependsOn];
    newDependsOn.push(id);

    return [new Task({ ...parentTask, dependsOn: newDependsOn }), new Task({ ...childTask, id })];
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
    });

    it('Should add an id to a child task with no id', () => {
        const childTask = new TaskBuilder().build();
        const parentTask = new TaskBuilder().description('parent task').build();

        const [newParent, newChild] = addDependency(parentTask, childTask);

        expect(newChild.id).not.toEqual('');
        expect(newParent.dependsOn).toEqual([newChild.id]);
    });
});
