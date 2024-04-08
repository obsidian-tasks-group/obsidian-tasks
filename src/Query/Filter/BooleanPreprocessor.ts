import { BooleanDelimiters } from './BooleanDelimiters';

export class BooleanPreprocessor {
    public static splitLine(line: string) {
        const delimiters = BooleanDelimiters.allSupportedDelimiters();

        // Here, we split the input line in to separate operators-plus-adjacent-delimiters
        // and the remaining filter text.
        const binaryOperatorsRegex = new RegExp(
            '(' + delimiters.closeFilter + ' (?:AND|OR|XOR) ' + delimiters.openFilter + ')',
            'g',
        );

        // Divide up line, split at binary operator boundaries
        return line.split(binaryOperatorsRegex);
    }
}
