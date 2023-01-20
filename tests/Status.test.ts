/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status } from '../src/Status';
import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';
import type { StatusCollectionEntry } from '../src/StatusCollection';

jest.mock('obsidian');
window.moment = moment;

describe('Status', () => {
    it('preview text', () => {
        const configuration = new Status(new StatusConfiguration('P', 'Pro', 'Con', true, StatusType.TODO));
        expect(configuration.previewText()).toEqual("- [P] Pro, next status is 'Con', type is 'TODO'. ");
    });

    it('default configurations', () => {
        expect(Status.DONE.previewText()).toEqual("- [x] Done, next status is ' ', type is 'DONE'. ");
        expect(Status.EMPTY.previewText()).toEqual("- [] EMPTY, next status is '', type is 'EMPTY'. ");
        expect(Status.TODO.previewText()).toEqual("- [ ] Todo, next status is 'x', type is 'TODO'. ");
    });

    it('factory methods for default statuses', () => {
        expect(Status.makeDone().previewText()).toEqual("- [x] Done, next status is ' ', type is 'DONE'. ");
        expect(Status.makeEmpty().previewText()).toEqual("- [] EMPTY, next status is '', type is 'EMPTY'. ");
        expect(Status.makeTodo().previewText()).toEqual("- [ ] Todo, next status is 'x', type is 'TODO'. ");
        expect(Status.makeCancelled().previewText()).toEqual(
            "- [-] Cancelled, next status is ' ', type is 'CANCELLED'. ",
        );
        expect(Status.makeInProgress().previewText()).toEqual(
            "- [/] In Progress, next status is 'x', type is 'IN_PROGRESS'. ",
        );
    });

    it('should initialize with valid properties', () => {
        // Arrange
        const indicator = '/';
        const name = 'In Progress';
        const next = 'x';

        // Act
        const status = new Status(new StatusConfiguration(indicator, name, next, false, StatusType.IN_PROGRESS));

        // Assert
        expect(status).not.toBeNull();
        expect(status!.symbol).toEqual(indicator);
        expect(status!.name).toEqual(name);
        expect(status!.nextStatusIndicator).toEqual(next);
        expect(status!.type).toEqual(StatusType.IN_PROGRESS);
        expect(status!.isCompleted()).toEqual(false);
    });

    it('should be complete when indicator is "x"', () => {
        // Arrange
        const indicator = 'x';
        const name = 'Done';
        const next = ' ';

        // Act
        const status = new Status(new StatusConfiguration(indicator, name, next, false, StatusType.DONE));

        // Assert
        expect(status).not.toBeNull();
        expect(status!.symbol).toEqual(indicator);
        expect(status!.name).toEqual(name);
        expect(status!.nextStatusIndicator).toEqual(next);
        expect(status!.isCompleted()).toEqual(true);
    });

    it('should deduce type for unknown indicators', () => {
        expect(Status.getTypeForUnknownIndicator(' ')).toEqual(StatusType.TODO);
        expect(Status.getTypeForUnknownIndicator('!')).toEqual(StatusType.TODO); // Unknown character treated as TODO
        expect(Status.getTypeForUnknownIndicator('x')).toEqual(StatusType.DONE);
        expect(Status.getTypeForUnknownIndicator('X')).toEqual(StatusType.DONE);
        expect(Status.getTypeForUnknownIndicator('/')).toEqual(StatusType.IN_PROGRESS);
        expect(Status.getTypeForUnknownIndicator('-')).toEqual(StatusType.CANCELLED);
        expect(Status.getTypeForUnknownIndicator('')).toEqual(StatusType.EMPTY);
    });

    it('should deduce type from StatusType text', () => {
        expect(Status.getTypeFromStatusTypeString('TODO')).toEqual(StatusType.TODO);
        expect(Status.getTypeFromStatusTypeString('DONE')).toEqual(StatusType.DONE);
        expect(Status.getTypeFromStatusTypeString('IN_PROGRESS')).toEqual(StatusType.IN_PROGRESS);
        expect(Status.getTypeFromStatusTypeString('CANCELLED')).toEqual(StatusType.CANCELLED);
        expect(Status.getTypeFromStatusTypeString('NON_TASK')).toEqual(StatusType.NON_TASK);
        expect(Status.getTypeFromStatusTypeString('EMPTY')).toEqual(StatusType.EMPTY);
        expect(Status.getTypeFromStatusTypeString('i do not exist')).toEqual(StatusType.TODO);
    });

    it('should construct a Status for unknown symbol', () => {
        // Arrange
        const indicator = '/';

        // Act
        const status = Status.createUnknownStatus(indicator);

        // Assert
        expect(status).not.toBeNull();
        expect(status!.symbol).toEqual(indicator);
        expect(status!.name).toEqual('Unknown');
        expect(status!.nextStatusIndicator).toEqual('x');
        // Even though the type *could* be deduced as IN_PROGRESS, createUnknownStatus() is used when
        // the user has not defined the meaning of a status indicator, so treat everything as TODO.
        expect(status!.type).toEqual(StatusType.TODO);
        expect(status!.isCompleted()).toEqual(false);
    });

    it('should construct a Status from a core imported value', () => {
        const imported: StatusCollectionEntry = ['/', 'in progress', 'x', 'IN_PROGRESS'];
        const status = Status.createFromImportedValue(imported);
        expect(status.symbol).toEqual('/');
        expect(status.name).toEqual('in progress');
        expect(status.nextStatusIndicator).toEqual('x');
        expect(status.type).toEqual(StatusType.IN_PROGRESS); // should deduce IN_PROGRESS from indicator '/'
        expect(status.availableAsCommand).toEqual(false);
    });

    it('should construct a Status from a custom imported value', () => {
        const imported: StatusCollectionEntry = ['P', 'Pro', 'C', 'NON_TASK'];
        const status = Status.createFromImportedValue(imported);
        expect(status.symbol).toEqual('P');
        expect(status.name).toEqual('Pro');
        expect(status.nextStatusIndicator).toEqual('C');
        expect(status.type).toEqual(StatusType.NON_TASK);
        expect(status.availableAsCommand).toEqual(false);
    });
});
