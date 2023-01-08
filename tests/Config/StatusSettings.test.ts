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
        StatusSettings.addCustomStatus(settings, pro);
        StatusSettings.addCustomStatus(settings, imp);
        StatusSettings.addCustomStatus(settings, con);
        return { pro, imp, con };
    }

    it('should add a status', () => {
        // Arrange
        const settings = new StatusSettings();
        expect(settings.customStatusTypes.length).toEqual(0);

        // Act
        const newStatus = new StatusConfiguration('!', 'Important', 'x', false);
        StatusSettings.addCustomStatus(settings, newStatus);

        // Assert
        expect(settings.customStatusTypes.length).toEqual(1);
        expect(settings.customStatusTypes[0]).toStrictEqual(newStatus);
    });

    it('should replace a status, if present', () => {
        // Arrange
        const settings = new StatusSettings();
        const { imp } = addThreeStatuses(settings);
        expect(settings.customStatusTypes.length).toEqual(3);
        expect(settings.customStatusTypes[1]).toStrictEqual(imp);

        // Act
        const newImp = new StatusConfiguration('!', 'ReallyImportant', 'X', true);
        StatusSettings.replaceCustomStatus(settings, imp, newImp);

        // Assert
        expect(settings.customStatusTypes.length).toEqual(3);
        expect(settings.customStatusTypes[1]).toStrictEqual(newImp);
    });

    it('should bulk-add new statuses, reporting errors', () => {
        // Arrange
        const newStatuses: Array<[string, string, string]> = [
            ['>', 'Forwarded', 'x'],
            ['<', 'Schedule', 'x'],
            ['?', 'Question', 'x'],
            ['-', 'Dropped - should not be added as duplicate of core Cancelled', 'x'],
            ['>', 'Forwarded', 'x'], // is a duplicate so should not be added
            ['<', 'Duplicate - should not be added as duplicate of Schedule above', 'x'],
            ['', 'Empty - should not be added as no status character', 'x'],
        ];
        const settings = new StatusSettings();

        // Act
        const result = StatusSettings.bulkAddStatusCollection(settings, newStatuses);

        // Assert
        expect(result).toStrictEqual(['The status Forwarded (>) is already added.']);
    });

    it('should delete a status', () => {
        // Arrange
        const settings = new StatusSettings();
        const { pro, imp, con } = addThreeStatuses(settings);
        expect(settings.customStatusTypes.length).toEqual(3);

        // Act
        const result = StatusSettings.deleteCustomStatus(settings, imp);

        // Assert
        expect(result).toEqual(true);
        expect(settings.customStatusTypes.length).toEqual(2);
        expect(settings.customStatusTypes[0]).toStrictEqual(pro);
        expect(settings.customStatusTypes[1]).toStrictEqual(con);

        // Delete a second time. It should now report that nothing was deleted.
        const result2 = StatusSettings.deleteCustomStatus(settings, imp);
        expect(result2).toEqual(false);
    });
});
