import { StatusSettings } from './Config/StatusSettings';
import { MarkdownTable } from './lib/MarkdownTable';
import type { StatusConfiguration } from './StatusConfiguration';
import { getPrintableSymbol } from './StatusRegistryReport';
import { Status } from './Status';
import { StatusType } from './StatusConfiguration';

function getFirstIndex(statusConfigurations: StatusConfiguration[], wantedSymbol: string) {
    return statusConfigurations.findIndex((s) => s.symbol === wantedSymbol);
}

function checkIfConventionalType(status: StatusConfiguration, problems: string[]) {
    // Check if conventional type is being used:
    const conventionalType = Status.getTypeForUnknownSymbol(status.symbol);
    if (status.type === conventionalType) {
        return;
    }

    if (conventionalType === StatusType.TODO && status.symbol !== ' ') {
        // This was likely a default TODO - ignore it.
        return;
    }

    problems.push(
        `For information, the conventional type for status symbol ${getPrintableSymbol(
            status.symbol,
        )} is ${getPrintableSymbol(conventionalType)}: you may wish to review this type.`,
    );
}

function checkNextStatusSymbol(statuses: StatusConfiguration[], status: StatusConfiguration, problems: string[]) {
    // Check if next symbol is known
    const indexOfNextSymbol = getFirstIndex(statuses, status.nextStatusSymbol);
    if (indexOfNextSymbol === -1) {
        problems.push(
            `Next symbol ${getPrintableSymbol(
                status.nextStatusSymbol,
            )} is unknown: create a status with symbol ${getPrintableSymbol(status.nextStatusSymbol)}.`,
        );
        return;
    }

    if (status.type !== StatusType.DONE) {
        return;
    }

    // This type is DONE: check that next status type is TODO or IN_PROGRESS.
    // See issues #2089 and #2304.
    const nextStatus = statuses[indexOfNextSymbol];
    if (nextStatus) {
        if (nextStatus.type !== 'TODO' && nextStatus.type !== 'IN_PROGRESS') {
            const helpURL =
                'https://publish.obsidian.md/tasks/Getting+Started/Statuses/Recurring+Tasks+and+Custom+Statuses';
            problems.push(
                `This \`DONE\` status is followed by ${getPrintableSymbol(
                    nextStatus.type,
                )}, not \`TODO\` or \`IN_PROGRESS\`: this will not work well for recurring tasks. See [Recurring Tasks and Custom Statuses](${helpURL}).`,
            );
        }
    } else {
        problems.push('Unexpected failure to find the next status.');
    }
}

function getProblemsForStatus(statuses: StatusConfiguration[], status: StatusConfiguration, index: number) {
    const problems: string[] = [];
    if (status.symbol === Status.EMPTY.symbol) {
        problems.push('Empty symbol: this status will be ignored.');
        return problems;
    }

    const firstIndex = getFirstIndex(statuses, status.symbol);
    if (firstIndex != index) {
        problems.push(`Duplicate symbol '${getPrintableSymbol(status.symbol)}': this status will be ignored.`);
        return problems;
    }

    checkIfConventionalType(status, problems);
    checkNextStatusSymbol(statuses, status, problems);
    return problems;
}

export function tabulateStatusSettings(statusSettings: StatusSettings) {
    // Note: There is very similar code in verifyStatusesAsMarkdownTable() in DocsSamplesForStatuses.test.ts.
    //       Maybe try unifying the common code one day?

    const table = new MarkdownTable([
        'Status Symbol',
        'Next Status Symbol',
        'Status Name',
        'Status Type',
        'Problems (if any)',
    ]);

    const statuses: StatusConfiguration[] = StatusSettings.allStatuses(statusSettings);
    statuses.forEach((status, index) => {
        table.addRow([
            getPrintableSymbol(status.symbol),
            getPrintableSymbol(status.nextStatusSymbol),
            status.name,
            getPrintableSymbol(status.type),
            getProblemsForStatus(statuses, status, index).join('<br>'),
        ]);
    });
    return table.markdown;
}
