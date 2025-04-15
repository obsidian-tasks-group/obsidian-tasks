import { getSettings, resetSettings, updateSettings } from '../../src/Config/Settings';
import { Query } from '../../src/Query/Query';
import { TasksFile } from '../../src/Scripting/TasksFile';

afterEach(() => {
    resetSettings();
});

describe('include tests', () => {
    it('should accept whole-line include placeholder', () => {
        updateSettings({ includes: { not_done: 'not done' } });

        const source = '{{includes.not_done}}';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();
        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('not done');
    });
});

describe('include settings tests', () => {
    it('should have an empty include field', () => {
        const settings = getSettings();

        expect(settings.includes).toEqual({});
    });
});
