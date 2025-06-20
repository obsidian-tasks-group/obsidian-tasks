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

it('daily-note-presets', () => {
    const dailyNotePresets = {
        daily_note_overdue:
            "# Tasks that should have been done before this day.\n# This preset requires a YYYY-MM-DD file name.\nnot done\nhappens before {{query.file.filenameWithoutExtension}}\ngroup by function task.happens.format('YYYY-MM')",
        daily_note_do_this_day:
            '# Tasks that should be done this day.\n# This preset requires a YYYY-MM-DD file name.\nnot done\nhappens {{query.file.filenameWithoutExtension}}',
        daily_note_done_this_day:
            '# Tasks that have been done this day.\n# This preset requires a YYYY-MM-DD file name.\ndone\ndone {{query.file.filenameWithoutExtension}}',
    };

    verifyPresetsMarkdownTable(Object.entries(dailyNotePresets));
});
