import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import { defaultStatusSettings } from '../../src/Config/StatusSettings';

describe('StatusSettings', () => {
    it('verify default status settings', () => {
        verifyAsJson(defaultStatusSettings);
    });
});
