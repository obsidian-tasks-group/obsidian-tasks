import { MarkdownTable } from '../../../src/lib/MarkdownTable';
import { defaultPresets } from '../../../src/Query/Presets/Presets';
import { addBackticks } from '../../Scripting/ScriptingTestHelpers';
import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdown';

function verifyPresetsMarkdownTable(entries: [string, string][]) {
    const table = new MarkdownTable(['Name', 'Instruction(s)']);
    for (const [key, value] of entries) {
        table.addRow([
            addBackticks(key),
            value
                .split('\n')
                .map((line) => addBackticks(line))
                .join('<br>'),
        ]);
    }
    verifyMarkdownForDocs(table.markdown);
}

it('default-presets', () => {
    verifyPresetsMarkdownTable(Object.entries(defaultPresets));
});
