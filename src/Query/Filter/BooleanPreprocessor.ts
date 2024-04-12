import { BooleanDelimiters, anyOfTheseChars } from './BooleanDelimiters';

export type BooleanPreprocessorResult = {
    simplifiedLine: string;
    filters: { [key: string]: string };
};

export class BooleanPreprocessor {
    public static preprocessExpression(line: string, delimiters: BooleanDelimiters): BooleanPreprocessorResult {
        const parts = BooleanPreprocessor.splitLine(line, delimiters);
        return BooleanPreprocessor.getFiltersAndSimplifiedLine(parts, delimiters);
    }

    public static splitLine(line: string, delimiters: BooleanDelimiters) {
        // Here, we split the input line in to separate operators-plus-adjacent-delimiters
        // and the remaining filter text.

        // This will now correctly split up almost all valid Boolean instructions - many more cases than the
        // original preprocessExpression() method.
        // The one current exception is that any Spaces and ) at the end of sub-expressions/filters are interpreted
        // as part of the Boolean condition, not the filter.

        // Escape special regex characters for Binary boolean operators and create a regex pattern to match
        // operators and capture surrounding delimiters.
        // To retain backwards compatibility, we match expressions that have missing spaces around AND, OR etc.
        // This matches text such as:
        //   ')AND('
        //   ') AND ('
        //   ')AND  NOT('
        //   ')  AND  NOT  ('
        const binaryOperatorsRegex = new RegExp(
            '(' + delimiters.closeFilter + '\\s*(?:AND|OR|AND +NOT|OR +NOT|XOR)\\s*' + delimiters.openFilter + ')',
        );

        // Divide up line, split at binary operator boundaries
        const substrings = line.split(binaryOperatorsRegex);

        // Escape special regex characters for Unary boolean operators and create a regex pattern to match
        // operators and capture surrounding delimiters.
        // This matches text such as:
        //   'NOT('
        //   'NOT ('
        //   'NOT  ('
        const unaryOperatorsRegex = new RegExp('(NOT\\s*' + delimiters.openFilter + ')');

        // Divide up the divided components, this time splitting at unary operator boundaries.
        // flatMap() divides and then flattens the result.
        // Then we filter out empty values.
        const substringsSplitAtOperatorBoundaries = substrings
            .flatMap((substring) => substring.split(unaryOperatorsRegex))
            .filter((substring) => substring !== '');

        // All that remains now is to separate:
        // - any spaces and opening delimiters at the start of filters
        // - any spaces and close   delimiters at the end of filters
        const openingDelimitersAndSpacesAtStartRegex = new RegExp(
            '(^' + anyOfTheseChars(delimiters.openFilterChars + ' ') + '*)',
        );

        const closingDelimitersAndSpacesAtEndRegex = new RegExp(
            '(' + anyOfTheseChars(delimiters.closeFilterChars + ' ') + '*$)',
        );

        return substringsSplitAtOperatorBoundaries
            .flatMap((substring) => substring.split(openingDelimitersAndSpacesAtStartRegex))
            .flatMap((substring) => substring.split(closingDelimitersAndSpacesAtEndRegex))
            .filter((substring) => substring !== '');
    }

    private static getFiltersAndSimplifiedLine(parts: string[], delimiters: BooleanDelimiters) {
        // Holds the reconstructed expression with placeholders
        let simplifiedLine = '';
        let currentIndex = 1; // Placeholder index starts at 1
        const filters: { [key: string]: string } = {}; // To store filter placeholders and their corresponding text

        // Loop to add placeholders-for-filters or operators to the simplifiedLine
        parts.forEach((part) => {
            // Check if the part is an operator by matching against the regex without surrounding parentheses
            if (!BooleanPreprocessor.isAFilter(part, delimiters)) {
                // It's an operator, space or parenthesis, so add it directly to the simplifiedLine
                simplifiedLine += `${part}`;
            } else {
                // It's a filter, replace it with a placeholder, and save it:
                const placeholder = `f${currentIndex}`;
                filters[placeholder] = part;
                simplifiedLine += placeholder;
                currentIndex++;
            }
        });

        // boon-js requires at least one space around each operator.
        // Be nice to the user and add any missing spaces around operators:
        const operatorMissingPrecedingSpace = new RegExp(`(${delimiters.closeFilter})([A-Z])`, 'g');
        simplifiedLine = simplifiedLine.replace(operatorMissingPrecedingSpace, '$1 $2');

        const operatorMissingFollowingSpace = new RegExp(`([A-Z])(${delimiters.openFilter})`, 'g');
        simplifiedLine = simplifiedLine.replace(operatorMissingFollowingSpace, '$1 $2');

        // convert any non-standard delimiters to standard ones:
        const openChars = delimiters.openFilterChars;
        if (openChars != '"' && openChars != '(') {
            const openDelimiter = new RegExp(anyOfTheseChars(openChars), 'g');
            simplifiedLine = simplifiedLine.replace(openDelimiter, '(');

            const closeChars = delimiters.closeFilterChars;
            const closeDelimiter = new RegExp(anyOfTheseChars(closeChars), 'g');
            simplifiedLine = simplifiedLine.replace(closeDelimiter, ')');
        }
        return { simplifiedLine, filters };
    }

    private static isAFilter(part: string, delimiters: BooleanDelimiters) {
        // This set of regular expressions was built up empirically through a lot of iteration,
        // over a very thorough set of sample Boolean filters, in order to detect all the outputs
        // from splitLine() that were not actually Tasks filters.
        const onlySpacesAndParentheses = new RegExp(
            '^' + anyOfTheseChars(' ' + delimiters.openAndCloseFilterChars) + '+$',
        );

        const binaryOperatorAndParentheses = new RegExp(
            '^ *' + delimiters.closeFilter + ' *(AND|OR|XOR) *' + delimiters.openFilter + ' *$',
        );

        const unaryOperatorAndParentheses = new RegExp('^(AND|OR|XOR|NOT) *' + delimiters.openFilter + '$');

        const remnantsOfNot = new RegExp('^' + delimiters.closeFilter + ' *(AND|OR|XOR)$');

        const justOperators = /^(AND|OR|XOR|NOT)$/;

        return ![
            onlySpacesAndParentheses,
            binaryOperatorAndParentheses,
            unaryOperatorAndParentheses,
            remnantsOfNot,
            justOperators,
        ].some((regex) => RegExp(regex).exec(part));
    }
}
