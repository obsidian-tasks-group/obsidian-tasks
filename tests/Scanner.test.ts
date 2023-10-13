/* Note: some tests are sensitive to whitespace changes. Ensure your editor preserves
 * trailing whitespace.
 */
import { continue_lines, scan } from '../src/Query/Scanner';

describe('continue_lines', () => {
    it('keeps non-continued text the same', () => {
        const text = String.raw`not done
due this week`;
        expect(continue_lines(text)).toEqual(text);
    });
    it('removes backslashed newlines', () => {
        const text = String.raw`line1 \
continued`;
        expect(continue_lines(text)).toEqual('line1 continued');
    });
    it('only consumes one backslash', () => {
        const text = String.raw`line1 \\

line2`;
        expect(continue_lines(text)).toEqual(String.raw`line1 \ 
line2`);
    });
    it('preserves non-final backslashes', () => {
        const text = String.raw`line\1 \
continued \\\

line2`;
        expect(continue_lines(text)).toEqual(String.raw`line\1 continued \\ 
line2`);
    });
    it('ignores interleaved continuations', () => {
        const text = String.raw`line1\\

line2`;
        expect(continue_lines(text)).toEqual(String.raw`line1\ 
line2`);
    });
    it('compresses surrounding spaces', () => {
        const text = String.raw`line1    \
            continued`;
        expect(continue_lines(text)).toEqual(String.raw`line1 continued`);
    });
    it('compresses surrounding tabs', () => {
        const text = `line1\t\\
\t\tcontinued\\

line2`;
        expect(continue_lines(text)).toEqual(String.raw`line1 continued 
line2`);
    });
});

describe('scan', () => {
    it('works on an easy case', () => {
        const text = String.raw`not done
due this week`;
        expect(scan(text)).toEqual(['not done', 'due this week']);
    });
    it('strips whitespace', () => {
        const text = String.raw` not done   
        due this week

        
        `;
        expect(scan(text)).toEqual(['not done', 'due this week']);
    });
    it('supports line continuation', () => {
        const text = String.raw`( property1 ) AND \
 (property2)`;
        expect(scan(text)).toEqual(['( property1 ) AND (property2)']);
    });
    it('drops empty lines', () => {
        const text = String.raw`line1    
 line2 

 
  line3
  
  `;
        expect(scan(text)).toEqual(['line1', 'line2', 'line3']);
    });
});
