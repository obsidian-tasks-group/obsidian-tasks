import { createStatusRegistryReport } from '../../src/Statuses/StatusRegistryReport';
import type { StatusCollection } from '../../src/Statuses/StatusCollection';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { coreStatusesData, createStatuses } from '../TestingTools/StatusesTestHelpers';
import { initializeI18n } from '../../src/i18n/i18n';

describe('StatusRegistryReport', function () {
    it('should create a report', async () => {
        // This should probably be called before every test
        await initializeI18n();

        // Arrange

        const customStatusesData: StatusCollection = [
            ['/', 'In Progress', 'x', 'IN_PROGRESS'],
            ['-', 'Cancelled', ' ', 'CANCELLED'],
            ['Q', 'Question', 'A', 'NON_TASK'],
            ['A', 'Answer', 'Q', 'NON_TASK'],
            ['', '', '', 'TODO'], // A new, unedited status
        ];
        const { statusSettings, statusRegistry } = createStatuses(coreStatusesData, customStatusesData);

        const reportName = 'Review and check your Statuses';

        // Act
        const version = 'x.y.z'; // lower-case, as the capitalised version would get edited at the next release.
        const report = createStatusRegistryReport(statusSettings, statusRegistry, reportName, version);

        // Assert
        verifyWithFileExtension(report, '.md');
    });
});
