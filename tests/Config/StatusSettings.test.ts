import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import { StatusSettings } from '../../src/Config/StatusSettings';
import { StatusConfiguration } from '../../src/Status';

describe('StatusSettings', () => {
    it('verify default status settings', () => {
        const defaultStatusSettings = new StatusSettings();
        verifyAsJson(defaultStatusSettings);
    });

    function addThreeStatuses(settings: StatusSettings) {
        const pro = new StatusConfiguration('P', 'Pro', 'C', false);
        const imp = new StatusConfiguration('!', 'Important', 'x', false);
        const con = new StatusConfiguration('C', 'Con', 'P', false);
        settings.addCustomStatus(pro);
        settings.addCustomStatus(imp);
        settings.addCustomStatus(con);
        return { pro, imp, con };
    }

    it('should add a status', () => {
        // Arrange
        const settings = new StatusSettings();
        expect(settings.customStatusTypes.length).toEqual(0);

        // Act
        const newStatus = new StatusConfiguration('!', 'Important', 'x', false);
        settings.addCustomStatus(newStatus);

        // Assert
        expect(settings.customStatusTypes.length).toEqual(1);
        expect(settings.customStatusTypes[0]).toStrictEqual(newStatus);
    });

    it('should delete a status', () => {
        // Arrange
        const settings = new StatusSettings();
        const { pro, imp, con } = addThreeStatuses(settings);
        expect(settings.customStatusTypes.length).toEqual(3);

        // Act
        const result = settings.deleteCustomStatus(imp);

        // Assert
        expect(result).toEqual(true);
        expect(settings.customStatusTypes.length).toEqual(2);
        expect(settings.customStatusTypes[0]).toStrictEqual(pro);
        expect(settings.customStatusTypes[1]).toStrictEqual(con);

        // Delete a second time. It should now report that nothing was deleted.
        const result2 = settings.deleteCustomStatus(imp);
        expect(result2).toEqual(false);
    });
});
