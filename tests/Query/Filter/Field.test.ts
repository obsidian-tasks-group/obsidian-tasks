import { Field } from '../../../src/Query/Filter/Field';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import type { Comparator } from '../../../src/Query/Sorting';
import type { Task } from '../../../src/Task';
import { expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

class TestFieldSortingUnSupported extends Field {
    // Filtering
    createFilterOrErrorMessage(_line: string): FilterOrErrorMessage {
        throw Error(`createFilterOrErrorMessage() unimplemented for ${this.fieldName()}`);
    }

    fieldName(): string {
        return 'unsupported';
    }

    protected filterRegExp(): RegExp | null {
        throw Error(`filterRegExp() unimplemented for ${this.fieldName()}`);
    }
}

class DescriptionLengthField extends Field {
    // Filtering
    createFilterOrErrorMessage(_line: string): FilterOrErrorMessage {
        throw Error(`createFilterOrErrorMessage() unimplemented for ${this.fieldName()}`);
    }

    fieldName(): string {
        return 'description-length';
    }

    protected filterRegExp(): RegExp | null {
        throw Error(`filterRegExp() unimplemented for ${this.fieldName()}`);
    }

    // Sorting
    supportsSorting(): boolean {
        return true;
    }

    comparator(): Comparator {
        return (a: Task, b: Task) => {
            return a.description.length - b.description.length;
        };
    }
}

describe('sorting - base class usability and implementation', () => {
    describe('field not supporting sorting', () => {
        const unsupported = new TestFieldSortingUnSupported();

        it('should not support sorting', () => {
            expect(unsupported.supportsSorting()).toEqual(false);
        });

        it('should not create a comparator', () => {
            const t = () => {
                unsupported.comparator();
            };
            expect(t).toThrow(Error);
        });

        it('should fail to parse a "valid" line', () => {
            // expect(unsupported.parseSortLine('sort by unsupported')).toThrow(Error);
            const line = 'sort by unsupported';
            expect(unsupported.canCreateSorterForLine(line)).toBe(false);
            expect(unsupported.createSorterFromLine(line)).toBeNull();
            const sorting = unsupported.parseSortLine(line);
            expect(sorting).toBeNull();
        });
    });

    describe('field supporting sorting', () => {
        const supported = new DescriptionLengthField();

        it('should support sorting', () => {
            expect(supported.supportsSorting()).toEqual(true);
        });

        it('should create a comparator', () => {
            expect(supported.comparator()).not.toBeNull();
        });

        it('should parse a valid line', () => {
            const line = 'sort by description-length';
            expect(supported.canCreateSorterForLine(line)).toBe(true);
            expect(supported.createSorterFromLine(line)).not.toBeNull();
            const sorting = supported.parseSortLine(line);
            expect(sorting).not.toBeNull();
            expect(sorting?.property).toEqual('description-length');
        });

        it('should fail to parse a invalid line', () => {
            const line = 'sort by jsdajhasdfa';
            expect(supported.canCreateSorterForLine(line)).toBe(false);
            expect(supported.createSorterFromLine(line)).toBeNull();
            const sorting = supported.parseSortLine(line);
            expect(sorting).toBeNull();
        });

        it('should compare two tasks', () => {
            const sorting = supported.parseSortLine('sort by description-length');
            const a = new TaskBuilder().description('short description').build();
            const b = new TaskBuilder().description('very looooooooong description').build();
            expectTaskComparesBefore(sorting!, a, b);
        });
    });
});
