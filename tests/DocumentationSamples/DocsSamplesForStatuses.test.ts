import { Status } from '../../src/Status';
import { StatusConfiguration, StatusType } from '../../src/StatusConfiguration';
import type { StatusCollection, StatusCollectionEntry } from '../../src/StatusCollection';
import * as Themes from '../../src/Config/Themes';
import { StatusValidator } from '../../src/StatusValidator';
import {
    verifyStatusesAsDetailedMermaidDiagram,
    verifyStatusesAsTasksList,
    verifyStatusesAsTasksText,
    verifyStatusesInMultipleFormats,
    verifyTransitionsAsMarkdownTable,
} from '../TestingTools/VerifyStatuses';
import {
    doneTogglesToCancelled,
    doneTogglesToCancelledWithUnconventionalSymbols,
    importantCycle,
    proCon,
    todoToInProgressToDone,
    variousNonTaskStatuses,
} from '../TestingTools/StatusExamples';

function constructStatuses(importedStatuses: StatusCollection) {
    const statuses: Status[] = [];
    importedStatuses.forEach((importedStatus) => {
        statuses.push(Status.createFromImportedValue(importedStatus));
    });
    return statuses;
}

describe('DefaultStatuses', () => {
    // These "test" write out a markdown representation of the default task statuses,
    // for embedding in the user docs.
    it('core-statuses', () => {
        verifyStatusesInMultipleFormats([Status.makeTodo(), Status.makeDone()], true);
    });

    it('custom-statuses', () => {
        verifyStatusesInMultipleFormats([Status.makeInProgress(), Status.makeCancelled()], true);
    });

    it('important-cycle', () => {
        const statuses = importantCycle();
        verifyStatusesInMultipleFormats(constructStatuses(statuses), false);
    });

    it('todo-in_progress-done', () => {
        const statuses = todoToInProgressToDone();
        verifyStatusesInMultipleFormats(constructStatuses(statuses), false);
        verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
    });

    it('pro-con-cycle', () => {
        const statuses = proCon();
        verifyStatusesInMultipleFormats(constructStatuses(statuses), false);
        verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
    });

    it('toggle-does-nothing', () => {
        const statuses = variousNonTaskStatuses();
        verifyStatusesInMultipleFormats(constructStatuses(statuses), false);
    });

    it('done-toggles-to-cancelled', () => {
        // See issue #2089.
        // DONE is followed by CANCELLED, which currently causes unexpected behaviour in recurrent tasks.
        // This uses the 4 default statuses, and just customises their order.
        const statuses = doneTogglesToCancelled();
        verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
    });

    it('done-toggles-to-cancelled-with-unconventional-symbols', () => {
        // See issue #2304.
        // DONE is followed by CANCELLED, which currently causes unexpected behaviour in recurrent tasks.
        // This doesn't follow the standard convention of 'x' means DONE. It has 'x' means CANCELLED.
        const statuses = doneTogglesToCancelledWithUnconventionalSymbols();
        verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
    });
});

describe('Theme', () => {
    type NamedTheme = [string, StatusCollection];
    const themes: NamedTheme[] = [
        // Alphabetical order by name:
        ['AnuPpuccin', Themes.anuppuccinSupportedStatuses()],
        ['Aura', Themes.auraSupportedStatuses()],
        ['Ebullientworks', Themes.ebullientworksSupportedStatuses()],
        ['ITS', Themes.itsSupportedStatuses()],
        ['LYT Mode', Themes.lytModeSupportedStatuses()],
        ['Minimal', Themes.minimalSupportedStatuses()],
        ['Things', Themes.thingsSupportedStatuses()],
    ];

    describe.each(themes)('%s', (_: string, statuses: StatusCollection) => {
        it.each(statuses)('Validate status: "%s", "%s", "%s", "%s"', (symbol, name, nextSymbol, type) => {
            const statusValidator = new StatusValidator();
            const entry: StatusCollectionEntry = [symbol, name, nextSymbol, type];
            expect(statusValidator.validateStatusCollectionEntry(entry)).toEqual([]);
        });

        it('Table', () => {
            verifyStatusesInMultipleFormats(constructStatuses(statuses), true);
        });

        it('Tasks', () => {
            verifyStatusesAsTasksList(constructStatuses(statuses));
        });

        it('Text', () => {
            verifyStatusesAsTasksText(constructStatuses(statuses));
        });
    });
});

describe('Status Transitions', () => {
    it('status-types', () => {
        const statuses = [
            Status.makeTodo(),
            Status.makeInProgress(),
            Status.makeDone(),
            Status.makeCancelled(),
            new Status(new StatusConfiguration('~', 'My custom status', ' ', false, StatusType.NON_TASK)),
        ];
        verifyTransitionsAsMarkdownTable(statuses);
    });
});
