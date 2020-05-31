import React, { FC } from 'react';
import matchPaths from './matchPaths';

interface IMenuItem {
    item: {
        en: string;
        de: string;
        [locale: string]: string;
    };
    to: string;
    children?: IMenuItem[];
}

class MenuItemWithActiveField {
    constructor(
        public item: {
            en: string;
            de: string;
            [locale: string]: string;
        },
        public to: string,
        public children: MenuItemWithActiveField[] | [],
        public partlyActive: boolean,
        public active: boolean
    ) {}
}

const returnEmptyMenuItemsWithActiveField = () => {
    return new MenuItemWithActiveField(
        { en: '', de: '' },
        '',
        [],
        false,
        false
    );
};

const NavList: FC<{
    menuItemsWithActiveField: MenuItemWithActiveField[];
    currentLocale: string;
}> = ({ menuItemsWithActiveField, currentLocale }) => {
    return (
        <ul>
            {menuItemsWithActiveField.map((menuItem, index) => {
                return (
                    <li
                        key={index}
                        className={`${menuItem.active ? 'active' : ''}${
                            menuItem.partlyActive ? ' partlyActive' : ''
                        }`}>
                        <a
                            href={`${
                                currentLocale === 'en' ? '' : '' + currentLocale
                            }${menuItem.to}`}>
                            {menuItem.item[currentLocale]}
                        </a>
                        {menuItem.children && (
                            <NavList
                                menuItemsWithActiveField={menuItem.children}
                                currentLocale={currentLocale}
                            />
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

const checkforActivePaths = (
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

            if (menuItem.children.length > 0) {
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

const addActiveFields = (
    menuItems: IMenuItem[]
): { menuItemsWithActiveField: MenuItemWithActiveField[] } => {
    let menuItemsWithActiveField: MenuItemWithActiveField[] = [];

    const recurseOver = (
        oldItems: IMenuItem[],
        newItems: MenuItemWithActiveField[]
    ) => {
        for (let key in oldItems) {
            newItems[key] = returnEmptyMenuItemsWithActiveField();
            newItems[key].item = oldItems[key].item;
            newItems[key].to = oldItems[key].to;
            newItems[key].children = [];
            newItems[key].partlyActive = false;
            newItems[key].active = false;

            if (oldItems[key].children) {
                recurseOver(
                    oldItems[key].children as IMenuItem[],
                    newItems[key].children
                );
            }
        }
    };

    recurseOver(menuItems, menuItemsWithActiveField);
    return { menuItemsWithActiveField };
};

const Menu: FC<{
    menuItems: IMenuItem[];
    activeLocale: string;
    activePathWithoutLocale: string;
}> = ({ menuItems, activeLocale, activePathWithoutLocale }) => {
    const { menuItemsWithActiveField } = addActiveFields(menuItems);
    const { menuItemsWithActivePaths } = checkforActivePaths(
        menuItemsWithActiveField,
        activePathWithoutLocale
    );

    return (
        <>
            <NavList
                menuItemsWithActiveField={menuItemsWithActivePaths}
                currentLocale={activeLocale}
            />
        </>
    );
};

export default Menu;
