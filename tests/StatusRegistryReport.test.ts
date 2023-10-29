import { StatusRegistry } from '../src/StatusRegistry';
import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';
import { createStatusRegistryReport } from '../src/StatusRegistryReport';
import { verifyWithFileExtension } from './TestingTools/ApprovalTestHelpers';

describe('StatusRegistryReport', function () {
    it('should create a report', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        statusRegistry.add(new StatusConfiguration('Q', 'Question', 'A', false, StatusType.NON_TASK));
        statusRegistry.add(new StatusConfiguration('A', 'Answer', 'Q', false, StatusType.NON_TASK));
        const reportName = 'Review and check your Statuses';

        // Act
        const report = createStatusRegistryReport(statusRegistry, reportName);

        // Assert
        verifyWithFileExtension(report, '.md');
    });
});
