/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { TASK_FORMATS, resetSettings, updateSettings } from '../../src/Config/Settings';
import { verifyMarkdown, verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { SampleTasks } from '../TestingTools/SampleTasks';
import { allTaskPluginEmojis } from '../../src/TaskSerializer/DefaultTaskSerializer';
import { MarkdownTable } from '../../src/lib/MarkdownTable';

window.moment = moment;

afterEach(() => {
    resetSettings();
});

describe('Serializer', () => {
    describe('Emojis', () => {
        it('tabulate-emojis', () => {
            const table = new MarkdownTable(['Emoji', 'Codepoint']);

            const emojis = allTaskPluginEmojis();
            emojis
                .map((emoji) => {
                    const hex = emoji.codePointAt(0)?.toString(16);
                    const s = hex ? `U+${hex.toUpperCase()}` : 'undefined';
                    return [emoji, s];
                })
                .sort((a, b) => {
                    // Sort by the codepoint:
                    return a[1].localeCompare(b[1]);
                })
                .forEach((row) => {
                    table.addRow(row);
                });
            verifyMarkdownForDocs(table.markdown);
        });
    });

    describe('Dates', () => {
        function allDatesLines() {
            const tasks = SampleTasks.withEachDateTypeAndCorrespondingStatus();
            return tasks.map((t) => t.toFileLineString()).join('\n');
        }

        it.each(Object.keys(TASK_FORMATS))('%s-snippet', (key: string) => {
            updateSettings({ taskFormat: key as keyof TASK_FORMATS });
            verifyMarkdown(allDatesLines());
        });

        it.each(Object.keys(TASK_FORMATS))('%s-include', (key: string) => {
            updateSettings({ taskFormat: key as keyof TASK_FORMATS });
            verifyMarkdownForDocs(allDatesLines());
        });
    });

    describe('Priorities', () => {
        function allPriorityLines() {
            const tasks = SampleTasks.withAllPriorities().reverse();
            return tasks.map((t) => t.toFileLineString()).join('\n');
        }

        it.each(Object.keys(TASK_FORMATS))('%s-snippet', (key: string) => {
            updateSettings({ taskFormat: key as keyof TASK_FORMATS });
            verifyMarkdown(allPriorityLines());
        });

        it.each(Object.keys(TASK_FORMATS))('%s-include', (key: string) => {
            updateSettings({ taskFormat: key as keyof TASK_FORMATS });
            verifyMarkdownForDocs(allPriorityLines());
        });
    });

    describe('Dependencies', () => {
        function allDependencyLines() {
            const tasks = SampleTasks.withAllRepresentativeDependencyFields();
            return tasks.map((t) => t.toFileLineString()).join('\n');
        }

        it.each(Object.keys(TASK_FORMATS))('%s-snippet', (key: string) => {
            updateSettings({ taskFormat: key as keyof TASK_FORMATS });
            verifyMarkdown(allDependencyLines());
        });

        it.each(Object.keys(TASK_FORMATS))('%s-include', (key: string) => {
            updateSettings({ taskFormat: key as keyof TASK_FORMATS });
            verifyMarkdownForDocs(allDependencyLines());
        });
    });
});
