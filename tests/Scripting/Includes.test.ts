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

const tasksFile = new TasksFile('stuff.md');

function createQuery(source: string, includes: IncludesMap) {
    updateSettings({ includes });
    const query = new Query(source, tasksFile);

    expect(query.source).toEqual(source);

    return query;
}

function createValidQuery(source: string, includes: IncludesMap) {
    const query = createQuery(source, includes);

    expect(query.error).toBeUndefined();

    return query;
}

describe('include tests', () => {
    it('should accept whole-line include placeholder', () => {
        const includes = makeIncludes(['not_done', 'not done']);
        const source = '{{includes.not_done}}';

        const query = createValidQuery(source, includes);

        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('not done');
    });

    it('should accept whole-line include filter instruction', () => {
        const includes = makeIncludes(['not_done', 'not done']);
        const source = 'include not_done';

        const query = createValidQuery(source, includes);

        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('not done');
    });

    it('should accept whole-line include layout instruction', () => {
        const includes = makeIncludes(['show_tree', 'show tree']);
        const source = 'include show_tree';

        const query = createValidQuery(source, includes);

        expect(query.queryLayoutOptions.hideTree).toEqual(false);
        expect(query.layoutStatements[0].anyPlaceholdersExpanded).toEqual('show tree');
    });

    it('should accept multi-line include', () => {
        const includes = makeIncludes(['multi_line', 'scheduled tomorrow\nhide backlink']);
        const source = 'include multi_line';

        const query = createValidQuery(source, includes);

        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('scheduled tomorrow');

        expect(query.queryLayoutOptions.hideBacklinks).toEqual(true);
        expect(query.layoutStatements[0].anyPlaceholdersExpanded).toEqual('hide backlink');
    });

    it('should support nested include instructions', () => {
        const includes = makeIncludes(
            // Force line break
            ['inside', 'not done'],
            ['out', 'include inside\nhide edit button'],
        );
        const source = 'include out';

        const query = createValidQuery(source, includes);

        expect(query.filters.length).toEqual(1);
        expect(query.filters[0].statement.anyPlaceholdersExpanded).toEqual('not done');

        expect(query.queryLayoutOptions.hideEditButton).toEqual(true);
        expect(query.layoutStatements[0].anyPlaceholdersExpanded).toEqual('hide edit button');
    });

    it('should explain two levels of nested includes', () => {
        const includes = makeIncludes(
            ['inside', '(happens this week) AND (starts before today)'],
            ['out', 'include inside\nnot done'],
        );
        const source = 'include out';

        const query = createValidQuery(source, includes);

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
});

describe('include - error messages', () => {
    describe('use of non-existent include', () => {
        const includes = {};

        it('should give a meaningful error for non-existent include', () => {
            const query = createQuery('include not_existent', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "Cannot find include "not_existent" in the Tasks settings
                Problem line: "include not_existent""
            `);
        });
    });

    describe('expanded text is invalid instruction', () => {
        const includes = makeIncludes(
            // Force line break
            ['inside', 'apple sauce'],
            ['out', 'include inside'],
        );

        it('should give meaningful error message about included text', () => {
            const query = createQuery('include out', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "do not understand query
                Problem statement:
                    include out =>
                    apple sauce
                "
            `);
        });
    });
});

describe('include settings tests', () => {
    it('should have an empty include field', () => {
        const settings = getSettings();

        expect(settings.includes).toEqual({});
    });
});
