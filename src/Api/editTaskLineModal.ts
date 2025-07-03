/**
 * Opens the Tasks UI and returns the Markdown string for the task entered.
 *
 * If the optional Markdown string for a task is passed, the form will be
 * populated with that task's properties.
 *
 * @returns {Promise<string>} A promise that contains the Markdown string for the task entered or
 * an empty string, if data entry was cancelled.
 */
export function editTaskLineModal(): Promise<string> {
    const waitForClose = new Promise<string>((resolve, _) => {
        resolve('');
    });

    return waitForClose;
}
