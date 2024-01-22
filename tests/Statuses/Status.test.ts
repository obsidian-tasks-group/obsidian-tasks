/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status } from '../../src/Statuses/Status';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import type { StatusCollectionEntry } from '../../src/Statuses/StatusCollection';

jest.mock('obsidian');
window.moment = moment;

describe('Status', () => {
    it('preview text', () => {
        const configuration = new Status(new StatusConfiguration('P', 'Pro', 'C', true, StatusType.TODO));
        expect(configuration.previewText()).toEqual("- [P] => [C], name: 'Pro', type: 'TODO'.");
    });

    it('default configurations', () => {
        expect(Status.DONE.previewText()).toEqual("- [x] => [ ], name: 'Done', type: 'DONE'.");
        expect(Status.EMPTY.previewText()).toEqual("- [] => [], name: 'EMPTY', type: 'EMPTY'.");
        expect(Status.TODO.previewText()).toEqual("- [ ] => [x], name: 'Todo', type: 'TODO'.");
    });

    it('factory methods for default statuses', () => {
        expect(Status.makeDone().previewText()).toEqual("- [x] => [ ], name: 'Done', type: 'DONE'.");
        expect(Status.makeEmpty().previewText()).toEqual("- [] => [], name: 'EMPTY', type: 'EMPTY'.");
        expect(Status.makeTodo().previewText()).toEqual("- [ ] => [x], name: 'Todo', type: 'TODO'.");
        expect(Status.makeCancelled().previewText()).toEqual("- [-] => [ ], name: 'Cancelled', type: 'CANCELLED'.");
        expect(Status.makeInProgress().previewText()).toEqual(
            "- [/] => [x], name: 'In Progress', type: 'IN_PROGRESS'.",
        );
        expect(Status.makeNonTask().previewText()).toEqual("- [Q] => [A], name: 'Non-Task', type: 'NON_TASK'.");
    });

    it('should initialize with valid properties', () => {
        // Arrange
        const symbol = '/';
        const name = 'In Progress';
        const next = 'x';

        // Act
        const status = new Status(new StatusConfiguration(symbol, name, next, false, StatusType.IN_PROGRESS));

        // Assert
        expect(status).not.toBeNull();
        expect(status!.symbol).toEqual(symbol);
        expect(status!.name).toEqual(name);
        expect(status!.nextStatusSymbol).toEqual(next);
        expect(status!.type).toEqual(StatusType.IN_PROGRESS);
        expect(status!.isCompleted()).toEqual(false);
    });

    it('should be complete when symbol is "x"', () => {
        // Arrange
        const symbol = 'x';
        const name = 'Done';
        const next = ' ';

        // Act
        const status = new Status(new StatusConfiguration(symbol, name, next, false, StatusType.DONE));

        // Assert
        expect(status).not.toBeNull();
        expect(status!.symbol).toEqual(symbol);
        expect(status!.name).toEqual(name);
        expect(status!.nextStatusSymbol).toEqual(next);
        expect(status!.isCompleted()).toEqual(true);
    });

    it('should deduce type for unknown symbols', () => {
        expect(Status.getTypeForUnknownSymbol(' ')).toEqual(StatusType.TODO);
        expect(Status.getTypeForUnknownSymbol('!')).toEqual(StatusType.TODO); // Unknown character treated as TODO
        expect(Status.getTypeForUnknownSymbol('x')).toEqual(StatusType.DONE);
        expect(Status.getTypeForUnknownSymbol('X')).toEqual(StatusType.DONE);
        expect(Status.getTypeForUnknownSymbol('/')).toEqual(StatusType.IN_PROGRESS);
        expect(Status.getTypeForUnknownSymbol('-')).toEqual(StatusType.CANCELLED);
        expect(Status.getTypeForUnknownSymbol('')).toEqual(StatusType.EMPTY);
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
        const symbol = '/';

        // Act
        const status = Status.createUnknownStatus(symbol);

        // Assert
        expect(status).not.toBeNull();
        expect(status!.symbol).toEqual(symbol);
        expect(status!.name).toEqual('Unknown');
        expect(status!.nextStatusSymbol).toEqual('x');
        // Even though the type *could* be deduced as IN_PROGRESS, createUnknownStatus() is used when
        // the user has not defined the meaning of a status symbol, so treat everything as TODO.
        expect(status!.type).toEqual(StatusType.TODO);
        expect(status!.isCompleted()).toEqual(false);
    });

    it('should construct a Status from a core imported value', () => {
        const imported: StatusCollectionEntry = ['/', 'in progress', 'x', 'IN_PROGRESS'];
        const status = Status.createFromImportedValue(imported);
        expect(status.symbol).toEqual('/');
        expect(status.name).toEqual('in progress');
        expect(status.nextStatusSymbol).toEqual('x');
        expect(status.type).toEqual(StatusType.IN_PROGRESS); // should deduce IN_PROGRESS from symbol '/'
        expect(status.availableAsCommand).toEqual(false);
    });

    it('should construct a Status from a custom imported value', () => {
        const imported: StatusCollectionEntry = ['P', 'Pro', 'C', 'NON_TASK'];
        const status = Status.createFromImportedValue(imported);
        expect(status.symbol).toEqual('P');
        expect(status.name).toEqual('Pro');
        expect(status.nextStatusSymbol).toEqual('C');
        expect(status.type).toEqual(StatusType.NON_TASK);
        expect(status.availableAsCommand).toEqual(false);
    });

    it('should provide text with sorting comments for convenience of custom grouping', () => {
        const status = Status.makeCancelled();
        expect(status.typeGroupText).toEqual('%%4%%CANCELLED');
    });
});

describe('identicalTo', () => {
    const symbol = 'P';
    const name = 'Pro';
    const nextStatusSymbol = 'C';
    const availableAsCommand = true;
    const type = StatusType.TODO;

    it('should detect identical objects', () => {
        const lhs = new Status(new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type));
        const rhs = new Status(new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type));
        expect(lhs.identicalTo(rhs)).toEqual(true);
    });

    it('should check symbol', () => {
        const lhs = new Status(new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type));
        const rhs = new Status(new StatusConfiguration('Q', name, nextStatusSymbol, availableAsCommand, type));
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check name', () => {
        const lhs = new Status(new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type));
        const rhs = new Status(new StatusConfiguration(symbol, 'Con', nextStatusSymbol, availableAsCommand, type));
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check nextStatusSymbol', () => {
        const lhs = new Status(new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type));
        const rhs = new Status(new StatusConfiguration(symbol, name, ' ', availableAsCommand, type));
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check availableAsCommand', () => {
        const lhs = new Status(new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type));
        const rhs = new Status(new StatusConfiguration(symbol, name, nextStatusSymbol, false, type));
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check type', () => {
        const lhs = new Status(
            new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, StatusType.CANCELLED),
        );
        const rhs = new Status(new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type));
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });
});
