import { continue_lines, scan } from '../src/Query/Scanner';

describe('continue_lines', () => {
    it('keeps non-continued text the same', () => {
        const text = 'not done\ndue this week';
        expect(continue_lines(text)).toEqual(text);
    });
    it('removes backslashed newlines', () => {
        const text = 'line1 \\\ncontinued';
        expect(continue_lines(text)).toEqual('line1 continued');
    });
    it('collapses escaped final backslashes', () => {
        const text = 'line1 \\\\\nline2';
        expect(continue_lines(text)).toEqual('line1 \\\nline2');
    });
    it('preserves non-final backslashes', () => {
        const text = 'line\\1 \\\ncontinued \\\\\\\nline2';
        expect(continue_lines(text)).toEqual('line\\1 continued \\\\\nline2');
    });
});

describe('scan', () => {
    it('works on an easy case', () => {
        const text = 'not done\ndue this week';
        expect(scan(text)).toEqual(['not done', 'due this week']);
    });
    it('strips whitespace', () => {
        const text = ' not done   \ndue this week\n\n\n';
        expect(scan(text)).toEqual(['not done', 'due this week']);
    });
    it('supports line continuation', () => {
        const text = '( property1 ) AND \\\n (property2)';
        expect(scan(text)).toEqual(['( property1 ) AND  (property2)']);
    });
    it('drops empty lines', () => {
        const text = 'line1    \n line2 \n\n\n line3\n\n';
        expect(scan(text)).toEqual(['line1', 'line2', 'line3']);
    });
});
