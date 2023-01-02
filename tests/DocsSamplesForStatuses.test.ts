import { Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

import { StatusRegistry } from '../src/StatusRegistry';

function getPrintableIndicator(indicator: string) {
    const result = indicator !== ' ' ? indicator : 'space';
    return '`' + result + '`';
}

describe('DefaultStatuses', () => {
    it('markdown-table', () => {
        const instance = StatusRegistry.getInstance();
        let commandsTable = '';
        commandsTable += '| Status Character    | Status Name | Next Status Character |\n';
        commandsTable += '| ------------------- | ----------- | --------------------- |\n';
        for (const status of instance.registeredStatuses) {
            const statusCharacter = getPrintableIndicator(status.indicator);
            const nextStatusCharacter = getPrintableIndicator(status.nextStatusIndicator);
            commandsTable += `| ${statusCharacter} | ${status.name} | ${nextStatusCharacter} |\n`;
        }
        let options = new Options();
        options = options.forFile().withFileExtention('md');
        verify(commandsTable, options);
    });
});
