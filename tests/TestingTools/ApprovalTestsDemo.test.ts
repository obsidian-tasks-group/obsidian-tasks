import { verify, verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';

describe('ApprovalTests', () => {
    test('SimpleVerify', () => {
        verify('Hello From Approvals');
    });

    test('JsonVerify', () => {
        const data = { name: 'fred', age: 30 };
        verifyAsJson(data);
    });
});
