import { Status, Task } from '../../src/Task';
import { TaskBuilder } from './TaskBuilder';

export {};

describe('TaskBuilder', () => {
    it('should add the tags to the description', () => {
        const builder = new TaskBuilder().description('hello').tags(['#tag1', '#tag2']);
        const task = builder.build();
        expect(task.toFileLineString()).toStrictEqual('- [ ] hello #tag1 #tag2');
    });

    describe('status and originalStatusCharacter', () => {
        function checkStatuses(task: Task, status: Status, originalStatusCharacter: string, description: string) {
            expect(task.status).toStrictEqual(status);
            expect(task.originalStatusCharacter).toStrictEqual(originalStatusCharacter);
            expect(task.toFileLineString()).toStrictEqual(description);
        }

        it('should set originalStatusCharacter when setting status TODO', () => {
            const builder = new TaskBuilder().originalStatusCharacter('?').status(Status.TODO);
            const task = builder.build();
            checkStatuses(task, Status.TODO, ' ', '- [ ] my description');
        });

        it('should set originalStatusCharacter when setting status DONE', () => {
            const builder = new TaskBuilder().originalStatusCharacter('?').status(Status.DONE);
            const task = builder.build();
            checkStatuses(task, Status.DONE, 'x', '- [x] my description');
        });

        it('should not change status when changing originalStatusCharacter to TODO', () => {
            const builder = new TaskBuilder().status(Status.DONE).originalStatusCharacter(' ');
            const task = builder.build();
            checkStatuses(task, Status.DONE, ' ', '- [ ] my description');
        });

        it('should not change status when changing originalStatusCharacter to Half Done', () => {
            const builder = new TaskBuilder().status(Status.DONE).originalStatusCharacter('/');
            const task = builder.build();
            checkStatuses(task, Status.DONE, '/', '- [/] my description');
        });
    });
});
