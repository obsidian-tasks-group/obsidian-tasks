/**
 * @jest-environment jsdom
 */
import moment from 'moment';

window.moment = moment;

import { Sort } from '../src/Sort';
import { resetSettings, updateSettings } from '../src/config/Settings';
import { fromLine } from './TestHelpers';

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
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'due',
                            reverse: false,
                            propertyInstance: 1,
                        },
                    ],
                },
                [one, two, three],
            ),
        ).toEqual([one, two, three]);
        expect(
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'due',
                            reverse: false,
                            propertyInstance: 1,
                        },
                    ],
                },
                [two, three, one],
            ),
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
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'done',
                            reverse: false,
                            propertyInstance: 1,
                        },
                    ],
                },
                [three, two, one],
            ),
        ).toEqual([one, two, three]);
        expect(
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'done',
                            reverse: false,
                            propertyInstance: 1,
                        },
                    ],
                },
                [two, one, three],
            ),
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
                        {
                            property: 'due',
                            reverse: false,
                            propertyInstance: 1,
                        },
                        {
                            property: 'path',
                            reverse: false,
                            propertyInstance: 1,
                        },
                        {
                            property: 'status',
                            reverse: false,
                            propertyInstance: 1,
                        },
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
                        {
                            property: 'description',
                            reverse: false,
                            propertyInstance: 1,
                        },
                        {
                            property: 'done',
                            reverse: false,
                            propertyInstance: 1,
                        },
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
                        {
                            property: 'description',
                            reverse: true,
                            propertyInstance: 1,
                        },
                        {
                            property: 'done',
                            reverse: false,
                            propertyInstance: 1,
                        },
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
                        {
                            property: 'status',
                            reverse: true,
                            propertyInstance: 1,
                        },
                        { property: 'due', reverse: true, propertyInstance: 1 },
                        {
                            property: 'path',
                            reverse: false,
                            propertyInstance: 1,
                        },
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
                    sorting: [
                        {
                            property: 'description',
                            reverse: false,
                            propertyInstance: 1,
                        },
                    ],
                },
                [two, one, five, four, three],
            ),
        ).toEqual(expectedOrder);
    });
});

/*
 * All the test cases below have tasks with 0 or more tags against them. This is to
 * ensure that the sorting can handle the ordering correctly when there are no tags or
 * if one of th tasks has less tags than the other.
 *
 * There is also a task with additional characters in the name to ensure it is seen
 * as bigger that one with the same initial characters.
 */
describe('Sort by tags', () => {
    it('should sort correctly by tag defaulting to first with no global filter', () => {
        // Arrange
        const t1 = fromLine({ line: '- [ ] a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] a #bbb #iii' });
        const t3 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] a #ddd #ggg' });
        const t5 = fromLine({ line: '- [ ] a #eee #fff' });
        const t6 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t7 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t8 = fromLine({ line: '- [ ] a #hhh #eee' });
        const t9 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t10 = fromLine({ line: '- [ ] a #jjj #hhh' });
        const expectedOrder = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10];

        // Act / Assert
        expect(
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'tag',
                            reverse: false,
                            propertyInstance: 1,
                        },
                    ],
                },
                [t1, t3, t5, t7, t6, t4, t2, t8, t9, t10],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly reversed by tag defaulting to first with no global filter', () => {
        // Arrange
        const t1 = fromLine({ line: '- [ ] a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] a #bbb #iii' });
        const t3 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] a #ddd #ggg' });
        const t5 = fromLine({ line: '- [ ] a #eee #fff' });
        const t6 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t7 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t8 = fromLine({ line: '- [ ] a #hhh #eee' });
        const t9 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t10 = fromLine({ line: '- [ ] a #jjj #hhh' });
        const expectedOrder = [t10, t9, t8, t7, t6, t5, t4, t3, t2, t1];

        // Act / Assert
        expect(
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'tag',
                            reverse: true,
                            propertyInstance: 1,
                        },
                    ],
                },
                [t1, t3, t5, t7, t6, t4, t2, t8, t9, t10],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly by second tag with no global filter', () => {
        const t1 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t3 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t4 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t5 = fromLine({ line: '- [ ] a #hhh #eee' });
        const expectedOrder = [t1, t2, t3, t4, t5];
        expect(
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'tag',
                            reverse: false,
                            propertyInstance: 2,
                        },
                    ],
                },
                [t4, t3, t2, t1, t5],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly reversed by second tag with no global filter', () => {
        const t1 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t3 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t4 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t5 = fromLine({ line: '- [ ] a #hhh #eee' });
        const expectedOrder = [t5, t4, t3, t2, t1];
        expect(
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'tag',
                            reverse: true,
                            propertyInstance: 2,
                        },
                    ],
                },
                [t4, t3, t2, t1, t5],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly by tag defaulting to first with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t4 = fromLine({ line: '- [ ] #task a #bbbb ' });
        const t5 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t6 = fromLine({ line: '- [ ] #task a #ddd #ggg' });
        const t7 = fromLine({ line: '- [ ] #task a #eee #fff' });
        const t8 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t9 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t10 = fromLine({ line: '- [ ] #task a #hhh #eee' });
        const t11 = fromLine({ line: '- [ ] #task a #iii #ddd' });
        const t12 = fromLine({ line: '- [ ] #task a #jjj #hhh' });
        const t13 = fromLine({ line: '- [ ] #task a' });

        const expectedOrder = [
            t1,
            t2,
            t3,
            t4,
            t5,
            t6,
            t7,
            t8,
            t9,
            t10,
            t11,
            t12,
            t13,
        ];

        // Act
        expect(
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'tag',
                            reverse: false,
                            propertyInstance: 1,
                        },
                    ],
                },
                [t1, t12, t3, t13, t5, t7, t6, t4, t2, t8, t9, t10, t11],
            ),
        ).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly reversed by tag defaulting to first with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t4 = fromLine({ line: '- [ ] #task a #bbbb ' });
        const t5 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t6 = fromLine({ line: '- [ ] #task a #ddd #ggg' });
        const t7 = fromLine({ line: '- [ ] #task a #eee #fff' });
        const t8 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t9 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t10 = fromLine({ line: '- [ ] #task a #hhh #eee' });
        const t11 = fromLine({ line: '- [ ] #task a #iii #ddd' });
        const t12 = fromLine({ line: '- [ ] #task a #jjj #hhh' });
        const t13 = fromLine({ line: '- [ ] #task a' });

        const expectedOrder = [
            t13,
            t12,
            t11,
            t10,
            t9,
            t8,
            t7,
            t6,
            t5,
            t4,
            t3,
            t2,
            t1,
        ];

        // Act
        expect(
            Sort.by(
                {
                    sorting: [
                        {
                            property: 'tag',
                            reverse: true,
                            propertyInstance: 1,
                        },
                    ],
                },
                [t1, t12, t3, t13, t5, t7, t6, t4, t2, t8, t9, t10, t11],
            ),
        ).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly by second tag with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t5 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t6 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t7 = fromLine({ line: '- [ ] #task a #bbbb' });
        const t8 = fromLine({ line: '- [ ] #task a' });
        const expectedOrder = [t1, t2, t3, t4, t5, t6, t7, t8];

        // Act
        const result = Sort.by(
            {
                sorting: [
                    {
                        property: 'tag',
                        reverse: false,
                        propertyInstance: 2,
                    },
                ],
            },
            [t4, t7, t5, t2, t3, t1, t8, t6],
        );

        // Assert
        expect(result).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly reversed by second tag with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t5 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t6 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t7 = fromLine({ line: '- [ ] #task a #bbbb' });
        const t8 = fromLine({ line: '- [ ] #task a' });
        const expectedOrder = [t8, t7, t6, t5, t4, t3, t2, t1];

        // Act
        const result = Sort.by(
            {
                sorting: [
                    {
                        property: 'tag',
                        reverse: true,
                        propertyInstance: 2,
                    },
                ],
            },
            [t4, t7, t5, t2, t3, t1, t8, t6],
        );

        // Assert
        expect(result).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });
});
