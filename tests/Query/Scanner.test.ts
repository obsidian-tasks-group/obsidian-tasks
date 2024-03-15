import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import { continueLines, continueLinesFlattened, scan } from '../../src/Query/Scanner';

// There is no way to have a literal \ at the end of a raw string.
// In such cases, we use substitution instead.
// Context: https://stackoverflow.com/questions/42604680/string-raw-when-last-character-is
const bs = '\\';

const querySource = [
    '',
    'description includes 1 hello world    ',
    '',
    'description includes 2 hello   \\',
    '   world   ',
    '',
    'description includes 3 hello \\',
    'world',
    '',
    'description includes 4 hello    \\',
    'world',
    '',
    'description includes 5 hello    \\\\',
    'description includes 6 world',
    '',
    'description includes 7 hello world\\',
    '',
    'description includes 8 hello world\\\\',
    '',
    'description includes 9 hello world\\',
    'description includes 10 hello world\\\\',
    '',
    'description includes 11 hello world\\\\',
    'description includes 12 hello world',
    '',
    'description includes 13 hello world\\\\',
    'description includes 14 hello world\\\\',
    '',
    'description includes 15 hello world\\',
    '',
    'description includes 16 hello world \\ ',
    'description includes 17 hello world \\\\ ',
    '',
    '  description includes 17 hello world  ',
    '',
].join('\n');

describe('continue_lines', () => {
    it('keeps non-continued text the same', () => {
        const text = [
            // force linebreak
            'not done',
            'due this week',
        ].join('\n');
        expect(continueLinesFlattened(text)).toEqual(text);
    });

    it('removes backslashed newlines', () => {
        const text = [
            // force linebreak
            String.raw`line1 ${bs}`,
            'continued',
        ].join('\n');
        expect(continueLinesFlattened(text)).toEqual('line1 continued');
    });

    it('only consumes one backslash', () => {
        const text = [
            // force linebreak
            String.raw`line1 ${bs}${bs}`,
            '',
            'line2',
        ].join('\n');
        expect(continueLinesFlattened(text)).toEqual(
            [
                // force linebreak
                String.raw`line1 ${bs}`,
                'line2',
            ].join('\n'),
        );
    });

    it('preserves non-final backslashes', () => {
        const text = [
            // force linebreak
            String.raw`line\1 ${bs}`,
            `continued ${bs}${bs}${bs}`,
            'line2',
        ].join('\n');
        expect(continueLinesFlattened(text)).toEqual(
            [
                // force linebreak
                String.raw`line\1 continued \\`,
                'line2',
            ].join('\n'),
        );
    });

    it('ignores interleaved continuations', () => {
        const text = [
            // force linebreak
            String.raw`line1${bs}${bs}`,
            'line2',
        ].join('\n');
        expect(continueLinesFlattened(text)).toEqual(
            [
                // force linebreak
                String.raw`line1${bs}`,
                'line2',
            ].join('\n'),
        );
    });

    it('compresses surrounding spaces', () => {
        const text = [
            // force linebreak
            String.raw`line1    ${bs}`,
            'continued',
        ].join('\n');
        expect(continueLinesFlattened(text)).toEqual(String.raw`line1 continued`);
    });

    it('compresses surrounding tabs', () => {
        const text = [
            // force linebreak
            'line1\t\\',
            '\t\tcontinued\\',
            '',
            'line2',
        ].join('\n');
        expect(continueLinesFlattened(text)).toEqual(
            [
                // force linebreak
                'line1 continued',
                'line2',
            ].join('\n'),
        );
    });

    it('should combine together over multiple lines', () => {
        const text = [
            // force line break
            'description includes \\',
            '   one \\',
            '   two \\',
            '   three \\',
            '   four \\',
            '   five \\',
            '   six',
        ].join('\n');
        expect(continueLinesFlattened(text)).toEqual('description includes one two three four five six');
    });

    it('visualise continue_lines', () => {
        const output = `
input:
-------------------------------------
${querySource}
-------------------------------------

result after calling continueLines():
-------------------------------------
${continueLines(querySource)
    .map(
        (statement) => `
"${statement.rawInstruction}"
=>
"${statement.anyContinuationLinesRemoved}"
=>
"${statement.anyPlaceholdersExpanded}"`,
    )
    .join('\n')}
-------------------------------------
`;
        verify(output);
    });
});

describe('scan', () => {
    it('works on an easy case', () => {
        const text = [
            // force line break
            'not done',
            'due this week',
        ].join('\n');
        expect(scan(text)).toEqual(['not done', 'due this week']);
    });

    it('strips whitespace', () => {
        const text = [
            // force line break
            ' not done   ',
            '        due this week',
        ].join('\n');
        expect(scan(text)).toEqual(['not done', 'due this week']);
    });

    it('supports line continuation', () => {
        const text = [
            // force line break
            String.raw`( property1 ) AND ${bs}`,
            ' (property2)',
        ].join('\n');
        expect(scan(text)).toEqual(['( property1 ) AND (property2)']);
    });

    it('drops empty lines', () => {
        const text = [
            // force line break
            'line1    ',
            ' line2 ',
            '',
            ' ',
            '  line3',
            '  ',
            '  ',
        ].join('\n');
        expect(scan(text)).toEqual(['line1', 'line2', 'line3']);
    });

    it('visualise scanning', () => {
        const output = `
input:
-------------------------------------
${querySource}
-------------------------------------

result after removing continuation characters:
-------------------------------------
${scan(querySource).join('\n')}
-------------------------------------
`;
        verify(output);
    });
});
