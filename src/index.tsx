import React, { FC } from 'react';

interface IMenuItem {
    item: {
        en: string;
        de: string;
        [locale: string]: string;
    };
    to: string;
    children: IMenuItem[] | undefined;
}

interface INavProps {
    menuItems: IMenuItem[];
    currentLocale: string;
}

const NavList: FC<INavProps & { level: number }> = ({
    menuItems,
    currentLocale,
    level,
}) => {
    return (
        <ul>
            {menuItems.map((menuItem, index) => {
                return (
                    <li key={index}>
                        {menuItem.item[currentLocale]}
                        {menuItem.children && (
                            <NavList
                                menuItems={menuItem.children}
                                currentLocale={currentLocale}
                                level={level + 1}
                            />
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

const Menu: FC<INavProps> = ({ menuItems, currentLocale }) => {
    return (
        <nav>
            <NavList
                menuItems={menuItems}
                currentLocale={currentLocale}
                level={0}
            />
        </nav>
    );
};

export default Menu;
