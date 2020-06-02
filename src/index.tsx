import React, { FC, ReactElement, ReactNode } from 'react';
import matchPaths from './matchPaths';

export interface IMenuItem {
    item: {
        en: string;
        de: string;
        [locale: string]: string;
    };
    to: string;
    children?: IMenuItem[];
}

export interface ILink {
    (props: {
        children: ReactNode;
        to: string;
        [otherParams: string]: any;
    }): ReactElement;
}

export type IDropdownCarret = FC<{ active: boolean }>;

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

class NavListItem extends React.Component<
    {
        menuItem: MenuItemWithActiveField;
        activeLocale: string;
        Link: ILink;
        primaryLocale: string;
        DropdownCarret: IDropdownCarret;
        level: number;
    },
    {
        isHovered: boolean;
        isClicked: boolean;
    }
> {
    state = {
        isHovered: false,
        isClicked: false,
    };

    onMouseOver = () => this.setState({ isHovered: true });

    onMouseOut = () => this.setState({ isHovered: false });

    onClick = () => this.setState({ isClicked: !this.state.isClicked });

    render() {
        const {
            menuItem,
            Link,
            activeLocale,
            primaryLocale,
            DropdownCarret,
            level,
        } = this.props;
        return (
            <li
                className={`${menuItem.active ? 'active' : ''} ${
                    menuItem.partlyActive ? 'partlyActive' : ''
                } ${this.state.isHovered ? 'onHover' : ''} ${
                    menuItem.children.length > 0 ? 'hasSubList' : ''
                }`}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}>
                <Link
                    to={`${
                        activeLocale === primaryLocale ? '' : '/' + activeLocale
                    }${menuItem.to}`}>
                    {menuItem.item[activeLocale]}
                    {menuItem.children.length > 0 && (
                        <DropdownCarret
                            active={
                                this.state.isHovered || menuItem.partlyActive
                            }
                        />
                    )}
                </Link>
                {menuItem.children.length > 0 && (
                    <NavList
                        menuItemsWithActiveField={menuItem.children}
                        activeLocale={activeLocale}
                        Link={Link}
                        primaryLocale={primaryLocale}
                        DropdownCarret={DropdownCarret}
                        level={level + 1}
                    />
                )}
            </li>
        );
    }
}

const NavList: FC<{
    menuItemsWithActiveField: MenuItemWithActiveField[];
    activeLocale: string;
    Link: ILink;
    primaryLocale: string;
    DropdownCarret: IDropdownCarret;
    level: number;
    classNameForTopElement?: string;
    showMenu?: boolean;
}> = ({
    menuItemsWithActiveField,
    activeLocale,
    Link,
    primaryLocale,
    DropdownCarret,
    level,
    classNameForTopElement,
    showMenu,
}) => {
    return (
        <ul
            className={`level${level} ${
                level === 0 && classNameForTopElement
                    ? classNameForTopElement
                    : ''
            } ${showMenu ? 'showMenu' : ''}`}>
            {menuItemsWithActiveField.map((menuItem, index) => {
                return (
                    <NavListItem
                        key={index}
                        menuItem={menuItem}
                        activeLocale={activeLocale}
                        Link={Link}
                        primaryLocale={primaryLocale}
                        DropdownCarret={DropdownCarret}
                        level={level}
                    />
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
    primaryLocale: string;
    activePathWithoutLocale: string;
    Link: ILink;
    DropdownCarret: IDropdownCarret;
    classNameForTopElement: string;
    showMenu?: boolean;
}> = ({
    menuItems,
    activeLocale,
    primaryLocale,
    activePathWithoutLocale,
    Link,
    DropdownCarret,
    classNameForTopElement,
    showMenu,
}) => {
    const { menuItemsWithActiveField } = addActiveFields(menuItems);
    const { menuItemsWithActivePaths } = checkforActivePaths(
        menuItemsWithActiveField,
        activePathWithoutLocale
    );

    return (
        <NavList
            menuItemsWithActiveField={menuItemsWithActivePaths}
            activeLocale={activeLocale}
            Link={Link}
            primaryLocale={primaryLocale}
            DropdownCarret={DropdownCarret}
            level={0}
            classNameForTopElement={classNameForTopElement}
            showMenu={showMenu}
        />
    );
};

export default Menu;
