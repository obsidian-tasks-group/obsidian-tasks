import { Task } from '../src/Task';
import { TaskBuilder } from './TestingTools/TaskBuilder';

function addDependency(parentTask: Task, childTask: Task) {
    const newDependsOn = [...parentTask.dependsOn];
    newDependsOn.push(childTask.id);

    return [new Task({ ...parentTask, dependsOn: newDependsOn }), new Task({ ...childTask })];
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
});
