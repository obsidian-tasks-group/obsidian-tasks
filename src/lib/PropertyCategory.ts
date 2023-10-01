/**
 * A helper class to construct group names for data types that do not naturally sort in alphabetical order.
 *
 * A convention has been adopted in the Tasks grouping code to use commented-out numbers to control
 * the sort order in group headings for things like {@link Priority}, which we want to
 * sort from {@link Priority.Highest} to {@link Priority.Lowest}, instead of alphabetically.
 *
 * This class provides a way to store a {@link name} and a {@link sortOrder}, from which {@link groupText}
 * can be constructed.
 *
 * For an example of use, see {@link TasksDate.category}.
 */
export class PropertyCategory {
    public readonly name: string;
    public readonly sortOrder: number;

    /**
     * Constructor
     *
     * @param name The name of the category. This is typically the text that will be displayed in a group heading.
     * @param sortOrder A numeric sort order for this heading. Lower numbers are displayed before higher ones.
     */
    // Pass in an empty name if you want groupText to be ''
    constructor(name: string, sortOrder: number) {
        this.name = name;
        this.sortOrder = sortOrder;
    }

    /**
     * Return the group heading for this category.
     *
     * It prefixes the name with a comment that will ensure the groups sort in the desired order.
     *
     * This works because the commented-out sortOrder will be hidden when Obsidian
     * renders the group heading.
     */
    public get groupText(): string {
        if (this.name !== '') {
            return `%%${this.sortOrder}%% ${this.name}`;
        } else {
            return '';
        }
    }
}
