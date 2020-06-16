import React, { FC, ReactElement, ReactNode } from 'react';
import { addActiveFields, checkforActivePaths, isHash } from './utils';
import { MenuItemWithActiveField, IMenuItem } from './types';

export interface ILink {
    (props: {
        children: ReactNode;
        to: string;
        [otherParams: string]: any;
    }): ReactElement;
}

export type IDropdownCarret = FC<{ active: boolean }>;

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
                    menuItem.children ? 'hasSubList' : ''
                }`}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}>
                <Link
                    to={`${
                        activeLocale === primaryLocale || isHash(menuItem.to)
                            ? ''
                            : '/' + activeLocale
                    }${menuItem.to}`}>
                    {menuItem.item[activeLocale]}
                    {menuItem.children && (
                        <DropdownCarret
                            active={
                                this.state.isHovered || menuItem.partlyActive
                            }
                        />
                    )}
                </Link>
                {menuItem.children && (
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
