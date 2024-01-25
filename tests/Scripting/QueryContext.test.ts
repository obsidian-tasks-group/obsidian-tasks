import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { FilenameField } from '../../src/Query/Filter/FilenameField';
import { FolderField } from '../../src/Query/Filter/FolderField';
import { PathField } from '../../src/Query/Filter/PathField';
import { RootField } from '../../src/Query/Filter/RootField';
import { makeQueryContext } from '../../src/Scripting/QueryContext';
import { FunctionField } from '../../src/Query/Filter/FunctionField';
import { SearchInfo } from '../../src/Query/SearchInfo';

const path = 'a/b/c.md';
const task = new TaskBuilder().path(path).build();
const queryContext = makeQueryContext(path);

describe('QueryContext', () => {
    describe('values should all match their corresponding filters', () => {
        it('query.file.root', () => {
            const instruction = `root includes ${queryContext.query.file.root}`;
            const filter = new RootField().createFilterOrErrorMessage(instruction);
            expect(filter).toMatchTask(task);
        });

        it('query.file.path', () => {
            const instruction = `path includes ${queryContext.query.file.path}`;
            const filter = new PathField().createFilterOrErrorMessage(instruction);
            expect(filter).toMatchTask(task);
        });

        it('query.file.folder', () => {
            const instruction = `folder includes ${queryContext.query.file.folder}`;
            const filter = new FolderField().createFilterOrErrorMessage(instruction);
            expect(filter).toMatchTask(task);
        });

        it('query.file.filename', () => {
            const instruction = `filename includes ${queryContext.query.file.filename}`;
            const filter = new FilenameField().createFilterOrErrorMessage(instruction);
            expect(filter).toMatchTask(task);
        });
    });

    describe('non-file properties', () => {
        it('query.allTasks', () => {
            // Arrange
            // An artificial example, just to demonstrate that query.allTasks is accessible via scripting,
            // when the SearchInfo parameter is converted to a QueryContext.
            const instruction = 'group by function query.allTasks.length';
            const grouper = new FunctionField().createGrouperFromLine(instruction);
            expect(grouper).not.toBeNull();
            const searchInfo = new SearchInfo(path, [task]);

            // Act
            const group: string[] = grouper!.grouper(task, searchInfo);

            // Assert
            expect(group).toEqual(['1']);
        });
    });
});
