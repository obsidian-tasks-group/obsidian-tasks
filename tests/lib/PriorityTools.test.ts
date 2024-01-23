import { PriorityTools } from '../../src/lib/PriorityTools';
import { Priority } from '../../src/Task/Priority';

describe('priority naming', () => {
    it.each(Object.values(Priority))('should name priority value: "%i"', (priority) => {
        const name = PriorityTools.priorityNameUsingNone(priority);
        expect(name).not.toEqual('ERROR'); // if this fails, code needs to be updated for a new priority
    });

    it('should name default priority correctly', () => {
        const none = Priority.None;
        expect(PriorityTools.priorityNameUsingNone(none)).toEqual('None');
        expect(PriorityTools.priorityNameUsingNormal(none)).toEqual('Normal');
    });
});
