import { Field } from '../../../src/Query/Filter/Field';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import type { Comparator } from '../../../src/Query/Sort/Sorter';
import type { Task } from '../../../src/Task/Task';
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
            const line = 'sort by unsupported';
            const sorting = unsupported.createSorterFromLine(line);
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
            const sorting = supported.createSorterFromLine(line);
            expect(sorting).not.toBeNull();
            expect(sorting?.property).toEqual('description-length');
        });

        it('should fail to parse a invalid line', () => {
            const line = 'sort by jsdajhasdfa';
            const sorting = supported.createSorterFromLine(line);
            expect(sorting).toBeNull();
        });

        it('should compare two tasks', () => {
            const sorting = supported.createSorterFromLine('sort by description-length');
            const a = new TaskBuilder().description('short description').build();
            const b = new TaskBuilder().description('very looooooooong description').build();
            expectTaskComparesBefore(sorting!, a, b);
        });
    });
});
