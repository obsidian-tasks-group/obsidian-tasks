/**
 * Utility functions to help Tasks queries validate search instructions
 * for any unwanted template text.
 */
export class TemplatingPluginTools {
    public findUnexpandedDateText(line: string): null | string {
        const templateTexts = ['<%', 'YYYY-MM-DD'];
        for (const templateText of templateTexts) {
            if (line.includes(templateText)) {
                return `Instruction contains unexpanded template text: "${templateText}" - and cannot be interpreted.`;
            }
        }
        return null;
    }
}
