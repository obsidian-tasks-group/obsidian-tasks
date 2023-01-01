/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { StatusRegistry } from '../src/StatusRegistry';
import { Status } from '../src/Status';

jest.mock('obsidian');
window.moment = moment;

describe('StatusRegistry', () => {
    it('should create a new instance and populate default status indicators', () => {
        // Arrange

        // Act
        const statusRegistry = StatusRegistry.getInstance();
        const doneStatus = statusRegistry.byIndicator('x');

        // Assert
        expect(statusRegistry).not.toBeNull();

        expect(doneStatus.indicator).toEqual(Status.DONE.indicator);

        expect(statusRegistry.byIndicator('x').indicator).toEqual(Status.DONE.indicator);
        expect(statusRegistry.byIndicator('').indicator).toEqual(Status.EMPTY.indicator);
        expect(statusRegistry.byIndicator(' ').indicator).toEqual(Status.TODO.indicator);
    });
});
