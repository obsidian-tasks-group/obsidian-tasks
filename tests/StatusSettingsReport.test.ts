import { StatusSettings } from '../src/Config/StatusSettings';
import { tabulateStatusSettings } from '../src/StatusSettingsReport';
import { verifyWithFileExtension } from './TestingTools/ApprovalTestHelpers';

describe('StatusSettingsReport', () => {
    it('should tabulate StatusSettings', () => {
        const statusSettings = new StatusSettings();
        const markdown = tabulateStatusSettings(statusSettings);
        verifyWithFileExtension(markdown, '.md');
    });
});
