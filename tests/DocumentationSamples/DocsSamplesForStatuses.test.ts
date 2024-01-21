import { Status } from '../../src/Statuses/Status';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import type { StatusCollection, StatusCollectionEntry } from '../../src/Statuses/StatusCollection';
import * as Themes from '../../src/Config/Themes';
import { StatusValidator } from '../../src/Statuses/StatusValidator';
import * as VerifyStatuses from '../TestingTools/VerifyStatuses';
import * as StatusExamples from '../TestingTools/StatusExamples';
import { constructStatuses } from '../TestingTools/StatusesTestHelpers';

describe('DefaultStatuses', () => {
    // These "test" write out a markdown representation of the default task statuses,
    // for embedding in the user docs.
    it('core-statuses', () => {
        VerifyStatuses.verifyStatusesInMultipleFormats([Status.makeTodo(), Status.makeDone()], true);
    });

    it('custom-statuses', () => {
        VerifyStatuses.verifyStatusesInMultipleFormats([Status.makeInProgress(), Status.makeCancelled()], true);
    });

    it('important-cycle', () => {
        const statuses = StatusExamples.importantCycle();
        VerifyStatuses.verifyStatusesInMultipleFormats(constructStatuses(statuses), false);
    });

    it('todo-in_progress-done', () => {
        const statuses = StatusExamples.todoToInProgressToDone();
        VerifyStatuses.verifyStatusesInMultipleFormats(constructStatuses(statuses), false);
        VerifyStatuses.verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
    });

    it('pro-con-cycle', () => {
        const statuses = StatusExamples.proCon();
        VerifyStatuses.verifyStatusesInMultipleFormats(constructStatuses(statuses), false);
        VerifyStatuses.verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
    });

    it('toggle-does-nothing', () => {
        const statuses = StatusExamples.variousNonTaskStatuses();
        VerifyStatuses.verifyStatusesInMultipleFormats(constructStatuses(statuses), false);
    });

    it('done-toggles-to-cancelled', () => {
        // See issue #2089.
        // DONE is followed by CANCELLED, which currently causes unexpected behaviour in recurrent tasks.
        // This uses the 4 default statuses, and just customises their order.
        const statuses = StatusExamples.doneTogglesToCancelled();
        VerifyStatuses.verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
    });

    it('done-toggles-to-cancelled-with-unconventional-symbols', () => {
        // See issue #2304.
        // DONE is followed by CANCELLED, which currently causes unexpected behaviour in recurrent tasks.
        // This doesn't follow the standard convention of 'x' means DONE. It has 'x' means CANCELLED.
        const statuses = StatusExamples.doneTogglesToCancelledWithUnconventionalSymbols();
        VerifyStatuses.verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
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
            VerifyStatuses.verifyStatusesInMultipleFormats(constructStatuses(statuses), true);
        });

        it('Tasks', () => {
            VerifyStatuses.verifyStatusesAsTasksList(constructStatuses(statuses));
        });

        it('Text', () => {
            VerifyStatuses.verifyStatusesAsTasksText(constructStatuses(statuses));
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
        VerifyStatuses.verifyTransitionsAsMarkdownTable(statuses);
    });
});
