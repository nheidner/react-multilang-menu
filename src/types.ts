export interface IMenuItem {
    item: {
        en: string;
        de: string;
        [locale: string]: string;
    };
    to: string;
    children?: IMenuItem[];
}

export class MenuItemWithActiveField {
    item: {
        en: string;
        de: string;
        [locale: string]: string;
    } = { en: '', de: '' };
    to: string = '';
    children?: MenuItemWithActiveField[];
    partlyActive: boolean = false;
    active: boolean = false;
}
