import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import { StatusSettings } from '../../src/Config/StatusSettings';

describe('StatusSettings', () => {
    it('verify default status settings', () => {
        const defaultStatusSettings = new StatusSettings();
        verifyAsJson(defaultStatusSettings);
    });
});
