import { StatusSettings } from './Config/StatusSettings';
import { MarkdownTable } from './lib/MarkdownTable';
import type { StatusConfiguration } from './StatusConfiguration';
import { getPrintableSymbol } from './StatusRegistryReport';

export function tabulateStatusSettings(statusSettings: StatusSettings) {
    // Note: There is very similar code in verifyStatusesAsMarkdownTable() in DocsSamplesForStatuses.test.ts.
    //       Maybe try unifying the common code one day?

    const table = new MarkdownTable(['Status Symbol', 'Next Status Symbol', 'Status Name', 'Status Type']);

    const statuses: StatusConfiguration[] = StatusSettings.allStatuses(statusSettings);
    for (const status of statuses) {
        table.addRow([
            getPrintableSymbol(status.symbol),
            getPrintableSymbol(status.nextStatusSymbol),
            status.name,
            getPrintableSymbol(status.type),
        ]);
    }
    return table.markdown;
}
