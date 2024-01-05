export {};

export class MenuItem {
    public title: string | DocumentFragment = '';
    public callback: (evt: MouseEvent | KeyboardEvent) => any;
    public checked = false;

    constructor() {
        this.callback = (_evt: MouseEvent | KeyboardEvent) => console.log('callback not defined');
    }

    public setTitle(title: string | DocumentFragment): this {
        this.title = title;
        return this;
    }

    public onClick(callback: (evt: MouseEvent | KeyboardEvent) => any): this {
        this.callback = callback;
        return this;
    }
    public setChecked(checked: boolean | null): this {
        this.checked = checked ? checked : false;
        return this;
    }
}

export class Menu {
    public items: MenuItem[] = [];

    /**
     * Adds a menu item. Only works when menu is not shown yet.
     * @public
     */
    addItem(cb: (item: MenuItem) => any): this {
        const item = new MenuItem();
        cb(item);
        this.items.push(item);
        return this;
    }

    /**
     * Adds a separator. Only works when menu is not shown yet.
     */
    addSeparator(): this {
        const getMenuItemCallback = (item: MenuItem) => {
            item.setTitle('---');
        };
        return this.addItem(getMenuItemCallback);
    }
}

export class Notice {
    /**
     * @public
     */
    constructor(_message: string | DocumentFragment, _timeout?: number) {}

    /**
     * Change the message of this notice.
     * @public
     */
    setMessage(_message: string | DocumentFragment): this {
        return this;
    }

    /**
     * @public
     */
    hide(): void {}
}
