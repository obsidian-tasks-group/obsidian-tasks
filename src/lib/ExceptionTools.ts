/**
 * Get the text to report after an exception is caught.
 * @param whatWasHappening - a description of what was happening at the time, preferably including any user inputs.
 * @param exception - object that was caught in a try/catch block.
 */
export function errorMessageForException(whatWasHappening: string, exception: any): string {
    const errorMessage = `Error: ${whatWasHappening}.
The error message was:
    `;
    let detail: string = '';
    if (exception instanceof Error) {
        detail += exception;
    } else {
        detail += 'Unknown error';
    }
    return `${errorMessage}"${detail}"`;
}
