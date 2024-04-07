import { BooleanDelimiters, anyOfTheseChars } from './BooleanDelimiters';

export type ParseResult = {
    simplifiedLine: string;
    filters: { [key: string]: string };
};

export class BooleanPreprocessor {
    public static preprocessExpressionV2(line: string, delimiters: BooleanDelimiters): ParseResult {
        const parts = BooleanPreprocessor.splitLine(line, delimiters);
        return BooleanPreprocessor.getFiltersAndSimplifiedLine(parts, delimiters);
    }

    public static splitLine(line: string, delimiters: BooleanDelimiters) {
        // TODO Clarify that " can be a delimiter, as well as ()

        // Here, we split the input line in to separate operators-plus-adjacent-parentheses
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
        // TODO Review all uses of space character in these regular expressions, and use \s instead:
        const binaryOperatorsRegex = new RegExp(
            '(' + delimiters.closeFilter + '\\s*(?:AND|OR|AND +NOT|OR +NOT|XOR)\\s*' + delimiters.openFilter + ')',
            'g',
        );

        // Divide up line, split at binary operator boundaries
        const substrings = line.split(binaryOperatorsRegex);

        // Escape special regex characters for Unary boolean operators and create a regex pattern to match
        // operators and capture surrounding parentheses.
        // This matches text such as:
        //   'NOT('
        //   'NOT ('
        //   'NOT  ('
        // TODO Ensure that NOT is at the start of a word - and perhaps is preceded by spaces.
        const unaryOperatorsRegex = new RegExp('(NOT\\s*' + delimiters.openFilter + ')', 'g');

        // Divide up the divided components, this time splitting at unary operator boundaries.
        // flatMap() divides and then flattens the result.
        // Then we filter out empty values.
        const substringsSplitAtOperatorBoundaries = substrings
            .flatMap((substring) => substring.split(unaryOperatorsRegex))
            .filter((substring) => substring !== '');

        // All that remains now is to separate:
        // - any spaces and opening parentheses at the start of filters
        // - any spaces and close   parentheses at the end of filters
        const openingParensAndSpacesAtStartRegex = new RegExp(
            '(^' + anyOfTheseChars(delimiters.openFilterChars + ' ') + '*)',
        );

        const closingParensAndSpacesAtEndRegex = new RegExp(
            '(' + anyOfTheseChars(delimiters.closeFilterChars + ' ') + '*$)',
        );

        return substringsSplitAtOperatorBoundaries
            .flatMap((substring) => substring.split(openingParensAndSpacesAtStartRegex))
            .flatMap((substring) => substring.split(closingParensAndSpacesAtEndRegex))
            .filter((substring) => substring !== '');
    }

    private static getFiltersAndSimplifiedLine(parts: string[], delimiters: BooleanDelimiters) {
        // Holds the reconstructed expression with placeholders
        let simplifiedLine = '';
        let currentIndex = 1; // Placeholder index starts at 1
        const filters: { [key: string]: string } = {}; // To store filter placeholders and their corresponding text

        // Loop to add placeholders-for-filters or operators to the simplifiedLine
        parts.forEach((part, _index) => {
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

        // convert non-standard delimiters to standard ones:
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
        // These *could* be inlined, but their variable names add meaning.
        // TODO Simplify the expressions
        // TODO Clarify the variable names
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
