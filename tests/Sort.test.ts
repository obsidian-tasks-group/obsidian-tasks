import moment from 'moment';

window.moment = moment;

import { Task } from '../src/Task';
import { Sort } from '../src/Sort';

function fromLine(line: string) {
    return Task.fromLine({
        line,
        path: '',
        precedingHeader: '',
        sectionIndex: 0,
        sectionStart: 0,
    })!;
}

describe('Sort', () => {
    test('by due', () => {
        const a = fromLine('- [x] bring out the trash 🗓 2021-09-12');
        const b = fromLine('- [ ] pet the cat 🗓 2021-09-15');
        expect(Sort.byDue([a, b])).toEqual([a, b]);
        expect(Sort.byDue([b, a])).toEqual([a, b]);
    });

    test('by done', () => {
      const a = fromLine('- [ ] bring out the trash 🗓 2021-09-12');
      const b = fromLine('- [x] pet the cat 🗓 2021-09-15');
      expect(Sort.byDone([a, b])).toEqual([a, b]);
      expect(Sort.byDone([b, a])).toEqual([a, b]);
  });
});
