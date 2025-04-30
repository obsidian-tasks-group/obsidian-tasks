/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { type IncludesMap, getSettings, resetSettings, updateSettings } from '../../src/Config/Settings';
import { Query } from '../../src/Query/Query';
import { TasksFile } from '../../src/Scripting/TasksFile';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-04-28'));
});

afterEach(() => {
    resetSettings();
});

export function makeIncludes(...entries: [string, string][]): IncludesMap {
    return Object.fromEntries(entries);
}

describe('include tests', () => {
    it('should accept whole-line include placeholder', () => {
        updateSettings({
            includes: makeIncludes(['not_done', 'not done']),
        });

        const source = '{{includes.not_done}}';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();
        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('not done');
    });

    it('should accept whole-line include filter instruction', () => {
        updateSettings({
            includes: makeIncludes(['not_done', 'not done']),
        });

        const source = 'include not_done';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();
        expect(query.source).toEqual('include not_done');
        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('not done');
    });

    it('should accept whole-line include layout instruction', () => {
        updateSettings({
            includes: makeIncludes(['show_tree', 'show tree']),
        });

        const source = 'include show_tree';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();
        expect(query.source).toEqual('include show_tree');
        expect(query.queryLayoutOptions.hideTree).toEqual(false);
        expect(query.layoutStatements[0].anyPlaceholdersExpanded).toEqual('show tree');
    });

    it('should accept multi-line include', () => {
        updateSettings({
            includes: makeIncludes(['multi_line', 'scheduled tomorrow\nhide backlink']),
        });
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
            includes: makeIncludes(
                // Force line break
                ['inside', 'not done'],
                ['out', 'include inside\nhide edit button'],
            ),
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

    it('should explain two levels of nested includes', () => {
        updateSettings({
            includes: makeIncludes(
                ['inside', '(happens this week) AND (starts before today)'],
                ['out', 'include inside\nnot done'],
            ),
        });

        const source = 'include out';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.explainQuery()).toMatchInlineSnapshot(`
            "include out =>
            (happens this week) AND (starts before today) =>
              AND (All of):
                happens this week =>
                  due, start or scheduled date is between:
                    2025-04-28 (Monday 28th April 2025) and
                    2025-05-04 (Sunday 4th May 2025) inclusive
                starts before today =>
                  start date is before 2025-04-28 (Monday 28th April 2025) OR no start date

            include out =>
            not done
            "
        `);
    });

    it('should give meaningful error message about included text', () => {
        updateSettings({
            includes: makeIncludes(
                // Force line break
                ['inside', 'apple sauce'],
                ['out', 'include inside'],
            ),
        });

        const source = 'include out';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toMatchInlineSnapshot(`
            "do not understand query
            Problem statement:
                include out =>
                apple sauce
            "
        `);
    });
});

describe('include settings tests', () => {
    it('should have an empty include field', () => {
        const settings = getSettings();

        expect(settings.includes).toEqual({});
    });
});
