import { TaskExpression, constructArguments, parseAndEvaluateExpression } from '../../src/Scripting/TaskExpression';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { makeQueryContext } from '../../src/Scripting/QueryContext';

describe('TaskExpression', () => {
    describe('low level functions', () => {
        it('should allow passing QueryContext or null to constructArguments()', () => {
            const task = new TaskBuilder().build();
            constructArguments(task, null);
            constructArguments(task, makeQueryContext('dummy.md'));
        });

        it('should calculate an expression value from a QueryContext', () => {
            const queryContext = makeQueryContext('test.md');
            const task = new TaskBuilder().build();
            const result = parseAndEvaluateExpression(task, 'query.file.path', queryContext);
            expect(result).toEqual('test.md');
        });

        it('should behave predictably if no QueryContext supplied', () => {
            const task = new TaskBuilder().build();
            const result = parseAndEvaluateExpression(task, 'query.file.path', undefined);
            expect(result).toMatchInlineSnapshot(`
                "Error: Failed calculating expression "query.file.path".
                The error message was:
                    "TypeError: Cannot read properties of null (reading 'file')""
            `);
        });
    });

    describe('parsing', () => {
        it('should report that a parsable line using task is valid', () => {
            const line = 'task.description';

            // Act
            const taskExpression = new TaskExpression(line);

            // Assert
            expect(taskExpression.isValid()).toEqual(true);
            expect(taskExpression.line).toEqual(line);
            expect(taskExpression.parseError).toBeUndefined();
        });

        it('should report that a parsable line using query is valid', () => {
            const line = 'query.file.path';

            // Act
            const taskExpression = new TaskExpression(line);

            // Assert
            expect(taskExpression.isValid()).toEqual(true);
            expect(taskExpression.line).toEqual(line);
            expect(taskExpression.parseError).toBeUndefined();
        });

        it('should report that a line with mismatched parentheses is invalid', () => {
            const line = 'task.due.formatAsDate())';

            // Act
            const taskExpression = new TaskExpression(line);

            // Assert
            expect(taskExpression.isValid()).toEqual(false);
            expect(taskExpression.line).toEqual(line);
            expect(taskExpression.parseError).toEqual(
                'Error: Failed parsing expression "task.due.formatAsDate())".\nThe error message was:\n    "SyntaxError: Unexpected token \')\'"',
            );
        });
    });

    describe('evaluating', () => {
        const queryContext = makeQueryContext('dummy.md');
        it('should evaluate a valid task property and give correct result', () => {
            // Arrange
            const taskExpression = new TaskExpression('task.description');
            const task = new TaskBuilder().description('hello').build();

            // Act, Assert
            expect(taskExpression.evaluate(task, queryContext)).toEqual('hello');
            expect(taskExpression.evaluateOrCatch(task, queryContext)).toEqual('hello');
        });

        it('should evaluate a valid query property and give correct result', () => {
            // Arrange
            const taskExpression = new TaskExpression('query.file.path');
            const task = new TaskBuilder().build();

            // Act, Assert
            expect(taskExpression.evaluate(task, queryContext)).toEqual('dummy.md');
            expect(taskExpression.evaluateOrCatch(task, queryContext)).toEqual('dummy.md');
        });

        it('should return error string as output if evaluating an expression that parsed OK fails at execution', () => {
            // Arrange
            const taskExpression = new TaskExpression('wibble');

            // Act
            const result = taskExpression.evaluateOrCatch(new TaskBuilder().build(), queryContext);

            // Assert
            expect(result).toEqual(
                'Error: Failed calculating expression "wibble".\nThe error message was:\n    "ReferenceError: wibble is not defined"',
            );

            // Try again, using evaluate()
            const t = () => {
                taskExpression.evaluate(new TaskBuilder().build(), queryContext);
            };
            expect(t).toThrow(ReferenceError);
            expect(t).toThrowError('wibble is not defined');
        });

        it('should give a meaningful error if evaluating a line that failed to parse', () => {
            // Arrange
            const taskExpression = new TaskExpression('task.due.formatAsDate(');
            expect(taskExpression.isValid()).toEqual(false);

            // Act
            const result = taskExpression.evaluateOrCatch(new TaskBuilder().build(), queryContext);

            // Assert
            const expectedErrorMessage =
                'Error: Cannot evaluate an expression which is not valid: "task.due.formatAsDate(" gave error: "Error: Failed parsing expression "task.due.formatAsDate(".\nThe error message was:\n    "SyntaxError: Unexpected token \'}\'""';
            expect(result).toEqual(expectedErrorMessage);

            // Try again, using evaluate()
            const t = () => {
                taskExpression.evaluate(new TaskBuilder().build(), queryContext);
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(expectedErrorMessage);
        });
    });
});
