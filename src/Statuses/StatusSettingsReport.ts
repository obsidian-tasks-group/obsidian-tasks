import { StatusSettings } from '../Config/StatusSettings';
import { MarkdownTable } from '../lib/MarkdownTable';
import { i18n } from '../i18n/i18n';
import { GlobalFilter } from '../Config/GlobalFilter';
import { type StatusConfiguration, StatusType } from './StatusConfiguration';
import { Status } from './Status';
import { StatusRegistry } from './StatusRegistry';

function getFirstIndex(statusConfigurations: StatusConfiguration[], wantedSymbol: string) {
    return statusConfigurations.findIndex((s) => s.symbol === wantedSymbol);
}

export function getPrintableSymbol(symbol: string) {
    // Do not put backticks around an empty symbol, as the two backticks are rendered
    // by Obsidian as ordinary characters and the meaning is unclear.
    // Better to just display nothing in this situation.
    if (symbol === '') {
        return symbol;
    }
    const result = symbol !== ' ' ? symbol : 'space';
    return '`' + result + '`';
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

    const symbol = getPrintableSymbol(status.symbol);
    const type = getPrintableSymbol(conventionalType);
    problems.push(i18n.t('reports.statusRegistry.messages.notConventionalType', { symbol, type }));
}

function checkNextStatusSymbol(statuses: StatusConfiguration[], status: StatusConfiguration, problems: string[]) {
    // Check if next symbol is known
    const nextStatusSymbol = status.nextStatusSymbol;
    const indexOfNextSymbol = getFirstIndex(statuses, nextStatusSymbol);
    if (indexOfNextSymbol === -1) {
        const printableSymbol = getPrintableSymbol(nextStatusSymbol);
        problems.push(i18n.t('reports.statusRegistry.messages.nextSymbolUnknown', { symbol: printableSymbol }));
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
            const nextType = getPrintableSymbol(nextStatus.type);
            const message = [
                i18n.t('reports.statusRegistry.messages.wrongTypeAfterDone.line1', { nextType }),
                i18n.t('reports.statusRegistry.messages.wrongTypeAfterDone.line2'),
                i18n.t('reports.statusRegistry.messages.wrongTypeAfterDone.line3', { helpURL }),
            ].join('<br>');
            problems.push(message);
        }
    } else {
        problems.push(i18n.t('reports.statusRegistry.messages.cannotFindNextStatus'));
    }
}

function getProblemsForStatus(statuses: StatusConfiguration[], status: StatusConfiguration, index: number) {
    const problems: string[] = [];
    if (status.symbol === Status.EMPTY.symbol) {
        problems.push(i18n.t('reports.statusRegistry.messages.emptySymbol'));
        return problems;
    }

    const firstIndex = getFirstIndex(statuses, status.symbol);
    if (firstIndex != index) {
        const symbol = getPrintableSymbol(status.symbol);
        problems.push(i18n.t('reports.statusRegistry.messages.duplicateSymbol', { symbol: symbol }));
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
        i18n.t('reports.statusRegistry.columnHeadings.statusSymbol'),
        i18n.t('reports.statusRegistry.columnHeadings.nextStatusSymbol'),
        i18n.t('reports.statusRegistry.columnHeadings.statusName'),
        i18n.t('reports.statusRegistry.columnHeadings.statusType'),
        i18n.t('reports.statusRegistry.columnHeadings.problems'),
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

/**
 * Generates a list of Markdown lines, containing sample tasks based on the given status settings.
 *
 * @param {StatusSettings} statusSettings - The settings object containing custom and core statuses.
 *
 * @returns {string[]} An array of markdown strings representing sample tasks.
 * Each task includes a symbol, an introductory text, and the name of the status.
 * Only the actually registered symbols are used; duplicate and empty symbols are ignored.
 * The Global Filter will be added, if it is non-empty.
 */
export function sampleTaskLinesForValidStatuses(statusSettings: StatusSettings) {
    const statusRegistry = new StatusRegistry();
    StatusSettings.applyToStatusRegistry(statusSettings, statusRegistry);
    const registeredStatuses: StatusConfiguration[] = statusRegistry.registeredStatuses;

    return registeredStatuses.map((status, index) => {
        const globalFilter = GlobalFilter.getInstance();
        const globalFilterIfSet = globalFilter.isEmpty() ? '' : globalFilter.get() + ' ';
        const intro = `Sample task ${index + 1}`;
        const symbol = `status symbol=${getPrintableSymbol(status.symbol)}`;
        const name = `status name='${status.name}'`;
        return `- [${status.symbol}] ${globalFilterIfSet}${intro}: ${symbol} ${name}`;
    });
}
