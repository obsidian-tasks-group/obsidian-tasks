// From https://github.com/mProjectsCode/parsiNOM/blob/main/tests/languages/Clare.test.ts

import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import type { ParsingRange } from '@lemons_dev/parsinom/lib/HelperTypes';

/*
 * This is a simplified version of the tasks query language.
 * Query expressions are oversimplified here, as the focus is on the combination operators.
 * A task in this proof of concept is simply a string.
 * The expression `abc` represents a query that results in the tasks `['a', 'b', 'c']`.
 * The combination operators (AND and OR) have the same precedence and are thus evaluated left to right.
 * The operations are parsed into an AST with additional positional information which isn't utilized here, but can be useful later.
 *
 * Credit: Moritz Jung
 */

// in our simplified world, a task is a string
type Task = string;

/**
 * This represents a task expression, so a leaf in our AST.
 */
class TaskQueryExpression {
    range: ParsingRange;
    tasks: Task[];

    constructor(range: ParsingRange, tasks: Task[]) {
        this.range = range;
        this.tasks = tasks;
    }

    evaluate(): Task[] {
        return this.tasks;
    }
}

enum TaskExpressionOperator {
    AND = 'AND',
    OR = 'OR',
}

/**
 * This represents an operation such as AND, so a node in our AST.
 */
class TaskExpressionOperation {
    range: ParsingRange;
    operator: TaskExpressionOperator;
    lhs: TaskASTElement;
    rhs: TaskASTElement;

    constructor(range: ParsingRange, operator: TaskExpressionOperator, lhs: TaskASTElement, rhs: TaskASTElement) {
        this.range = range;
        this.operator = operator;
        this.lhs = lhs;
        this.rhs = rhs;
    }

    evaluate(): Task[] {
        const lhsValue: Task[] = this.lhs.evaluate();
        const rhsValue: Task[] = this.rhs.evaluate();

        if (this.operator === TaskExpressionOperator.AND) {
            const ret: Task[] = [];
            // add all elements that are included in both
            for (const task of lhsValue) {
                if (rhsValue.includes(task)) {
                    ret.push(task);
                }
            }
            return ret;
        } else if (this.operator === TaskExpressionOperator.OR) {
            // clone lhs
            const ret: Task[] = lhsValue.slice();
            // add all elements of rhs that are not already included
            for (const task of rhsValue) {
                if (!ret.includes(task)) {
                    ret.push(task);
                }
            }
            return ret;
        } else {
            // should be unreachable
            return [];
        }
    }
}

type TaskASTElement = TaskQueryExpression | TaskExpressionOperation;

interface TasksQueryLanguageDef {
    expression: TaskQueryExpression;
    wrappedExpression: TaskQueryExpression | TaskExpressionOperation;

    operator: TaskExpressionOperator;
    operation: TaskQueryExpression | TaskExpressionOperation;
    parser: TaskQueryExpression | TaskExpressionOperation;
}

const TasksQueryLanguage = P.createLanguage<TasksQueryLanguageDef>({
    // an expression is at least on letter in our simplified world
    expression: () =>
        P_UTILS.letter()
            .atLeast(1)
            .node((value, range) => new TaskQueryExpression(range, value)),

    // a wrapped expression is either an expression with parens or an operation with parens
    // we use ref here, since we are referencing a parser that we only define later on
    wrappedExpression: (language, ref) =>
        P.or(language.expression, ref.operation).trim(P_UTILS.optionalWhitespace()).wrap(P.string('('), P.string(')')),

    // an operator is any value of the TaskExpressionOperator enum
    operator: () => P.or(...Object.values(TaskExpressionOperator).map((x) => P.string(x).result(x))),

    // an operation is a left associative binary expression
    operation: (language) =>
        P_UTILS.binaryLeftRange(
            language.operator,
            language.wrappedExpression,
            (range, a, b, c) => new TaskExpressionOperation(range, b, a, c),
        ),

    // the entire parser is either an operation or an expression and then end of string
    parser: (language) => P.or(language.operation, language.expression).thenEof(),
});

const TasksParser = TasksQueryLanguage.parser;

describe('task query language', () => {
    test('single expression', () => {
        const result = TasksParser.tryParse('abc');

        expect(result.success).toBe(true);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'b', 'c']);
    });

    test('single expression with parens', () => {
        const result = TasksParser.tryParse('(abc)');

        expect(result.success).toBe(true);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'b', 'c']);
    });

    test('dual expression with AND', () => {
        const result = TasksParser.tryParse('(abc) AND (acd)');

        expect(result.success).toBe(true);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'c']);
    });

    test('dual expression with OR', () => {
        const result = TasksParser.tryParse('(abc) OR (acd)');

        expect(result.success).toBe(true);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    test('triple expression with AND', () => {
        const result = TasksParser.tryParse('(abc) AND (acd) AND (abd)');

        expect(result.success).toBe(true);
        expect(result.value?.evaluate().sort()).toEqual(['a']);
    });

    test('triple expression with OR', () => {
        const result = TasksParser.tryParse('(abc) OR (acd) OR (ade)');

        expect(result.success).toBe(true);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    test('mixed expression with AND and OR', () => {
        const result = TasksParser.tryParse('(abc) AND (acd) OR (ae)');

        expect(result.success).toBe(true);
        // since AND and OR have the same precedence, they are parsed left to right. So AND should be the inner one and OR the outer one.
        // @ts-ignore
        expect(result.value?.operator).toBe(TaskExpressionOperator.OR);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'c', 'e']);
    });

    test('mixed expression with AND and OR and parens', () => {
        const str = '(abc) AND ((acd) OR (be))';
        const result = TasksParser.tryParse(str);

        expect(result.success).toBe(true);
        // since OR is in parens, AND should be the outer one and OR the inner one.
        // @ts-ignore
        expect(result.value?.operator).toBe(TaskExpressionOperator.AND);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'b', 'c']);
    });

    test('double paren', () => {
        const str = '((abc))';
        const result = TasksParser.tryParse(str);

        expect(result.success).toBe(true);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'b', 'c']);
    });

    test('double paren AND', () => {
        const str = '((abc) AND (acd))';
        const result = TasksParser.tryParse(str);

        expect(result.success).toBe(true);
        expect(result.value?.evaluate().sort()).toEqual(['a', 'c']);
    });
});
