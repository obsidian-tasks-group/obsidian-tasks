import { TaskExpression, constructArguments } from '../../src/Scripting/TaskExpression';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { makeQueryContext } from '../../src/Scripting/QueryContext';

describe('TaskExpression', () => {
    describe('low level functions', () => {
        it('should allow passing QueryContext or null to constructArguments()', () => {
            const task = new TaskBuilder().build();
            constructArguments(task, null);
            constructArguments(task, makeQueryContext('dummy.md'));
        });
    });

    describe('parsing', () => {
        it('should report that a parsable line is valid', () => {
            const line = 'task.description';

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
        it('should evaluate a valid line and give correct result', () => {
            // Arrange
            const taskExpression = new TaskExpression('task.description');

            // Act
            const result = taskExpression.evaluateOrCatch(new TaskBuilder().description('hello').build(), queryContext);

            // Assert
            expect(result).toEqual('hello');
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
