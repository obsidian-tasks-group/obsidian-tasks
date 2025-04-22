/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { getSettings, resetSettings, updateSettings } from '../../src/Config/Settings';
import { Query } from '../../src/Query/Query';
import { TasksFile } from '../../src/Scripting/TasksFile';

window.moment = moment;

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

    it('should accept whole-line include filter instruction', () => {
        updateSettings({ includes: { not_done: 'not done' } });

        const source = 'include not_done';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();
        expect(query.source).toEqual('include not_done');
        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('not done');
    });

    it('should accept whole-line include layout instruction', () => {
        updateSettings({ includes: { show_tree: 'show tree' } });

        const source = 'include show_tree';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();
        expect(query.source).toEqual('include show_tree');
        expect(query.queryLayoutOptions.hideTree).toEqual(false);
        expect(query.layoutStatements[0].anyPlaceholdersExpanded).toEqual('show tree');
    });

    it('should accept multi-line include', () => {
        updateSettings({ includes: { multi_line: 'scheduled tomorrow\nhide backlink' } });

        const source = 'include multi_line';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();

        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('scheduled tomorrow');

        expect(query.queryLayoutOptions.hideBacklinks).toEqual(true);
        expect(query.layoutStatements[0].anyPlaceholdersExpanded).toEqual('hide backlink');
    });

    it('should give a meaningful error for non-existent include', () => {
        updateSettings({ includes: {} });

        const source = 'include not_existent';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toMatchInlineSnapshot(`
            "Cannot find include "not_existent" in the Tasks settings
            Problem line: "include not_existent""
        `);
        expect(query.source).toEqual('include not_existent');
    });

    it('should support nested include instructions', () => {
        updateSettings({
            includes: {
                inside: 'not done',
                out: 'include inside\nhide edit button',
            },
        });

        const source = 'include out';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();
        expect(query.source).toEqual('include out');

        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('not done');

        expect(query.queryLayoutOptions.hideEditButton).toEqual(true);
        expect(query.layoutStatements[0].anyPlaceholdersExpanded).toEqual('hide edit button');
    });
});

describe('include settings tests', () => {
    it('should have an empty include field', () => {
        const settings = getSettings();

        expect(settings.includes).toEqual({});
    });
});
