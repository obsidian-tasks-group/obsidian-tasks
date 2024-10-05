import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class RandomField extends FilterInstructionsBasedField {
    public fieldName(): string {
        return 'random';
    }
}
