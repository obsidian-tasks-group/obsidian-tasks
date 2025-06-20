import { MarkdownTable } from '../../../src/lib/MarkdownTable';
import { defaultPresets } from '../../../src/Query/Presets/Presets';
import { addBackticks } from '../../Scripting/ScriptingTestHelpers';
import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdown';

it('default-presets', () => {
    const table = new MarkdownTable(['Name', 'Instruction(s)']);
    for (const [key, value] of Object.entries(defaultPresets)) {
        table.addRow([addBackticks(key), addBackticks(value)]);
    }
    verifyMarkdownForDocs(table.markdown);
});
