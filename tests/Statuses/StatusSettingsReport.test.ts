import { StatusSettings } from '../../src/Config/StatusSettings';
import { sampleTaskLinesForValidStatuses, tabulateStatusSettings } from '../../src/Statuses/StatusSettingsReport';
import type { StatusCollection } from '../../src/Statuses/StatusCollection';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { coreStatusesData, createStatuses } from '../TestingTools/StatusesTestHelpers';
import { initializeI18n } from '../../src/i18n/i18n';
import { GlobalFilter } from '../../src/Config/GlobalFilter';

beforeAll(async () => {
    await initializeI18n();
});

afterEach(() => {
    GlobalFilter.getInstance().reset();
});

describe('StatusSettingsReport', () => {
    it('should tabulate StatusSettings', () => {
        const statusSettings = new StatusSettings();
        const markdown = tabulateStatusSettings(statusSettings);
        verifyWithFileExtension(markdown, '.md');
    });

    it('should include problems in table', () => {
        const customStatusesData: StatusCollection = [
            ['/', 'In Progress', 'x', 'IN_PROGRESS'],
            ['/', 'In Progress DUPLICATE', 'x', 'IN_PROGRESS'],
            ['X', 'X - conventionally DONE, but this is CANCELLED', ' ', 'CANCELLED'],
            ['', '', '', 'TODO'], // A new, unedited status
            ['p', 'Unknown next symbol', 'q', 'TODO'],
            ['c', 'Followed by d', 'd', 'TODO'],
            ['n', 'Non-task', 'n', 'NON_TASK'],
            ['1', 'DONE followed by TODO', ' ', 'DONE'],
            ['2', 'DONE followed by IN_PROGRESS', '/', 'DONE'],
            ['3', 'DONE followed by DONE', 'x', 'DONE'],
            ['4', 'DONE followed by CANCELLED', 'X', 'DONE'],
            ['5', 'DONE followed by NON_TASK', 'n', 'DONE'],
        ];
        const { statusSettings } = createStatuses(coreStatusesData, customStatusesData);

        const markdown = tabulateStatusSettings(statusSettings);
        verifyWithFileExtension(markdown, '.md');
    });

    const customStatusesDataForSampleLines: StatusCollection = [
        ['/', 'A slash', 'x', 'IN_PROGRESS'],
        ['/', 'In Progress DUPLICATE - SHOULD NOT BE IN SAMPLE TASK LINES', 'x', 'IN_PROGRESS'],
        ['', 'EMPTY STATUS SYMBOL - SHOULD NOT BE IN SAMPLE TASK LINES', '', 'TODO'],
        ['p', 'A p', 'q', 'TODO'],
    ];

    it('should create set of sample task lines, excluding duplicate and empty symbols', () => {
        const { statusSettings } = createStatuses(coreStatusesData, customStatusesDataForSampleLines);

        const taskLines = sampleTaskLinesForValidStatuses(statusSettings);
        verifyWithFileExtension(taskLines.join('\n'), '.md');
    });

    it('should create set of sample task lines include global filter', () => {
        GlobalFilter.getInstance().set('#task');
        const { statusSettings } = createStatuses(coreStatusesData, customStatusesDataForSampleLines);

        const taskLines = sampleTaskLinesForValidStatuses(statusSettings);
        verifyWithFileExtension(taskLines.join('\n'), '.md');
    });
});
