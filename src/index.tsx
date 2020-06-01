import React, {
    FC,
    ReactElement,
    ReactNode,
    useState,
    useEffect,
    useRef,
} from 'react';
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

export interface ILink {
    (props: {
        children: ReactNode;
        to: string;
        [otherParams: string]: any;
    }): ReactElement;
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

const useHover = (): [
    React.MutableRefObject<HTMLDivElement | null>,
    boolean
] => {
    const [value, setValue] = useState(false);

    const ref = useRef<HTMLDivElement | null>(null);

    const handleMouseOver = () => setValue(true);
    const handleMouseOut = () => setValue(false);

    useEffect(
        () => {
            const node = ref.current;
            if (node) {
                node.addEventListener('mouseover', handleMouseOver);
                node.addEventListener('mouseout', handleMouseOut);

                return () => {
                    node.removeEventListener('mouseover', handleMouseOver);
                    node.removeEventListener('mouseout', handleMouseOut);
                };
            }
        },
        [ref.current] // Recall only if ref changes
    );

    return [ref, value];
};

const NavListItem: FC<{
    menuItem: MenuItemWithActiveField;
    activeLocale: string;
    Link: ILink;
    primaryLocale: string;
}> = ({ menuItem, Link, activeLocale, primaryLocale }) => {
    const [hoverRef, isHovered] = useHover();

    return (
        <li
            className={`${menuItem.active ? 'active ' : ''}${
                menuItem.partlyActive ? 'partlyActive' : ''
            }`}>
            <Link
                ref={hoverRef}
                to={`${
                    activeLocale === primaryLocale ? '' : '' + activeLocale
                }${menuItem.to}`}
                className={isHovered ? 'onHover' : ''}>
                {menuItem.item[activeLocale]}
            </Link>
            {menuItem.children && (
                <NavList
                    menuItemsWithActiveField={menuItem.children}
                    activeLocale={activeLocale}
                    Link={Link}
                    primaryLocale={primaryLocale}
                />
            )}
        </li>
    );
};

const NavList: FC<{
    menuItemsWithActiveField: MenuItemWithActiveField[];
    activeLocale: string;
    Link: ILink;
    primaryLocale: string;
}> = ({ menuItemsWithActiveField, activeLocale, Link, primaryLocale }) => {
    return (
        <ul>
            {menuItemsWithActiveField.map((menuItem, index) => {
                return (
                    <NavListItem
                        key={index}
                        menuItem={menuItem}
                        activeLocale={activeLocale}
                        Link={Link}
                        primaryLocale={primaryLocale}
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
}> = ({
    menuItems,
    activeLocale,
    primaryLocale,
    activePathWithoutLocale,
    Link,
}) => {
    const { menuItemsWithActiveField } = addActiveFields(menuItems);
    const { menuItemsWithActivePaths } = checkforActivePaths(
        menuItemsWithActiveField,
        activePathWithoutLocale
    );

    return (
        <>
            <NavList
                menuItemsWithActiveField={menuItemsWithActivePaths}
                activeLocale={activeLocale}
                Link={Link}
                primaryLocale={primaryLocale}
            />
        </>
    );
};

export default Menu;
