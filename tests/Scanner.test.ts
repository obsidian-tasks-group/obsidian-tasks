import { continue_lines, scan } from '../src/Query/Scanner';

// There is no way to have a literal \ at the end of a raw string.
// In such cases, we use substitution instead.
// Context: https://stackoverflow.com/questions/42604680/string-raw-when-last-character-is
const bs = '\\';

describe('continue_lines', () => {
    it('keeps non-continued text the same', () => {
        const text = [
            // force linebreak
            'not done',
            'due this week',
        ].join('\n');
        expect(continue_lines(text)).toEqual(text);
    });

    it('removes backslashed newlines', () => {
        const text = [
            // force linebreak
            String.raw`line1 ${bs}`,
            'continued',
        ].join('\n');
        expect(continue_lines(text)).toEqual('line1 continued');
    });

    it('only consumes one backslash', () => {
        const text = [
            // force linebreak
            String.raw`line1 ${bs}${bs}`,
            '',
            'line2',
        ].join('\n');
        expect(continue_lines(text)).toEqual(
            [
                // force linebreak
                String.raw`line1 \ `,
                'line2',
            ].join('\n'),
        );
    });

    it('preserves non-final backslashes', () => {
        const text = [
            // force linebreak
            String.raw`line\1 ${bs}`,
            `continued ${bs}${bs}${bs}`,
            '',
            'line2',
        ].join('\n');
        expect(continue_lines(text)).toEqual(
            [
                // force linebreak
                String.raw`line\1 continued \\ `,
                'line2',
            ].join('\n'),
        );
    });

    it('ignores interleaved continuations', () => {
        const text = [
            // force linebreak
            String.raw`line1${bs}${bs}`,
            '',
            'line2',
        ].join('\n');
        expect(continue_lines(text)).toEqual(
            [
                // force linebreak
                String.raw`line1\ `,
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
        expect(continue_lines(text)).toEqual(String.raw`line1 continued`);
    });

    it('compresses surrounding tabs', () => {
        const text = `line1\t\\
\t\tcontinued\\

line2`;
        expect(continue_lines(text)).toEqual(
            [
                // force linebreak
                'line1 continued ',
                'line2',
            ].join('\n'),
        );
    });
});

describe('scan', () => {
    it('works on an easy case', () => {
        const text = [
            String.raw`not done
due this week`,
        ].join('\n');
        expect(scan(text)).toEqual(['not done', 'due this week']);
    });

    it('strips whitespace', () => {
        const text = [
            // force line break
            ' not done   ',
            '        due this week',
            '',
            '        ',
            '        ',
        ].join('\n');
        expect(scan(text)).toEqual(['not done', 'due this week']);
    });

    it('supports line continuation', () => {
        const text = [
            String.raw`( property1 ) AND \
 (property2)`,
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
});
