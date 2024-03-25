describe('ToTasklistEnd', () => {
    it('should insert line at end of list when list followed by blank line', () => {
        const initialContentNoNewLine = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
- [ ] An incomplete task

Final line in note file.`;
        const expectedContent = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
- [ ] An incomplete task
- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST

Final line in note file.`;
        const targetListHeading = '## MY TASK LIST';
        const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
        const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
        expect(newFile).toEqual(expectedContent);
    });

    it('should insert line at end of list when list followed by regular text', () => {
        const initialContentNoNewLine = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
- [ ] An incomplete task
A line of regular text.`;
        const expectedContent = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
- [ ] An incomplete task
- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST
A line of regular text.`;
        const targetListHeading = '## MY TASK LIST';
        const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
        const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
        expect(newFile).toEqual(expectedContent);
    });

    it('should insert line at end of list when list followed by a markdown heading', () => {
        const initialContentNoNewLine = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
- [ ] An incomplete task
## Another list heading`;
        const expectedContent = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
- [ ] An incomplete task
- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST
## Another list heading`;
        const targetListHeading = '## MY TASK LIST';
        const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
        const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
        expect(newFile).toEqual(expectedContent);
    });

    it('should insert line at end of list when end of list is last line in note file', () => {
        const initialContentNoNewLine = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
- [ ] An incomplete task`;
        const expectedContent = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
- [ ] An incomplete task
- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST`;
        const targetListHeading = '## MY TASK LIST';
        const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
        const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
        expect(newFile).toEqual(expectedContent);
    });

    it('should recognize indented tasks as part of list', () => {
        const initialContentNoNewLine = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
    - [ ] An INDENTED incomplete task`;
        const expectedContent = `Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## MY TASK LIST
    - [ ] An INDENTED incomplete task
- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST`;
        const targetListHeading = '## MY TASK LIST';
        const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
        const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
        expect(newFile).toEqual(expectedContent);
    });
});

const NEWLINE = '\n';
// const NOT_TASK_REGEX = new RegExp('^(?! *(- [)).*$');
const TASK_REGEX = new RegExp('^( *(- [.])).*');
function toTasklistEnd(initialContent: string, targetListHeading: string, textToAppend: string) {
    const linesArray = initialContent.split('\n');
    const headingLineNumber = linesArray.indexOf(targetListHeading);
    let thisLine = '';
    let insertionLine = headingLineNumber + 1;
    for (thisLine in linesArray.slice(insertionLine)) {
        if (thisLine.search(TASK_REGEX) > -1) {
            insertionLine += 1;
        } else break;
    }
    if (insertionLine > linesArray.length) {
        insertionLine = -1;
    }
    linesArray[insertionLine] += NEWLINE + textToAppend;
    return linesArray.join(NEWLINE);
}

//
// // source of following code:  https://gist.github.com/reporter123/187a412821f829e1a818fd3bf2996cba
// //install helper function not found in javascript
// /** * Regular Expression IndexOf for Arrays
//  * This little addition to the Array prototype will iterate over array
//  * and return the index of the first element which matches the provided
//  * regular expression.
//  * Note: This will not match on objects.
//  * @param  {RegEx}   rx The regular expression to test with. E.g. /-ba/gim
//  * @return {Numeric} -1 means not found */
// if (typeof Array.prototype.reIndexOf === 'undefined') {
//     Array.prototype.reIndexOf = function (rx) {
//         for (const i in this) {
//             if (this[i].toString().match(rx)) {
//                 return i;
//             }
//         }
//         return -1;
//     };
// }
