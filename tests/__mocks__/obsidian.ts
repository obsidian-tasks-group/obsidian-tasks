export {};

export class MenuItem {}

export class Menu {
    /**
     * Adds a menu item. Only works when menu is not shown yet.
     * @public
     */
    addItem(_cb: (item: MenuItem) => any): this {
        return this;
    }
}
