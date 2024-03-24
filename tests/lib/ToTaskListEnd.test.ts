describe('ToTasklistEnd', () => {
    //     it('should insert line at end of list when list followed by blank line', () => {
    //         const initialContentNoNewLine = '';
    //         const expectedContent = '';
    //         const targetListHeading = '## MY TASK LIST';
    //         const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
    //         const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
    //         expect(newFile).toEqual(expectedContent);
    //     });
    //     it('should insert line at end of list when list followed by regular text', () => {
    //         const initialContentNoNewLine = '';
    //         const expectedContent = '';
    //         const targetListHeading = '## MY TASK LIST';
    //         const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
    //         const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
    //         expect(newFile).toEqual(expectedContent);
    //     });
    //     it('should insert line at end of list when list followed by a markdown heading', () => {
    //         const initialContentNoNewLine = '';
    //         const expectedContent = '';
    //         const targetListHeading = '## MY TASK LIST';
    //         const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
    //         const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
    //         expect(newFile).toEqual(expectedContent);
    //     });
    //     it('should insert line at end of list when end of list is last line in note file', () => {
    //         const initialContentNoNewLine = '';
    //         const expectedContent = '';
    //         const targetListHeading = '## MY TASK LIST';
    //         const textToAppend = '- [-] A COMPLETED TASK TO INSERT AT END OF NAMED LIST';
    //         const newFile = toTasklistEnd(initialContentNoNewLine, targetListHeading, textToAppend);
    //         expect(newFile).toEqual(expectedContent);
    //     });
    it('placeholder to allow initial Commit of this file', () => {
        expect(1).toEqual(1);
    });
});
//
// function toTasklistEnd(initialContent: string, targetListHeading: string, textToAppend: string) {
//     console.log(initialContent, targetListHeading, textToAppend);
//     return false;
// }

// const NOT_TASK_REGEX = '/^(?! *(- [)).*$/dm';
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
