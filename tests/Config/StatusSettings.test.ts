import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import { StatusSettings } from '../../src/Config/StatusSettings';
import { Status } from '../../src/Statuses/Status';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import type { StatusCollection } from '../../src/Statuses/StatusCollection';

describe('StatusSettings', () => {
    it('verify default status settings', () => {
        const defaultStatusSettings = new StatusSettings();
        // Core statuses
        expect(defaultStatusSettings.coreStatuses.length).toEqual(2);
        expect(defaultStatusSettings.coreStatuses[0].symbol).toEqual(' ');
        expect(defaultStatusSettings.coreStatuses[1].symbol).toEqual('x');

        // Custom statuses
        expect(defaultStatusSettings.customStatuses.length).toEqual(2);
        expect(defaultStatusSettings.customStatuses[0].symbol).toEqual('/');
        expect(defaultStatusSettings.customStatuses[1].symbol).toEqual('-');

        // This captures the default contents of both core and custom statuses
        verifyAsJson(defaultStatusSettings);
    });

    function setThreeCustomStatuses(settings: StatusSettings) {
        StatusSettings.deleteAllCustomStatuses(settings);
        const pro = new StatusConfiguration('P', 'Pro', 'C', false);
        const imp = new StatusConfiguration('!', 'Important', 'x', false);
        const con = new StatusConfiguration('C', 'Con', 'P', false);
        StatusSettings.addStatus(settings.customStatuses, pro);
        StatusSettings.addStatus(settings.customStatuses, imp);
        StatusSettings.addStatus(settings.customStatuses, con);
        return { pro, imp, con };
    }

    it('should add a status', () => {
        // Arrange
        const settings = new StatusSettings();
        expect(settings.coreStatuses.length).toEqual(2);
        expect(settings.customStatuses.length).toEqual(2);

        // Act
        const newStatus = new StatusConfiguration('!', 'Important', 'x', false);
        StatusSettings.addStatus(settings.customStatuses, newStatus);

        // Assert
        expect(settings.customStatuses.length).toEqual(3);
        expect(settings.customStatuses[2]).toStrictEqual(newStatus);
    });

    it('should replace a status, if present', () => {
        // Arrange
        const settings = new StatusSettings();
        const { imp } = setThreeCustomStatuses(settings);
        expect(settings.customStatuses.length).toEqual(3);
        expect(settings.customStatuses[1]).toStrictEqual(imp);

        // Act
        const newImp = new StatusConfiguration('!', 'ReallyImportant', 'X', true);
        StatusSettings.replaceStatus(settings.customStatuses, imp, newImp);

        // Assert
        expect(settings.customStatuses.length).toEqual(3);
        expect(settings.customStatuses[1]).toStrictEqual(newImp);
    });

    it('should bulk-add new statuses, reporting errors', () => {
        // Arrange
        const newStatuses: StatusCollection = [
            ['>', 'Forwarded', 'x', 'TODO'],
            ['<', 'Schedule', 'x', 'TODO'],
            ['?', 'Question', 'x', 'TODO'],
            ['-', 'Dropped - should not be added as duplicate of core Cancelled', 'x', 'CANCELLED'],
            ['>', 'Forwarded', 'x', 'TODO'], // is a duplicate so should not be added
            ['<', 'Duplicate - should not be added as duplicate of Schedule above', 'x', 'TODO'],
            ['', 'Empty - should not be added as no status character', 'x', 'TODO'],
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
        const { pro, imp, con } = setThreeCustomStatuses(settings);
        expect(settings.customStatuses.length).toEqual(3);

        // Act
        const result = StatusSettings.deleteStatus(settings.customStatuses, imp);

        // Assert
        expect(result).toEqual(true);
        expect(settings.customStatuses.length).toEqual(2);
        expect(settings.customStatuses[0]).toStrictEqual(pro);
        expect(settings.customStatuses[1]).toStrictEqual(con);

        // Delete a second time. It should now report that nothing was deleted.
        const result2 = StatusSettings.deleteStatus(settings.customStatuses, imp);
        expect(result2).toEqual(false);
    });

    it('should delete all custom statuses', () => {
        // Arrange
        const settings = new StatusSettings();
        setThreeCustomStatuses(settings);
        expect(settings.customStatuses.length).toEqual(3);

        // Act
        StatusSettings.deleteAllCustomStatuses(settings);

        // Assert
        expect(settings.customStatuses.length).toEqual(0);
    });

    it('should reset all custom statuses', () => {
        // Arrange
        const settings = new StatusSettings();
        // Stomp on the current custom settings.
        settings.customStatuses.forEach((s) => {
            StatusSettings.replaceStatus(
                settings.customStatuses,
                s,
                new StatusConfiguration(s.symbol, 'NONSENSE NAME', 'x', false, StatusType.DONE),
            );
        });
        // Add some additional custom settings.
        StatusSettings.addStatus(
            settings.customStatuses,
            new StatusConfiguration('%', 'ANYTHING', '_', true, StatusType.NON_TASK),
        );

        // Act
        StatusSettings.resetAllCustomStatuses(settings);

        // Assert
        expect(settings.customStatuses.length).toEqual(2);
        expect(settings.customStatuses[0]).toMatchInlineSnapshot(`
            StatusConfiguration {
              "availableAsCommand": true,
              "name": "In Progress",
              "nextStatusSymbol": "x",
              "symbol": "/",
              "type": "IN_PROGRESS",
            }
        `);
        expect(settings.customStatuses[1]).toMatchInlineSnapshot(`
            StatusConfiguration {
              "availableAsCommand": true,
              "name": "Cancelled",
              "nextStatusSymbol": " ",
              "symbol": "-",
              "type": "CANCELLED",
            }
        `);
    });

    it('should return a combined list of all statuses', () => {
        // Arrange
        const settings = new StatusSettings();

        // Act
        const allStatuses = StatusSettings.allStatuses(settings);

        // Assert
        const allSymbolsInOrder = allStatuses.map((status) => status.symbol).join('|');
        expect(allSymbolsInOrder).toEqual(' |x|/|-');
    });

    it('should apply settings to a StatusRegistry', () => {
        // Arrange
        const settings = new StatusSettings();
        const { pro, imp, con } = setThreeCustomStatuses(settings);
        expect(settings.coreStatuses.length).toEqual(2);
        expect(settings.customStatuses.length).toEqual(3);

        const statusRegistry = new StatusRegistry();
        expect(statusRegistry.registeredStatuses.length).toEqual(4);

        // Act
        StatusSettings.applyToStatusRegistry(settings, statusRegistry);

        // Assert
        const statuses = statusRegistry.registeredStatuses;
        expect(statuses.length).toEqual(5);
        expect(statuses[2]).toStrictEqual(new Status(pro));
        expect(statuses[3]).toStrictEqual(new Status(imp));
        expect(statuses[4]).toStrictEqual(new Status(con));
    });
});
