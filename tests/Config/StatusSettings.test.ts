import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import { StatusSettings } from '../../src/Config/StatusSettings';
import { Status, StatusConfiguration } from '../../src/Status';

describe('StatusSettings', () => {
    it('verify default status settings', () => {
        const defaultStatusSettings = new StatusSettings();
        verifyAsJson(defaultStatusSettings);
    });

    it('should add a status', () => {
        // Arrange
        const settings = new StatusSettings();
        expect(settings.customStatusTypes.length).toEqual(0);

        // Act
        const newStatus = new Status(new StatusConfiguration('!', 'Important', 'x', false));
        settings.addCustomStatus(newStatus);

        // Assert
        expect(settings.customStatusTypes.length).toEqual(1);
        expect(settings.customStatusTypes[0]).toStrictEqual(newStatus);
    });
});
