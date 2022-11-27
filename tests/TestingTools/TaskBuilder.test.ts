import { Status } from '../../src/Task';
import { TaskBuilder } from './TaskBuilder';

export {};

describe('TaskBuilder', () => {
    it('should add the tags to the description', () => {
        const builder = new TaskBuilder().description('hello').tags(['#tag1', '#tag2']);
        const task = builder.build();
        expect(task.toFileLineString()).toStrictEqual('- [ ] hello #tag1 #tag2');
    });

    describe('status and originalStatusCharacter', () => {
        it('should set custom status character when setting status TODO', () => {
            const builder = new TaskBuilder().status(Status.TODO);
            const task = builder.build();
            expect(task.status).toStrictEqual(Status.TODO);
            expect(task.originalStatusCharacter).toStrictEqual(' ');
            expect(task.toFileLineString()).toStrictEqual('- [ ] my description');
        });

        it('should set custom status character when setting status DONE', () => {
            const builder = new TaskBuilder().status(Status.DONE);
            const task = builder.build();
            expect(task.status).toStrictEqual(Status.DONE);
            expect(task.originalStatusCharacter).toStrictEqual('x');
            expect(task.toFileLineString()).toStrictEqual('- [x] my description');
        });

        it('should not change status when changing originalStatusCharacter to TODO', () => {
            const builder = new TaskBuilder().status(Status.DONE).originalStatusCharacter(' ');
            const task = builder.build();
            expect(task.status).toStrictEqual(Status.DONE);
            expect(task.originalStatusCharacter).toStrictEqual(' ');
            expect(task.toFileLineString()).toStrictEqual('- [ ] my description');
        });

        it('should not change status when changing originalStatusCharacter to Half Done', () => {
            const builder = new TaskBuilder().status(Status.DONE).originalStatusCharacter('/');
            const task = builder.build();
            expect(task.status).toStrictEqual(Status.DONE);
            expect(task.originalStatusCharacter).toStrictEqual('/');
            expect(task.toFileLineString()).toStrictEqual('- [/] my description');
        });
    });
});
