import { BooleanDelimiters } from './BooleanDelimiters';

export class BooleanPreprocessor {
    public static splitLine(line: string) {
        const delimiters = BooleanDelimiters.allSupportedDelimiters();

        // Here, we split the input line in to separate operators-plus-adjacent-delimiters
        // and the remaining filter text.

        // This will now correctly split up almost all valid Boolean instructions - many more cases than the
        // original preprocessExpression() method.
        // The one current exception is that any Spaces and ) at the end of sub-expressions/filters are interpreted
        // as part of the Boolean condition, not the filter.

        // Escape special regex characters for Binary boolean operators and create a regex pattern to match
        // operators and capture surrounding parentheses.
        // To retain backwards compatibility, we match expressions that have missing spaces around AND, OR etc.
        // This matches text such as:
        //   ')AND('
        //   ') AND ('
        //   ')AND  NOT('
        //   ')  AND  NOT  ('
        const binaryOperatorsRegex = new RegExp(
            '(' + delimiters.closeFilter + '\\s*(?:AND|OR|AND +NOT|OR +NOT|XOR)\\s*' + delimiters.openFilter + ')',
            'g',
        );

        // Divide up line, split at binary operator boundaries
        const substrings = line.split(binaryOperatorsRegex);

        // Escape special regex characters for Unary boolean operators and create a regex pattern to match
        // operators and capture surrounding parentheses.
        // This matches:
        //   'NOT ('
        const unaryOperatorsRegex = new RegExp('(NOT ' + delimiters.openFilter + ')', 'g');

        // Divide up the divided components, this time splitting at unary operator boundaries.
        // flatMap() divides and then flattens the result.
        return substrings.flatMap((substring) => substring.split(unaryOperatorsRegex));
    }
}
