import { StatusSettings } from './Config/StatusSettings';
import { MarkdownTable } from './lib/MarkdownTable';
import type { StatusConfiguration } from './StatusConfiguration';
import { getPrintableSymbol } from './StatusRegistryReport';
import { Status } from './Status';

function getProblemsForStatus(status: StatusConfiguration) {
    const problems: string[] = [];
    if (status.symbol === Status.EMPTY.symbol) {
        problems.push('Empty symbol: this status will be ignored');
    }

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
    for (const status of statuses) {
        table.addRow([
            getPrintableSymbol(status.symbol),
            getPrintableSymbol(status.nextStatusSymbol),
            status.name,
            getPrintableSymbol(status.type),
            getProblemsForStatus(status).join('<br>'),
        ]);
    }
    return table.markdown;
}
