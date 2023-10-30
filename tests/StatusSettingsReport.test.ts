import { StatusSettings } from '../src/Config/StatusSettings';
import { tabulateStatusSettings } from '../src/StatusSettingsReport';
import type { StatusCollection } from '../src/StatusCollection';
import { verifyWithFileExtension } from './TestingTools/ApprovalTestHelpers';
import { coreStatusesData, createStatuses } from './TestingTools/StatusesTestHelpers';

describe('StatusSettingsReport', () => {
    it('should tabulate StatusSettings', () => {
        const statusSettings = new StatusSettings();
        const markdown = tabulateStatusSettings(statusSettings);
        verifyWithFileExtension(markdown, '.md');
    });

    it('should include problems in table', () => {
        const customStatusesData: StatusCollection = [
            ['', '', '', 'TODO'], // A new, unedited status
        ];
        const { statusSettings } = createStatuses(coreStatusesData, customStatusesData);

        const markdown = tabulateStatusSettings(statusSettings);
        verifyWithFileExtension(markdown, '.md');
    });
});
