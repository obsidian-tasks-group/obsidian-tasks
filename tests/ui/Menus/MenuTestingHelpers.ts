import type { MenuItem } from '../../__mocks__/obsidian';

export function menuToString<MenuType>(menu: MenuType) {
    // @ts-expect-error TS2339: Property 'items' does not exist on type 'MenuType'.
    const items: MenuItem[] = menu.items;
    return '\n' + items.map((item) => `${item.checked ? 'x' : ' '} ${item.title}`).join('\n');
}
