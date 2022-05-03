/**
 * @jest-environment jsdom
 */
import moment from 'moment';

window.moment = moment;

import { Task } from '../src/Task';
import { Sort } from '../src/Sort';

function fromLine({ line, path = '' }: { line: string; path?: string }) {
    return Task.fromLine({
        line,
        path,
        precedingHeader: '',
        sectionIndex: 0,
        sectionStart: 0,
    })!;
}

describe('Sort', () => {
    it('sorts correctly by default order', () => {
        const one = fromLine({ line: '- [ ] a 📅 1970-01-01', path: '3' });
        const two = fromLine({ line: '- [ ] c 📅 1970-01-02', path: '3' });
        const three = fromLine({ line: '- [ ] d 📅 1970-01-03', path: '2' });
        const four = fromLine({ line: '- [x] d 📅 1970-01-02', path: '2' });
        const five = fromLine({ line: '- [x] b 📅 1970-01-02', path: '3' });
        const six = fromLine({ line: '- [x] d 📅 1970-01-03', path: '2' });
        const expectedOrder = [one, two, three, four, five, six];
        expect(
            Sort.by({ sorting: [] }, [six, five, one, four, two, three]),
        ).toEqual(expectedOrder);
    });

    it('sorts correctly by due', () => {
        const one = fromLine({
            line: '- [x] bring out the trash 📅 2021-09-12',
            path: '',
        });
        const two = fromLine({
            line: '- [ ] pet the cat 📅 2021-09-15',
            path: '',
        });
        const three = fromLine({
            line: '- [ ] pet the cat 📅 2021-09-18',
            path: '',
        });
        expect(
            Sort.by({ sorting: [{ property: 'due', reverse: false }] }, [
                one,
                two,
                three,
            ]),
        ).toEqual([one, two, three]);
        expect(
            Sort.by({ sorting: [{ property: 'due', reverse: false }] }, [
                two,
                three,
                one,
            ]),
        ).toEqual([one, two, three]);
    });

    it('sorts correctly by done', () => {
        const one = fromLine({
            line: '- [x] pet the cat 📅 2021-09-15 ✅ 2021-09-15',
            path: '',
        });
        const two = fromLine({
            line: '- [x] pet the cat 📅 2021-09-16 ✅ 2021-09-16',
            path: '',
        });
        const three = fromLine({
            line: '- [ ] bring out the trash 📅 2021-09-12',
            path: '',
        });
        expect(
            Sort.by({ sorting: [{ property: 'done', reverse: false }] }, [
                three,
                two,
                one,
            ]),
        ).toEqual([one, two, three]);
        expect(
            Sort.by({ sorting: [{ property: 'done', reverse: false }] }, [
                two,
                one,
                three,
            ]),
        ).toEqual([one, two, three]);
    });

    it('sorts correctly by due, path, status', () => {
        const one = fromLine({ line: '- [ ] a 📅 1970-01-01', path: '1' });
        const two = fromLine({ line: '- [ ] c 📅 1970-01-02', path: '1' });
        const three = fromLine({ line: '- [ ] d 📅 1970-01-02', path: '2' });
        const four = fromLine({ line: '- [x] b 📅 1970-01-02', path: '2' });
        const expectedOrder = [
            one, // Sort by due date first.
            two, // Same due as the rest, but lower path.
            three, // Same as b, but not done.
            four, // Done tasks are sorted after open tasks for status.
        ];
        expect(
            Sort.by(
                {
                    sorting: [
                        { property: 'due', reverse: false },
                        { property: 'path', reverse: false },
                        { property: 'status', reverse: false },
                    ],
                },
                [one, four, two, three],
            ),
        ).toEqual(expectedOrder);
    });

    it('sorts correctly by description, done', () => {
        const one = fromLine({
            line: '- [ ] a 📅 1970-01-02 ✅ 1971-01-01',
            path: '',
        });
        const two = fromLine({
            line: '- [ ] a 📅 1970-01-02 ✅ 1971-01-03',
            path: '',
        });
        const three = fromLine({
            line: '- [ ] b 📅 1970-01-01 ✅ 1971-01-01',
            path: '',
        });
        const four = fromLine({
            line: '- [ ] b 📅 1970-01-02 ✅ 1971-01-02',
            path: '',
        });
        const expectedOrder = [one, two, three, four];
        expect(
            Sort.by(
                {
                    sorting: [
                        { property: 'description', reverse: false },
                        { property: 'done', reverse: false },
                    ],
                },
                [three, one, two, four],
            ),
        ).toEqual(expectedOrder);
    });

    it('sorts correctly by description reverse, done', () => {
        const one = fromLine({
            line: '- [ ] b 📅 1970-01-01 ✅ 1971-01-01',
            path: '',
        });
        const two = fromLine({
            line: '- [ ] b 📅 1970-01-02 ✅ 1971-01-02',
            path: '',
        });
        const three = fromLine({
            line: '- [ ] a 📅 1970-01-02 ✅ 1971-01-01',
            path: '',
        });
        const four = fromLine({
            line: '- [ ] a 📅 1970-01-02 ✅ 1971-01-03',
            path: '',
        });
        const expectedOrder = [one, two, three, four];
        expect(
            Sort.by(
                {
                    sorting: [
                        { property: 'description', reverse: true },
                        { property: 'done', reverse: false },
                    ],
                },
                [two, four, three, one],
            ),
        ).toEqual(expectedOrder);
    });

    it('sorts correctly by complex sorting incl. reverse', () => {
        const one = fromLine({ line: '- [x] a 📅 1970-01-03', path: '3' });
        const two = fromLine({ line: '- [x] c 📅 1970-01-02', path: '2' });
        const three = fromLine({ line: '- [x] d 📅 1970-01-02', path: '3' });
        const four = fromLine({ line: '- [ ] d 📅 1970-01-02', path: '2' });
        const five = fromLine({ line: '- [ ] b 📅 1970-01-02', path: '3' });
        const six = fromLine({ line: '- [ ] d 📅 1970-01-01', path: '2' });

        const expectedOrder = [one, two, three, four, five, six];

        expect(
            Sort.by(
                {
                    sorting: [
                        { property: 'status', reverse: true },
                        { property: 'due', reverse: true },
                        { property: 'path', reverse: false },
                    ],
                },
                [six, five, one, four, three, two],
            ),
        ).toEqual(expectedOrder);
    });

    it('sorts correctly by the link name and not the markdown', () => {
        const one = fromLine({
            line: '- [ ] *ZZZ An early task that starts with an A; actually not italic since only one asterisk',
        });
        const two = fromLine({
            line: '- [ ] [[Better be second]] with bla bla behind it',
        });
        const three = fromLine({
            line: '- [ ] [[Another|Third it should be]] and not [last|ZZZ]',
        });
        const four = fromLine({
            line: '- [ ] *Very italic text*',
        });
        const five = fromLine({
            line: '- [ ] [@Zebra|Zebra] should be last for Zebra',
        });

        const expectedOrder = [one, two, three, four, five];
        expect(
            Sort.by(
                {
                    sorting: [{ property: 'description', reverse: false }],
                },
                [two, one, five, four, three],
            ),
        ).toEqual(expectedOrder);
    });

    it('sorts correctly by tag, done', () => {
        const one = fromLine({
            line: '- [ ] a #someday #home 📅 1970-01-01 ✅ 1971-01-01',
            path: '',
        });
        const two = fromLine({
            line: '- [ ] #task b #someday #home 📅 1970-01-02 ✅ 1971-01-02',
            path: '',
        });
        const three = fromLine({
            line: '- [ ] c #next #home 📅 1970-01-02 ✅ 1971-01-01',
            path: '',
        });
        const four = fromLine({
            line: '- [ ] d #urgent #home 📅 1970-01-02 ✅ 1971-01-03',
            path: '',
        });
        const five = fromLine({
            line: '- [ ] e 📅 1970-01-02 ✅ 1971-01-03',
            path: '',
        });
        const expectedOrder = [three, one, two, four, five];
        expect(
            Sort.by(
                {
                    sorting: [
                        { property: 'tag', reverse: false },
                        { property: 'done', reverse: false },
                    ],
                },
                [one, two, three, four, five],
            ),
        ).toEqual(expectedOrder);
    });
});
