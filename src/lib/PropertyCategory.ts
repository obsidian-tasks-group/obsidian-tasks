// TODO Add tests
// TODO Add JSdoc
export class PropertyCategory {
    public readonly name: string;
    public readonly sortOrder: number;

    // Pass in an empty name if you want groupText to be ''
    constructor(name: string, number: number) {
        this.name = name;
        this.sortOrder = number;
    }

    public get groupText(): string {
        if (this.name !== '') {
            return `%%${this.sortOrder}%% ${this.name}`;
        } else {
            return '';
        }
    }
}
