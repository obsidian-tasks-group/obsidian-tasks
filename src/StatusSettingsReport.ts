import { StatusSettings } from './Config/StatusSettings';
import { MarkdownTable } from './lib/MarkdownTable';
import type { StatusConfiguration } from './StatusConfiguration';
import { getPrintableSymbol } from './StatusRegistryReport';
import { Status } from './Status';

function getFirstIndex(statusConfigurations: StatusConfiguration[], wantedSymbol: string) {
    return statusConfigurations.findIndex((s) => s.symbol === wantedSymbol);
}

function checkNextStatusSymbol(statuses: StatusConfiguration[], status: StatusConfiguration, problems: string[]) {
    // Check if next symbol is known
    const indexOfNextSymbol = getFirstIndex(statuses, status.nextStatusSymbol);
    if (indexOfNextSymbol === -1) {
        problems.push(
            `Next symbol ${status.nextStatusSymbol} is unknown: create a status with symbol ${status.nextStatusSymbol}.`,
        );
    }
}

function getProblemsForStatus(statuses: StatusConfiguration[], status: StatusConfiguration, index: number) {
    const problems: string[] = [];
    if (status.symbol === Status.EMPTY.symbol) {
        problems.push('Empty symbol: this status will be ignored');
        return problems;
    }

    const firstIndex = getFirstIndex(statuses, status.symbol);
    if (firstIndex != index) {
        problems.push(`Duplicate symbol '${status.symbol}': this status will be ignored`);
        return problems;
    }

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
