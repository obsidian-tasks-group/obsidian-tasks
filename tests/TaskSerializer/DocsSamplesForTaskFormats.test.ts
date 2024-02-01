/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { TASK_FORMATS, resetSettings, updateSettings } from '../../src/Config/Settings';
import { verifyMarkdown, verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { SampleTasks } from '../TestingTools/SampleTasks';

window.moment = moment;

afterEach(() => {
    resetSettings();
});

describe('Serializer', () => {
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
