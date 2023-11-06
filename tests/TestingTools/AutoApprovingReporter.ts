import type { ApprovalFailureReporter } from 'approvals/lib/Core/ApprovalFailureReporter';

const fs = require('fs');

/**
 * Use this if you want to **automatically approve** all changed Approval Tests approved files
 * and **review the differences in a git diff tool before committing**.
 * To activate this in several tests, uncomment the `new AutoApprovingReporter()` line in
 * {@link verifyMarkdown}.
 */
export class AutoApprovingReporter implements ApprovalFailureReporter {
    name: string = 'AutoApprovingReporter';

    canReportOn() {
        return true;
    }

    report(approvedFilePath: string, receivedFilePath: string) {
        fs.copyFile(receivedFilePath, approvedFilePath, function (err: Error) {
            if (err) throw err;
            console.log(`File was copied to destination
source:      ${receivedFilePath}
destination: ${approvedFilePath}
`);
        });
    }
}
