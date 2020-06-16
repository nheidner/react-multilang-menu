import { IMenuItem, MenuItemWithActiveField } from './types';

export const isHash = (link: string): boolean => {
    return link ? link.charAt(0) === '#' : false;
};

const matchPaths = (...paths: [string, string]): boolean => {
    for (const key in paths) {
        if (typeof paths[key] !== 'string') {
            return false;
        }
        // remove traling slash and convert to lower case
        paths[key] = paths[key].replace(/\/$/, '').toLowerCase();
    }
    return paths[0].localeCompare(paths[1]) === 0;
};

export const checkforActivePaths = (
    menuItems: MenuItemWithActiveField[],
    activePathWithoutLocale: string
): { menuItemsWithActivePaths: MenuItemWithActiveField[] } => {
    let active = false;

    const recurseOver = (menuItems: MenuItemWithActiveField[]) => {
        for (let menuItem of menuItems) {
            if (matchPaths(activePathWithoutLocale, menuItem.to)) {
                menuItem.active = true;
                active = true;
                break;
            }

            if (menuItem.children) {
                recurseOver(menuItem.children);
            }

            if (active) {
                menuItem.partlyActive = true;
                break;
            }
        }
    };

    recurseOver(menuItems);
    return { menuItemsWithActivePaths: menuItems };
};

export const addActiveFields = (
    menuItems: IMenuItem[]
): { menuItemsWithActiveField: MenuItemWithActiveField[] } => {
    let menuItemsWithActiveField: MenuItemWithActiveField[] = [];

    const recurseOver = (
        oldItems: IMenuItem[],
        newItems: MenuItemWithActiveField[]
    ) => {
        for (let key in oldItems) {
            newItems[key] = new MenuItemWithActiveField();
            newItems[key].item = oldItems[key].item;
            newItems[key].to = oldItems[key].to;

            if (oldItems[key].children) {
                newItems[key].children = [];
                recurseOver(
                    oldItems[key].children as IMenuItem[],
                    newItems[key].children as MenuItemWithActiveField[]
                );
            }
        }
    };

    recurseOver(menuItems, menuItemsWithActiveField);
    return { menuItemsWithActiveField };
};
