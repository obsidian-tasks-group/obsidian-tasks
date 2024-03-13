import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import { errorMessageForException } from '../../../src/lib/ExceptionTools';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';

export const inputs = `
"description includes d1" AND "description includes d2"
( (description includes a) AND (description includes b) ) AND (description includes c)
( (description includes a) AND (description includes b) AND (description includes c) ) OR ( (description includes d) AND (description includes e) AND (description includes f) )
( (description includes a) OR (description includes b) ) OR (description includes c)
( (description includes a) OR (description includes b) OR (description includes c) ) AND ( (description includes d) OR (description includes e) OR (description includes f) )
( (filter by function task.description.includes('a')) OR (filter by function task.description.includes('b')) OR (filter by function task.description.includes('c')) ) AND ( (filter by function task.description.includes('d')) OR (filter by function task.description.includes('e')) OR (filter by function task.description.includes('f')) )
( description includes a ) AND ( (description includes b) AND (description includes c) )
( description includes a ) OR ( (description includes b) OR (description includes c) )
(((((description includes #context/location1)))))
(description includes #context/location1)
(description includes #context/location1) OR (description includes #context/location2 ) OR (  description includes #context/location3 ) OR   (  description includes #context/location4 )
(description includes 1) AND (description includes 2) AND (description includes 3)
(description includes 1) AND (description includes 2) AND (description includes 3) AND (description includes 4) AND (description includes 5) AND (description includes 6) AND (description includes 7) AND (description includes 8) AND (description includes 9)
(description includes 1)   AND   (description includes 2)   AND   (description includes 3)   AND   (description includes 4)   AND   (description includes 5)   AND   (description includes 6)   AND   (description includes 7)   AND   (description includes 8)   AND   (description includes 9)
(description includes d1) AND (priority medium)
(description includes d1) AND NOT (description includes d2)
(description includes d1) AND NOT (priority medium)
(description includes d1) OR (description includes d2)
(description includes d1) OR (description includes d2) OR (priority medium)
(description includes d1) OR (priority medium)
(description includes d1) OR NOT (description includes d2)
(description includes d1) OR NOT (priority medium)
(description includes d1) XOR (description includes d2)
(description includes d1) XOR (priority medium)

AND (description includes d1)
NOT (description blahblah d1)
NOT (description includes d1)
NOT (happens before blahblahblah)
OR (description includes d1)
(description includes SHOULD NOT BE RECOGNISED AS A BOOLEAN)AND(description includes BECAUSE THERE ARE NO SPACES AROUND THE 'AND' OPERATOR)

(path includes (some example) OR (path includes )some example()
(path includes (some example)) OR (path includes )some example()
(path includes )some example() OR (path includes (some example))
(path includes ()some example()) OR (path includes ((some example)))

( description regex matches /(buy|order|voucher|lakeland|purchase|\\spresent)/i ) OR ( path includes Home/Shopping )
( filter by function ! 'NON_TASK,CANCELLED'.includes(task.status.type) ) OR ( filter by function const date = task.due.moment; return date ? !date.isValid() : false; ) OR ( filter by function task.due.moment?.isSameOrBefore(moment(), 'day') || false ) OR ( filter by function task.urgency.toFixed(2) === 1.95.toFixed(2) ) OR ( filter by function (!task.isRecurring) && task.originalMarkdown.includes('🔁') ) OR ( filter by function task.file.path.toLocaleLowerCase() === 'TASKS RELEASES/4.1.0 RELEASE.MD'.toLocaleLowerCase() ) OR ( filter by function const taskDate = task.due.moment; const now = moment(); return taskDate?.isSame(now, 'day') || ( !taskDate && task.heading?.includes(now.format('YYYY-MM-DD')) ) || false ) OR ( filter by function const wanted = '#context/home'; return task.heading?.includes(wanted) || task.tags.find( (tag) => tag === wanted ) && true || false; )
`;

export function verifyBooleanExpressionPreprocessing(fn: (text: string) => any) {
    verifyAll('Results of preprocessing boolean expressions', inputs.split('\n'), (input) => {
        if (input.trim() === '') {
            return '';
        }

        let result: string = '';
        try {
            result = JSON.stringify(fn(input), null, 4);
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
