import moment from 'moment';

window.moment = moment;

import { Task } from '../src/Task';
import { Sort } from '../src/Sort';

function fromLine(line: string, path = '') {
    return Task.fromLine({
        line,
        path,
        precedingHeader: '',
        sectionIndex: 0,
        sectionStart: 0,
    })!;
}

describe('Sort', () => {
    test('by due', () => {
        const a = fromLine('- [x] bring out the trash 🗓 2021-09-12');
        const b = fromLine('- [ ] pet the cat 🗓 2021-09-15');
        expect(Sort.by({ sorting: ['due'] }, [a, b])).toEqual([a, b]);
        expect(Sort.by({ sorting: ['due'] }, [b, a])).toEqual([a, b]);
    });

    test('by done', () => {
        const a = fromLine('- [ ] bring out the trash 🗓 2021-09-12');
        const b = fromLine('- [x] pet the cat 🗓 2021-09-15 ✅ 2021-09-16');
        expect(Sort.by({ sorting: ['done'] }, [a, b])).toEqual([b, a]);
        expect(Sort.by({ sorting: ['done'] }, [b, a])).toEqual([b, a]);
    });

    test('by due, path, status', () => {
        const a = fromLine('- [ ] a 🗓 1970-01-01', '1');
        const b = fromLine('- [x] b 🗓 1970-01-01', '2');
        const c = fromLine('- [ ] c 🗓 1970-01-01', '2');
        const expectedOrder = [
            a, // date is the same, but path is lower
            c, // path is lower, but same as b. this is first b/c it's not done yet
            b, // same as c, but already done. this has lowest priority
        ];
        expect(
            Sort.by({ sorting: ['due', 'path', 'status'] }, [a, b, c]),
        ).toEqual(expectedOrder);
    });
});
