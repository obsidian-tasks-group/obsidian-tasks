import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import { errorMessageForException } from '../../../src/lib/ExceptionTools';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';
import { BooleanDelimiters } from '../../../src/Query/Filter/BooleanDelimiters';

export const inputs = `
(not done) AND (is recurring)
((not done)) AND ((is recurring))
(not done) OR (is recurring)
(not done) XOR (is recurring)
(not done) AND NOT (is recurring)
(not done) OR NOT (is recurring)
NOT (not done)

"not done" AND (is recurring)
"not done" OR (is recurring)
"not done" XOR (is recurring)
"not done" AND NOT (is recurring)
"not done" OR NOT (is recurring)

(not done) AND "is recurring"
((not done)) AND "is recurring"
(not done) OR "is recurring"
(not done) XOR "is recurring"
(not done) AND NOT "is recurring"
(not done) OR NOT "is recurring"

"HAS DUE DATE" OR (DESCRIPTION INCLUDES SPECIAL)
"description includes d1" AND "description includes d2"
"has due date" OR (description includes special)
( (description includes 1) AND (description includes 2) AND (description includes 3) ) OR ( (description includes 5) AND (description includes 6) AND (description includes 7) ) AND NOT (description includes 7)
( (description includes a) AND (description includes b) ) AND (description includes c)
( (description includes a) AND (description includes b) AND (description includes c) ) OR ( (description includes d) AND (description includes e) AND (description includes f) )
( (description includes a) OR (description includes b) ) OR (description includes c)
( (description includes a) OR (description includes b) OR (description includes c) ) AND ( (description includes d) OR (description includes e) OR (description includes f) )
( (filter by function task.description.includes('a')) OR (filter by function task.description.includes('b')) OR (filter by function task.description.includes('c')) ) AND ( (filter by function task.description.includes('d')) OR (filter by function task.description.includes('e')) OR (filter by function task.description.includes('f')) )
( description includes a )   AND ( (description includes b)  AND (description includes c) )
( description includes a )   OR  ( (description includes b)  OR  (description includes c) )
( description regex matches /(buy|order|voucher|lakeland|purchase|\\spresent)/i ) OR ( path includes Home/Shopping )
( description regex matches /buy/i ) AND ( path includes some/sample/note.md )
( filter by function ! 'NON_TASK,CANCELLED'.includes(task.status.type) ) OR ( filter by function const date = task.due.moment; return date ? !date.isValid() : false; ) OR ( filter by function task.due.moment?.isSameOrBefore(moment(), 'day') || false ) OR ( filter by function task.urgency.toFixed(2) === 1.95.toFixed(2) ) OR ( filter by function (!task.isRecurring) && task.originalMarkdown.includes('🔁') ) OR ( filter by function task.file.path.toLocaleLowerCase() === 'TASKS RELEASES/4.1.0 RELEASE.MD'.toLocaleLowerCase() ) OR ( filter by function const taskDate = task.due.moment; const now = moment(); return taskDate?.isSame(now, 'day') || ( !taskDate && task.heading?.includes(now.format('YYYY-MM-DD')) ) || false ) OR ( filter by function const wanted = '#context/home'; return task.heading?.includes(wanted) || task.tags.find( (tag) => tag === wanted ) && true || false; )
( filter by function ! 'NON_TASK,CANCELLED'.includes(task.status.type); ) OR ( filter by function const date = task.due.moment; return date ? !date.isValid() : false; ) OR ( filter by function task.due.moment?.isSameOrBefore(moment(), 'day') || false; ) OR ( filter by function task.urgency.toFixed(2) === 1.95.toFixed(2); ) OR ( filter by function (!task.isRecurring) && task.originalMarkdown.includes('🔁'); ) OR ( filter by function task.file.path.toLocaleLowerCase() === 'TASKS RELEASES/4.1.0 RELEASE.MD'.toLocaleLowerCase(); ) OR ( filter by function const taskDate = task.due.moment; const now = moment(); return taskDate?.isSame(now, 'day') || ( !taskDate && task.heading?.includes(now.format('YYYY-MM-DD')) ) || false; ) OR ( filter by function const wanted = '#context/home'; return task.heading?.includes(wanted) || task.tags.find( (tag) => tag === wanted ) && true || false; )
(((((NOT  ( description includes d1 ))))))
(((((description includes #context/location1)))))
((due this week) AND (description includes Hello World)) OR NOT ((due this week) AND (description includes Hello World))
(DESCRIPTION INCLUDES wibble) OR (has due date)
(DUE THIS WEEK) AND (DESCRIPTION INCLUDES HELLO WORLD)
(HAS START DATE) AND "DESCRIPTION INCLUDES SOME"
(HAS START DATE) AND ((DESCRIPTION INCLUDES SOME) OR (HAS DUE DATE))
(HAS START DATE) AND NOT (DESCRIPTION INCLUDES SOME)
(HAS START DATE) OR ((DESCRIPTION INCLUDES SPECIAL) AND (HAS DUE DATE))
(HAS START DATE) OR NOT (DESCRIPTION INCLUDES SPECIAL)
(HAS START DATE) XOR (DESCRIPTION INCLUDES SPECIAL)
(cancelled after 2021-12-27) OR NOT (cancelled after 2021-12-27)
(cancelled before 2021-12-27) OR NOT (cancelled before 2021-12-27)
(cancelled date is invalid) OR NOT (cancelled date is invalid)
(cancelled in 2021-12-27 2021-12-29) OR NOT (cancelled in 2021-12-27 2021-12-29)
(cancelled on 2021-12-27) OR NOT (cancelled on 2021-12-27)
(cancelled this week) OR NOT (cancelled this week)
(created after 2021-12-27) OR NOT (created after 2021-12-27)
(created before 2021-12-27) OR NOT (created before 2021-12-27)
(created date is invalid) OR NOT (created date is invalid)
(created in 2021-12-27 2021-12-29) OR NOT (created in 2021-12-27 2021-12-29)
(created on 2021-12-27) OR NOT (created on 2021-12-27)
(created this week) OR NOT (created this week)
(description does not include wibble) OR NOT (description does not include wibble)
(description includes "hello world") OR (description includes "42")
(description includes #context/location1)
(description includes #context/location1) OR (description includes #context/location2 ) OR (  description includes #context/location3 ) OR   (  description includes #context/location4 )
(description includes 1)   AND   (description includes 2)   AND   (description includes 3)   AND   (description includes 4)   AND   (description includes 5)   AND   (description includes 6)   AND   (description includes 7)   AND   (description includes 8)   AND   (description includes 9)
(description includes 1) AND (description includes 2) AND (description includes 3)
(description includes 1) AND (description includes 2) AND (description includes 3) AND (description includes 4) AND (description includes 5) AND (description includes 6) AND (description includes 7) AND (description includes 8) AND (description includes 9)
(description includes AND) OR NOT (description includes AND)
(description includes SHOULD NOT BE RECOGNISED AS A BOOLEAN)AND(description includes BECAUSE THERE ARE NO SPACES AROUND THE 'AND' OPERATOR)
(description includes d1) AND   NOT (priority medium)
(description includes d1) AND (priority medium)
(description includes d1) AND NOT (description includes d2)
(description includes d1) OR   NOT (priority medium)
(description includes d1) OR (description includes d2)
(description includes d1) OR (description includes d2) OR (priority medium)
(description includes d1) OR (priority medium)
(description includes d1) OR NOT (description includes d2)
(description includes d1) XOR (description includes d2)
(description includes d1) XOR (priority medium)
(description includes line 1) OR (description includes line 1 continued with \\ backslash)
(description includes wibble) OR NOT (description includes wibble)
(description regex matches /#t\\s/i) OR (description regex matches /#t$/i)
(done after 2021-12-27) OR NOT (done after 2021-12-27)
(done before 2021-12-27) OR NOT (done before 2021-12-27)
(done date is invalid) OR NOT (done date is invalid)
(done in 2021-12-27 2021-12-29) OR NOT (done in 2021-12-27 2021-12-29)
(done on 2021-12-27) OR NOT (done on 2021-12-27)
(done this week) OR NOT (done this week)
(done) OR NOT (done)
(due after 2021-12-27) OR NOT (due after 2021-12-27)
(due before 2021-12-27) OR NOT (due before 2021-12-27)
(due before tomorrow) AND (is recurring)
(due date is invalid) OR NOT (due date is invalid)
(due in 2021-12-27 2021-12-29) OR NOT (due in 2021-12-27 2021-12-29)
(due on 2021-12-27) OR NOT (due on 2021-12-27)
(due this week) AND (description includes Hello World)
(due this week) OR NOT (due this week)
(exclude sub-items) OR NOT (exclude sub-items)
(filename includes wibble) OR NOT (filename includes wibble)
(filter by function task.isDone) OR NOT (filter by function task.isDone)
(folder does not include some/path) OR NOT (folder does not include some/path)
(folder includes AND) OR NOT (folder includes AND)
(folder includes some/path) OR NOT (folder includes some/path)
(happens after 2021-12-27) OR NOT (happens after 2021-12-27)
(happens before 2021-12-27) OR NOT (happens before 2021-12-27)
(happens in 2021-12-27 2021-12-29) OR NOT (happens in 2021-12-27 2021-12-29)
(happens on 2021-12-27) OR NOT (happens on 2021-12-27)
(happens this week) OR NOT (happens this week)
(has cancelled date) OR NOT (has cancelled date)
(has created date) OR NOT (has created date)
(has depends on) OR NOT (has depends on)
(has done date) OR NOT (has done date)
(has due date) OR ((HAS START DATE) AND (due after 2021-12-27))
(has due date) OR NOT (has due date)
(has happens date) OR NOT (has happens date)
(has id) OR NOT (has id)
(has scheduled date) OR NOT (has scheduled date)
(has start date) AND "description includes some"
(has start date) AND ((description includes some) OR (has due date))
(has start date) AND (description includes some)
(has start date) AND NOT (description includes some)
(has start date) OR ((description includes special) AND (has due date))
(has start date) OR NOT (description includes special)
(has start date) OR NOT (has start date)
(has start date) XOR (description includes special)
(has tag) OR NOT (has tag)
(has tags) OR NOT (has tags)
(heading does not include wibble) OR NOT (heading does not include wibble)
(heading includes AND) OR NOT (heading includes AND)
(heading includes wibble) OR NOT (heading includes wibble)
(id does not include abc123) OR NOT (id does not include abc123)
(id includes AND) OR NOT (id includes AND)
(id includes abc123) OR NOT (id includes abc123)
(is blocked) OR NOT (is blocked)
(is blocking) OR NOT (is blocking)
(is not blocked) OR NOT (is not blocked)
(is not blocking) OR NOT (is not blocking)
(is not recurring) OR NOT (is not recurring)
(is not recurring) XOR ((path includes ab/c) OR (happens before 2021-12-27))
(is recurring) OR NOT (is recurring)
(no cancelled date) OR NOT (no cancelled date)
(no created date) OR NOT (no created date)
(no depends on) OR NOT (no depends on)
(no due date) OR NOT (no due date)
(no happens date) OR NOT (no happens date)
(no id) OR NOT (no id)
(no scheduled date) OR NOT (no scheduled date)
(no start date) OR NOT (no start date)
(no tag) OR NOT (no tag)
(no tags) OR NOT (no tags)
(not done) OR NOT (not done)
(path does not include some/path) OR NOT (path does not include some/path)
(path includes ()some example()) OR (path includes ((some example)))
(path includes (some example) OR (path includes )some example()
(path includes (some example)) OR (path includes )some example()
(path includes )some example() OR (path includes (some example))
(path includes A) OR (path includes Test.md)
(path includes AND) OR NOT (path includes AND)
(path includes a) AND NOT(path includes b)
(path includes a) AND(path includes b)
(path includes a) OR NOT(path includes b)
(path includes a) OR(path includes b)
(path includes a) XOR(path includes b)
(path includes a)AND (path includes b)
(path includes a)AND NOT(path includes b)
(path includes a)OR (path includes b)
(path includes a)OR NOT (path includes b)
(path includes a)XOR (path includes b)
(path includes some/path) OR NOT (path includes some/path)
(priority is above none) OR NOT (priority is above none)
(priority is below none) OR NOT (priority is below none)
(priority is high) OR NOT (priority is high)
(priority is highest) OR (priority is lowest)
(priority is low) OR NOT (priority is low)
(priority is medium) OR NOT (priority is medium)
(priority is none) OR NOT (priority is none)
(recurrence does not include wednesday) OR NOT (recurrence does not include wednesday)
(recurrence includes wednesday) OR NOT (recurrence includes wednesday)
(root does not include some) OR NOT (root does not include some)
(root includes AND) OR NOT (root includes AND)
(root includes some) OR NOT (root includes some)
(scheduled after 2021-12-27) OR NOT (scheduled after 2021-12-27)
(scheduled before 2021-12-27) OR NOT (scheduled before 2021-12-27)
(scheduled date is invalid) OR NOT (scheduled date is invalid)
(scheduled in 2021-12-27 2021-12-29) OR NOT (scheduled in 2021-12-27 2021-12-29)
(scheduled on 2021-12-27) OR NOT (scheduled on 2021-12-27)
(scheduled this week) OR NOT (scheduled this week)
(start date is invalid) OR NOT (start date is invalid)
(starts after 2021-12-27) OR NOT (starts after 2021-12-27)
(starts before 2021-12-27) OR NOT (starts before 2021-12-27)
(starts in 2021-12-27 2021-12-29) OR NOT (starts in 2021-12-27 2021-12-29)
(starts on 2021-12-27) OR NOT (starts on 2021-12-27)
(starts this week) OR NOT (starts this week)
(status.name includes cancelled) OR NOT (status.name includes cancelled)
(status.type is IN_PROGRESS) OR NOT (status.type is IN_PROGRESS)
(tag does not include #sometag) OR NOT (tag does not include #sometag)
(tag does not include sometag) OR NOT (tag does not include sometag)
(tag includes #sometag) OR NOT (tag includes #sometag)
(tag includes AND) OR NOT (tag includes AND)
(tag includes sometag) OR NOT (tag includes sometag)
(tags do not include #sometag) OR NOT (tags do not include #sometag)
(tags do not include sometag) OR NOT (tags do not include sometag)
(tags include #sometag) OR NOT (tags include #sometag)
(tags include sometag) OR NOT (tags include sometag)
[due this week] AND [description includes I use square brackets]
[filter by function task.description.includes('a')] AND [description includes "hello world"]
{due this week} AND {description includes I use curly braces}
{filter by function task.description.includes('a')} AND {description includes "hello world"}
AND (description includes d1)
NOT   (  happens before blahblahblah  )
NOT  ( description includes d1 )
NOT ( NOT ( is blocking ) )
NOT ((HAS START DATE) OR (DESCRIPTION INCLUDES SPECIAL))
NOT ((has start date) OR (description includes special))
NOT (HAS START DATE)
NOT (description blahblah d1)
NOT (description includes d1)
NOT (happens before blahblahblah)
NOT (has start date)
NOT(path includes b)
OR (description includes d1)
`;

export function verifyBooleanExpressionPreprocessing(fn: (text: string, delimiters: BooleanDelimiters) => any) {
    verifyAll('Results of preprocessing boolean expressions', inputs.split('\n'), (input) => {
        if (input.trim() === '') {
            return '';
        }

        let result: string = '';
        try {
            const delimiters = BooleanDelimiters.fromInstructionLine(input);
            result = JSON.stringify(fn(input, delimiters), null, 4);
        } catch (e) {
            result = errorMessageForException('Parsing expression', e);
        }
        return `
Input:
'${input}'
=>
Result:
${result}

--------------------------------------------------------
`;
    });
}

export function verifyBooleanExpressionExplanation() {
    verifyAll('Results of parsing and explaining boolean expressions', inputs.split('\n'), (input) => {
        if (input.trim() === '') {
            return '';
        }

        let result: string = '';
        const filterOrErrorMessage = new BooleanField().createFilterOrErrorMessage(input);
        if (filterOrErrorMessage.isValid()) {
            result = filterOrErrorMessage.filter!.explainFilterIndented('  ');
        } else {
            result = filterOrErrorMessage.error!;
        }
        return `
Input:
'${input}'
=>
Result:
${result}

--------------------------------------------------------
`;
    });
}
