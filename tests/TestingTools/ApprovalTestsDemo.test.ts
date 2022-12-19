import { verify, verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';

describe('ApprovalTests', () => {
    // begin-snippet: approval-test-as-text
    test('SimpleVerify', () => {
        verify('Hello From Approvals');
    });
    // end-snippet

    // begin-snippet: approval-test-as-json
    test('JsonVerify', () => {
        const data = { name: 'fred', age: 30 };
        verifyAsJson(data);
    });
    // end-snippet
});
