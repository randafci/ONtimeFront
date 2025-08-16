import * as i0 from '@angular/core';
import { EventEmitter, ElementRef, TemplateRef } from '@angular/core';
import * as rxjs from 'rxjs';
import { Nullable } from 'primeng/ts-helpers';
import { QueryParamsHandling } from '@angular/router';
import { AnimationEvent } from '@angular/animations';
import * as i1 from '@angular/common';

/**
 * Represents a blockable user interface element.
 * @group Interface
 */
export interface BlockableUI {
    /**
     * Retrieves the blockable element associated with the UI.
     * @returns The HTML element that can be blocked.
     */
    getBlockableElement(): HTMLElement;
}

/**
 * Type of the confirm event.
 * @group Enum
 */
export enum ConfirmEventType {
    ACCEPT = 0,
    REJECT = 1,
    CANCEL = 2
}

/**
 * Represents a confirmation dialog configuration.
 * @group Interface
 */
export interface Confirmation {
    message?: string;
    key?: string;
    icon?: string;
    header?: string;
    accept?: Function;
    reject?: Function;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptIcon?: string;
    rejectIcon?: string;
    acceptVisible?: boolean;
    rejectVisible?: boolean;
    blockScroll?: boolean;
    closeOnEscape?: boolean;
    dismissableMask?: boolean;
    defaultFocus?: string;
    acceptButtonStyleClass?: string;
    rejectButtonStyleClass?: string;
    target?: EventTarget;
    acceptEvent?: EventEmitter<any>;
    rejectEvent?: EventEmitter<any>;
    acceptButtonProps?: any;
    rejectButtonProps?: any;
    closeButtonProps?: any;
    closable?: boolean;
    position?: string;
}

/**
 * Represents metadata for filtering a data set.
 * @group Interface
 */
export interface FilterMetadata {
    value?: any;
    matchMode?: string;
    operator?: string;
}

/**
 * Represents metadata for sorting.
 * @group Interface
 */
export interface SortMeta {
    field: string;
    order: number;
}

/**
 * Represents an event object for lazy loading data.
 * @group Interface
 */
export interface LazyLoadEvent {
    first?: number;
    last?: number;
    rows?: number;
    sortField?: string;
    sortOrder?: number;
    multiSortMeta?: SortMeta[];
    filters?: {
        [s: string]: FilterMetadata;
    };
    globalFilter?: any;
    forceUpdate?: () => void;
}

/**
 * Meta data for lazy load event.
 * @group Interface
 */
export interface LazyLoadMeta {
    first?: number | undefined | null;
    rows?: number | undefined | null;
    sortField?: string | string[] | null | undefined;
    sortOrder?: number | undefined | null;
    filters?: {
        [s: string]: FilterMetadata | FilterMetadata[] | undefined;
    };
    globalFilter?: string | string[] | undefined | null;
    multiSortMeta?: SortMeta[] | undefined | null;
    forceUpdate?: Function;
    last?: number | undefined | null;
}

/**
 * Defines options of Tooltip.
 * @group Interface
 */
export interface TooltipOptions {
    tooltipLabel?: string;
    tooltipPosition?: 'right' | 'left' | 'top' | 'bottom';
    tooltipEvent?: 'hover' | 'focus';
    appendTo?: HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any;
    positionStyle?: string;
    tooltipStyleClass?: string;
    tooltipZIndex?: string;
    escape?: boolean;
    disabled?: boolean;
    positionTop?: number;
    positionLeft?: number;
    showDelay?: number;
    hideDelay?: number;
    life?: number;
    id?: string;
}

/**
 * MenuItem provides the following properties.
 * @group Interface
 */
export interface MenuItem {
    label?: string;
    icon?: string;
    command?(event: MenuItemCommandEvent): void;
    url?: string;
    items?: MenuItem[];
    expanded?: boolean;
    disabled?: boolean;
    visible?: boolean;
    target?: string;
    escape?: boolean;
    routerLinkActiveOptions?: any;
    separator?: boolean;
    badge?: string;
    tooltip?: string;
    tooltipPosition?: string;
    badgeStyleClass?: string;
    style?: {
        [klass: string]: any;
    } | null | undefined;
    styleClass?: string;
    title?: string;
    id?: string;
    automationId?: any;
    tabindex?: string;
    routerLink?: any;
    queryParams?: {
        [k: string]: any;
    };
    fragment?: string;
    queryParamsHandling?: QueryParamsHandling;
    preserveFragment?: boolean;
    skipLocationChange?: boolean;
    replaceUrl?: boolean;
    iconStyle?: {
        [klass: string]: any;
    } | null | undefined;
    iconClass?: string;
    state?: {
        [k: string]: any;
    };
    tooltipOptions?: TooltipOptions;
    [key: string]: any;
}

/**
 * Custom command event
 * @see {@link MenuItem.command}
 * @group Interface
 */
export interface MenuItemCommandEvent {
    originalEvent?: Event;
    item?: MenuItem | MegaMenuItem;
    index?: number;
}

/**
 * MegaMenuItem API provides the following properties.
 * @group Interface
 */
export interface MegaMenuItem {
    label?: string;
    icon?: string;
    command?: (event?: any) => void;
    url?: string;
    items?: MenuItem[][];
    expanded?: boolean;
    disabled?: boolean;
    visible?: boolean;
    target?: string;
    routerLinkActiveOptions?: any;
    separator?: boolean;
    badge?: string;
    badgeStyleClass?: string;
    style?: any;
    styleClass?: string;
    iconStyle?: any;
    title?: string;
    id?: string;
    automationId?: any;
    tabindex?: string;
    routerLink?: any;
    queryParams?: {
        [k: string]: any;
    };
    fragment?: string;
    queryParamsHandling?: QueryParamsHandling;
    preserveFragment?: boolean;
    skipLocationChange?: boolean;
    replaceUrl?: boolean;
    state?: {
        [k: string]: any;
    };
    [key: string]: any;
}

/**
 * Deines valid options for the toast message.
 * @group Interface
 */
export interface ToastMessageOptions {
    text?: any;
    severity?: string;
    summary?: string;
    detail?: string;
    id?: any;
    key?: string;
    life?: number;
    sticky?: boolean;
    closable?: boolean;
    data?: any;
    icon?: string;
    contentStyleClass?: string;
    styleClass?: string;
    closeIcon?: string;
}

/**
 * Represents the type of overlay mode.
 * @group Type
 */
export type OverlayModeType = 'modal' | 'overlay' | undefined;

/**
 * Represents the type of direction for a responsive overlay.
 * @group Type
 */
export type ResponsiveOverlayDirectionType = 'center' | 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' | undefined;

/**
 * Represents the options for an overlay listener.
 * @group Interface
 */
export interface OverlayListenerOptions {
    type?: 'scroll' | 'outside' | 'resize' | undefined;
    mode?: OverlayModeType;
    valid?: boolean;
}

/**
 * Represents the options for a responsive overlay.
 * @group Interface
 */
export interface ResponsiveOverlayOptions {
    style?: any;
    styleClass?: string;
    contentStyle?: any;
    contentStyleClass?: string;
    breakpoint?: string;
    media?: string;
    direction?: ResponsiveOverlayDirectionType;
}

/**
 * Represents an event that occurs when an overlay is shown.
 * @group Interface
 */
export interface OverlayOnShowEvent {
    overlay?: HTMLElement | undefined;
    target?: HTMLElement | undefined;
    mode?: OverlayModeType;
}

/**
 * Represents an event that occurs before an overlay is shown.
 * @extends OverlayOnShowEvent
 * @group Interface
 */
export interface OverlayOnBeforeShowEvent extends OverlayOnShowEvent {}

/**
 * Represents an event that occurs before an overlay is hidden.
 * @extends OverlayOnBeforeShowEvent
 * @group Interface
 */
export interface OverlayOnBeforeHideEvent extends OverlayOnBeforeShowEvent {}

/**
 * Represents an event that occurs when an overlay is hidden.
 * @extends OverlayOnShowEvent
 * @group Interface
 */
export interface OverlayOnHideEvent extends OverlayOnShowEvent {}

/**
 * Represents the options for an overlay.
 * @group Interface
 */
export interface OverlayOptions {
    mode?: OverlayModeType;
    style?: any;
    styleClass?: string;
    contentStyle?: any;
    contentStyleClass?: string;
    target?: any;
    appendTo?: 'body' | HTMLElement | undefined;
    autoZIndex?: boolean;
    baseZIndex?: number;
    showTransitionOptions?: string;
    hideTransitionOptions?: string;
    hideOnEscape?: boolean;
    listener?: (event: Event, options?: OverlayListenerOptions) => boolean | void;
    responsive?: ResponsiveOverlayOptions | undefined;
    onBeforeShow?: (event?: OverlayOnBeforeShowEvent) => void;
    onShow?: (event?: OverlayOnShowEvent) => void;
    onBeforeHide?: (event?: OverlayOnBeforeHideEvent) => void;
    onHide?: (event?: OverlayOnHideEvent) => void;
    onAnimationStart?: (event?: AnimationEvent) => void;
    onAnimationDone?: (event?: AnimationEvent) => void;
}

/**
 * Options for the scroller.
 * @group Interface
 */
export interface ScrollerOptions {
    id?: string | undefined;
    style?: {
        [klass: string]: any;
    } | null | undefined;
    styleClass?: string | undefined;
    contentStyle?: {
        [klass: string]: any;
    } | null | undefined;
    contentStyleClass?: string | undefined;
    tabindex?: number | undefined;
    items?: any[];
    itemSize?: any;
    scrollHeight?: string | undefined;
    scrollWidth?: string | undefined;
    orientation?: 'vertical' | 'horizontal' | 'both';
    step?: number | undefined;
    delay?: number | undefined;
    resizeDelay?: number | undefined;
    appendOnly?: boolean;
    inline?: boolean;
    lazy?: boolean;
    disabled?: boolean;
    loaderDisabled?: boolean;
    columns?: any[] | undefined;
    showSpacer?: boolean;
    showLoader?: boolean;
    numToleratedItems?: any;
    loading?: boolean;
    autoSize?: boolean;
    trackBy?: Function;
    onLazyLoad?: Function | undefined;
    onScroll?: Function | undefined;
    onScrollIndexChange?: Function | undefined;
}

/**
 * Represents an option item.
 * @group Interface
 */
export interface SelectItem<T = any> {
    label?: string;
    value: T;
    styleClass?: string;
    icon?: string;
    title?: string;
    disabled?: boolean;
}

/**
 * Represents a group of select items.
 * @group Interface
 */
export interface SelectItemGroup<T = any> {
    label: string;
    value?: any;
    items: SelectItem<T>[];
}

/**
 * Represents an event triggered when sorting is applied.
 * @group Interface
 */
export interface SortEvent {
    data?: any[];
    mode?: string;
    field?: string;
    order?: number;
    multiSortMeta?: SortMeta[];
}

/**
 * Represents the state of a table component.
 * @group Interface
 */
export interface TableState {
    first?: number;
    rows?: number;
    sortField?: string;
    sortOrder?: number;
    multiSortMeta?: SortMeta[];
    filters?: {
        [s: string]: FilterMetadata | FilterMetadata[];
    };
    columnWidths?: string;
    tableWidth?: string;
    wrapperWidth?: string;
    selection?: any;
    columnOrder?: string[];
    expandedRowKeys?: {
        [s: string]: boolean;
    };
}

/**
 * Represents a set of translated strings used in a component or application.
 * @group Interface
 */
export interface Translation {
    startsWith?: string;
    contains?: string;
    notContains?: string;
    endsWith?: string;
    equals?: string;
    completed?: string;
    notEquals?: string;
    noFilter?: string;
    lt?: string;
    lte?: string;
    gt?: string;
    gte?: string;
    is?: string;
    isNot?: string;
    before?: string;
    after?: string;
    dateIs?: string;
    dateIsNot?: string;
    dateBefore?: string;
    dateAfter?: string;
    clear?: string;
    apply?: string;
    matchAll?: string;
    matchAny?: string;
    addRule?: string;
    removeRule?: string;
    accept?: string;
    reject?: string;
    choose?: string;
    upload?: string;
    cancel?: string;
    fileSizeTypes?: string[];
    dayNames?: string[];
    dayNamesShort?: string[];
    dayNamesMin?: string[];
    monthNames?: string[];
    monthNamesShort?: string[];
    dateFormat?: string;
    firstDayOfWeek?: number;
    today?: string;
    weekHeader?: string;
    weak?: string;
    medium?: string;
    strong?: string;
    passwordPrompt?: string;
    emptyMessage?: string;
    emptyFilterMessage?: string;
    fileChosenMessage?: string;
    noFileChosenMessage?: string;
    pending?: string;
    chooseYear?: string;
    chooseMonth?: string;
    chooseDate?: string;
    prevDecade?: string;
    nextDecade?: string;
    prevYear?: string;
    nextYear?: string;
    prevMonth?: string;
    nextMonth?: string;
    prevHour?: string;
    nextHour?: string;
    prevMinute?: string;
    nextMinute?: string;
    prevSecond?: string;
    nextSecond?: string;
    am?: string;
    pm?: string;
    searchMessage?: string;
    selectionMessage?: string;
    emptySelectionMessage?: string;
    emptySearchMessage?: string;
    aria?: Aria;
}

/**
 * Represents a set of translated HTML attributes used in a component or application.
 * @group Interface
 */
export interface Aria {
    trueLabel?: string;
    falseLabel?: string;
    nullLabel?: string;
    star?: string;
    stars?: string;
    selectAll?: string;
    unselectAll?: string;
    close?: string;
    previous?: string;
    next?: string;
    navigation?: string;
    scrollTop?: string;
    moveTop?: string;
    moveUp?: string;
    moveDown?: string;
    moveBottom?: string;
    moveToTarget?: string;
    moveToSource?: string;
    moveAllToTarget?: string;
    moveAllToSource?: string;
    pageLabel?: string;
    firstPageLabel?: string;
    lastPageLabel?: string;
    nextPageLabel?: string;
    prevPageLabel?: string;
    rowsPerPageLabel?: string;
    previousPageLabel?: string;
    jumpToPageDropdownLabel?: string;
    jumpToPageInputLabel?: string;
    selectRow?: string;
    unselectRow?: string;
    expandRow?: string;
    collapseRow?: string;
    showFilterMenu?: string;
    hideFilterMenu?: string;
    filterOperator?: string;
    filterConstraint?: string;
    editRow?: string;
    saveEdit?: string;
    cancelEdit?: string;
    listView?: string;
    gridView?: string;
    slide?: string;
    slideNumber?: string;
    zoomImage?: string;
    zoomIn?: string;
    zoomOut?: string;
    rotateRight?: string;
    rotateLeft?: string;
    listLabel?: string;
    selectColor?: string;
    removeLabel?: string;
    browseFiles?: string;
    maximizeLabel?: string;
}

/**
 * Represents a node in a tree data structure.
 * @group Interface
 */
export interface TreeNode<T = any> {
    checked?: boolean;
    label?: string;
    data?: T;
    icon?: string;
    expandedIcon?: string;
    collapsedIcon?: string;
    children?: TreeNode<T>[];
    leaf?: boolean;
    expanded?: boolean;
    type?: string;
    parent?: TreeNode<T>;
    partialSelected?: boolean;
    style?: any;
    styleClass?: string;
    draggable?: boolean;
    droppable?: boolean;
    selectable?: boolean;
    key?: string;
    loading?: boolean;
}

/**
 * Represents the event data for a tree node drag operation.
 * @group Interface
 */
export interface TreeNodeDragEvent {
    tree?: any;
    node?: TreeNode<any>;
    subNodes?: TreeNode<any>[];
    index?: number;
    scope?: any;
}

/**
 * Tree table node element.
 * @extends TreeNode
 * @group Interface
 */
export interface TreeTableNode<T = any> extends TreeNode {
    originalEvent?: Event;
    rowNode?: any;
    node?: TreeNode<T>;
    type?: string;
    index?: number;
    level?: number;
    visible?: boolean;
}

/**
 * Filter match modes for table filtering
 * @group Enum
 */
export enum FilterMatchMode {
    STARTS_WITH = "startsWith",
    CONTAINS = "contains",
    NOT_CONTAINS = "notContains",
    ENDS_WITH = "endsWith",
    EQUALS = "equals",
    NOT_EQUALS = "notEquals",
    IN = "in",
    LESS_THAN = "lt",
    LESS_THAN_OR_EQUAL_TO = "lte",
    GREATER_THAN = "gt",
    GREATER_THAN_OR_EQUAL_TO = "gte",
    BETWEEN = "between",
    IS = "is",
    IS_NOT = "isNot",
    BEFORE = "before",
    AFTER = "after",
    DATE_IS = "dateIs",
    DATE_IS_NOT = "dateIsNot",
    DATE_BEFORE = "dateBefore",
    DATE_AFTER = "dateAfter"
}

/**
 * Filter operators for table filtering
 * @group Enum
 */
export enum FilterOperator {
    AND = "and",
    OR = "or"
}

/**
 * Translation keys for internationalization
 * @group Enum
 */
export enum TranslationKeys {
    STARTS_WITH = "startsWith",
    CONTAINS = "contains",
    NOT_CONTAINS = "notContains",
    ENDS_WITH = "endsWith",
    EQUALS = "equals",
    NOT_EQUALS = "notEquals",
    NO_FILTER = "noFilter",
    LT = "lt",
    LTE = "lte",
    GT = "gt",
    GTE = "gte",
    IS = "is",
    IS_NOT = "isNot",
    BEFORE = "before",
    AFTER = "after",
    CLEAR = "clear",
    APPLY = "apply",
    MATCH_ALL = "matchAll",
    MATCH_ANY = "matchAny",
    ADD_RULE = "addRule",
    REMOVE_RULE = "removeRule",
    ACCEPT = "accept",
    REJECT = "reject",
    CHOOSE = "choose",
    UPLOAD = "upload",
    CANCEL = "cancel",
    PENDING = "pending",
    FILE_SIZE_TYPES = "fileSizeTypes",
    DAY_NAMES = "dayNames",
    DAY_NAMES_SHORT = "dayNamesShort",
    DAY_NAMES_MIN = "dayNamesMin",
    MONTH_NAMES = "monthNames",
    MONTH_NAMES_SHORT = "monthNamesShort",
    FIRST_DAY_OF_WEEK = "firstDayOfWeek",
    TODAY = "today",
    WEEK_HEADER = "weekHeader",
    WEAK = "weak",
    MEDIUM = "medium",
    STRONG = "strong",
    PASSWORD_PROMPT = "passwordPrompt",
    EMPTY_MESSAGE = "emptyMessage",
    EMPTY_FILTER_MESSAGE = "emptyFilterMessage",
    SHOW_FILTER_MENU = "showFilterMenu",
    HIDE_FILTER_MENU = "hideFilterMenu",
    SELECTION_MESSAGE = "selectionMessage",
    ARIA = "aria",
    SELECT_COLOR = "selectColor",
    BROWSE_FILES = "browseFiles"
}

/**
 * PrimeNG icons
 * @group Enum
 */
export enum PrimeIcons {
    ADDRESS_BOOK = "pi pi-address-book",
    ALIGN_CENTER = "pi pi-align-center",
    ALIGN_JUSTIFY = "pi pi-align-justify",
    ALIGN_LEFT = "pi pi-align-left",
    ALIGN_RIGHT = "pi pi-align-right",
    AMAZON = "pi pi-amazon",
    ANDROID = "pi pi-android",
    ANGLE_DOUBLE_DOWN = "pi pi-angle-double-down",
    ANGLE_DOUBLE_LEFT = "pi pi-angle-double-left",
    ANGLE_DOUBLE_RIGHT = "pi pi-angle-double-right",
    ANGLE_DOUBLE_UP = "pi pi-angle-double-up",
    ANGLE_DOWN = "pi pi-angle-down",
    ANGLE_LEFT = "pi pi-angle-left",
    ANGLE_RIGHT = "pi pi-angle-right",
    ANGLE_UP = "pi pi-angle-up",
    APPLE = "pi pi-apple",
    ARROWS_ALT = "pi pi-arrows-alt",
    ARROW_CIRCLE_DOWN = "pi pi-arrow-circle-down",
    ARROW_CIRCLE_LEFT = "pi pi-arrow-circle-left",
    ARROW_CIRCLE_RIGHT = "pi pi-arrow-circle-right",
    ARROW_CIRCLE_UP = "pi pi-arrow-circle-up",
    ARROW_DOWN = "pi pi-arrow-down",
    ARROW_DOWN_LEFT = "pi pi-arrow-down-left",
    ARROW_DOWN_LEFT_AND_ARROW_UP_RIGHT_TO_CENTER = "pi pi-arrow-down-left-and-arrow-up-right-to-center",
    ARROW_DOWN_RIGHT = "pi pi-arrow-down-right",
    ARROW_LEFT = "pi pi-arrow-left",
    ARROW_RIGHT_ARROW_LEFT = "pi pi-arrow-right-arrow-left",
    ARROW_RIGHT = "pi pi-arrow-right",
    ARROW_UP = "pi pi-arrow-up",
    ARROW_UP_LEFT = "pi pi-arrow-up-left",
    ARROW_UP_RIGHT = "pi pi-arrow-up-right",
    ARROW_UP_RIGHT_AND_ARROW_DOWN_LEFT_FROM_CENTER = "pi pi-arrow-up-right-and-arrow-down-left-from-center",
    ARROWS_H = "pi pi-arrows-h",
    ARROWS_V = "pi pi-arrows-v",
    ASTERISK = "pi pi-asterisk",
    AT = "pi pi-at",
    BACKWARD = "pi pi-backward",
    BAN = "pi pi-ban",
    BARCODE = "pi pi-barcode",
    BARS = "pi pi-bars",
    BELL = "pi pi-bell",
    BELL_SLASH = "pi pi-bell-slash",
    BITCOIN = "pi pi-bitcoin",
    BOLT = "pi pi-bolt",
    BOOK = "pi pi-book",
    BOOKMARK = "pi pi-bookmark",
    BOOKMARK_FILL = "pi pi-bookmark-fill",
    BOX = "pi pi-box",
    BRIEFCASE = "pi pi-briefcase",
    BUILDING = "pi pi-building",
    BUILDING_COLUMNS = "pi pi-building-columns",
    BULLSEYE = "pi pi-bullseye",
    CALCULATOR = "pi pi-calculator",
    CALENDAR = "pi pi-calendar",
    CALENDAR_CLOCK = "pi pi-calendar-clock",
    CALENDAR_MINUS = "pi pi-calendar-minus",
    CALENDAR_PLUS = "pi pi-calendar-plus",
    CALENDAR_TIMES = "pi pi-calendar-times",
    CAMERA = "pi pi-camera",
    CAR = "pi pi-car",
    CARET_DOWN = "pi pi-caret-down",
    CARET_LEFT = "pi pi-caret-left",
    CARET_RIGHT = "pi pi-caret-right",
    CARET_UP = "pi pi-caret-up",
    CART_ARROW_DOWN = "pi pi-cart-arrow-down",
    CART_MINUS = "pi pi-cart-minus",
    CART_PLUS = "pi pi-cart-plus",
    CHART_BAR = "pi pi-chart-bar",
    CHART_LINE = "pi pi-chart-line",
    CHART_PIE = "pi pi-chart-pie",
    CHART_SCATTER = "pi pi-chart-scatter",
    CHECK = "pi pi-check",
    CHECK_CIRCLE = "pi pi-check-circle",
    CHECK_SQUARE = "pi pi-check-square",
    CHEVRON_CIRCLE_DOWN = "pi pi-chevron-circle-down",
    CHEVRON_CIRCLE_LEFT = "pi pi-chevron-circle-left",
    CHEVRON_CIRCLE_RIGHT = "pi pi-chevron-circle-right",
    CHEVRON_CIRCLE_UP = "pi pi-chevron-circle-up",
    CHEVRON_DOWN = "pi pi-chevron-down",
    CHEVRON_LEFT = "pi pi-chevron-left",
    CHEVRON_RIGHT = "pi pi-chevron-right",
    CHEVRON_UP = "pi pi-chevron-up",
    CIRCLE = "pi pi-circle",
    CIRCLE_FILL = "pi pi-circle-fill",
    CLIPBOARD = "pi pi-clipboard",
    CLOCK = "pi pi-clock",
    CLONE = "pi pi-clone",
    CLOUD = "pi pi-cloud",
    CLOUD_DOWNLOAD = "pi pi-cloud-download",
    CLOUD_UPLOAD = "pi pi-cloud-upload",
    CODE = "pi pi-code",
    COG = "pi pi-cog",
    COMMENT = "pi pi-comment",
    COMMENTS = "pi pi-comments",
    COMPASS = "pi pi-compass",
    COPY = "pi pi-copy",
    CREDIT_CARD = "pi pi-credit-card",
    CROWN = "pi pi-crown",
    DATABASE = "pi pi-database",
    DESKTOP = "pi pi-desktop",
    DELETE_LEFT = "pi pi-delete-left",
    DIRECTIONS = "pi pi-directions",
    DIRECTIONS_ALT = "pi pi-directions-alt",
    DISCORD = "pi pi-discord",
    DOLLAR = "pi pi-dollar",
    DOWNLOAD = "pi pi-download",
    EJECT = "pi pi-eject",
    ELLIPSIS_H = "pi pi-ellipsis-h",
    ELLIPSIS_V = "pi pi-ellipsis-v",
    ENVELOPE = "pi pi-envelope",
    EQUALS = "pi pi-equals",
    ERASER = "pi pi-eraser",
    ETHEREUM = "pi pi-ethereum",
    EURO = "pi pi-euro",
    EXCLAMATION_CIRCLE = "pi pi-exclamation-circle",
    EXCLAMATION_TRIANGLE = "pi pi-exclamation-triangle",
    EXPAND = "pi pi-expand",
    EXTERNAL_LINK = "pi pi-external-link",
    EYE = "pi pi-eye",
    EYE_SLASH = "pi pi-eye-slash",
    FACE_SMILE = "pi pi-face-smile",
    FACEBOOK = "pi pi-facebook",
    FAST_BACKWARD = "pi pi-fast-backward",
    FAST_FORWARD = "pi pi-fast-forward",
    FILE = "pi pi-file",
    FILE_ARROW_UP = "pi pi-file-arrow-up",
    FILE_CHECK = "pi pi-file-check",
    FILE_EDIT = "pi pi-file-edit",
    FILE_IMPORT = "pi pi-file-import",
    FILE_PDF = "pi pi-file-pdf",
    FILE_PLUS = "pi pi-file-plus",
    FILE_EXCEL = "pi pi-file-excel",
    FILE_EXPORT = "pi pi-file-export",
    FILE_WORD = "pi pi-file-word",
    FILTER = "pi pi-filter",
    FILTER_FILL = "pi pi-filter-fill",
    FILTER_SLASH = "pi pi-filter-slash",
    FLAG = "pi pi-flag",
    FLAG_FILL = "pi pi-flag-fill",
    FOLDER = "pi pi-folder",
    FOLDER_OPEN = "pi pi-folder-open",
    FOLDER_PLUS = "pi pi-folder-plus",
    FORWARD = "pi pi-forward",
    GAUGE = "pi pi-gauge",
    GIFT = "pi pi-gift",
    GITHUB = "pi pi-github",
    GLOBE = "pi pi-globe",
    GOOGLE = "pi pi-google",
    GRADUATION_CAP = "pi pi-graduation-cap",
    HAMMER = "pi pi-hammer",
    HASHTAG = "pi pi-hashtag",
    HEADPHONES = "pi pi-headphones",
    HEART = "pi pi-heart",
    HEART_FILL = "pi pi-heart-fill",
    HISTORY = "pi pi-history",
    HOME = "pi pi-home",
    HOURGLASS = "pi pi-hourglass",
    ID_CARD = "pi pi-id-card",
    IMAGE = "pi pi-image",
    IMAGES = "pi pi-images",
    INBOX = "pi pi-inbox",
    INDIAN_RUPEE = "pi pi-indian-rupee",
    INFO = "pi pi-info",
    INFO_CIRCLE = "pi pi-info-circle",
    INSTAGRAM = "pi pi-instagram",
    KEY = "pi pi-key",
    LANGUAGE = "pi pi-language",
    LIGHTBULB = "pi pi-lightbulb",
    LINK = "pi pi-link",
    LINKEDIN = "pi pi-linkedin",
    LIST = "pi pi-list",
    LIST_CHECK = "pi pi-list-check",
    LOCK = "pi pi-lock",
    LOCK_OPEN = "pi pi-lock-open",
    MAP = "pi pi-map",
    MAP_MARKER = "pi pi-map-marker",
    MARS = "pi pi-mars",
    MEGAPHONE = "pi pi-megaphone",
    MICROCHIP = "pi pi-microchip",
    MICROCHIP_AI = "pi pi-microchip-ai",
    MICROPHONE = "pi pi-microphone",
    MICROSOFT = "pi pi-microsoft",
    MINUS = "pi pi-minus",
    MINUS_CIRCLE = "pi pi-minus-circle",
    MOBILE = "pi pi-mobile",
    MONEY_BILL = "pi pi-money-bill",
    MOON = "pi pi-moon",
    OBJECTS_COLUMN = "pi pi-objects-column",
    PALETTE = "pi pi-palette",
    PAPERCLIP = "pi pi-paperclip",
    PAUSE = "pi pi-pause",
    PAUSE_CIRCLE = "pi pi-pause-circle",
    PAYPAL = "pi pi-paypal",
    PEN_TO_SQUARE = "pi pi-pen-to-square",
    PENCIL = "pi pi-pencil",
    PERCENTAGE = "pi pi-percentage",
    PHONE = "pi pi-phone",
    PINTEREST = "pi pi-pinterest",
    PLAY = "pi pi-play",
    PLAY_CIRCLE = "pi pi-play-circle",
    PLUS = "pi pi-plus",
    PLUS_CIRCLE = "pi pi-plus-circle",
    POUND = "pi pi-pound",
    POWER_OFF = "pi pi-power-off",
    PRIME = "pi pi-prime",
    PRINT = "pi pi-print",
    QRCODE = "pi pi-qrcode",
    QUESTION = "pi pi-question",
    QUESTION_CIRCLE = "pi pi-question-circle",
    RECEIPT = "pi pi-receipt",
    REDDIT = "pi pi-reddit",
    REFRESH = "pi pi-refresh",
    REPLAY = "pi pi-replay",
    REPLY = "pi pi-reply",
    SAVE = "pi pi-save",
    SEARCH = "pi pi-search",
    SEARCH_MINUS = "pi pi-search-minus",
    SEARCH_PLUS = "pi pi-search-plus",
    SEND = "pi pi-send",
    SERVER = "pi pi-server",
    SHARE_ALT = "pi pi-share-alt",
    SHIELD = "pi pi-shield",
    SHOP = "pi pi-shop",
    SHOPPING_BAG = "pi pi-shopping-bag",
    SHOPPING_CART = "pi pi-shopping-cart",
    SIGN_IN = "pi pi-sign-in",
    SIGN_OUT = "pi pi-sign-out",
    SITEMAP = "pi pi-sitemap",
    SLACK = "pi pi-slack",
    SLIDERS_H = "pi pi-sliders-h",
    SLIDERS_V = "pi pi-sliders-v",
    SORT = "pi pi-sort",
    SORT_ALPHA_DOWN = "pi pi-sort-alpha-down",
    SORT_ALPHA_DOWN_ALT = "pi pi-sort-alpha-down-alt",
    SORT_ALPHA_UP = "pi pi-sort-alpha-up",
    SORT_ALPHA_UP_ALT = "pi pi-sort-alpha-up-alt",
    SORT_ALT = "pi pi-sort-alt",
    SORT_ALT_SLASH = "pi pi-sort-alt-slash",
    SORT_AMOUNT_DOWN = "pi pi-sort-amount-down",
    SORT_AMOUNT_DOWN_ALT = "pi pi-sort-amount-down-alt",
    SORT_AMOUNT_UP = "pi pi-sort-amount-up",
    SORT_AMOUNT_UP_ALT = "pi pi-sort-amount-up-alt",
    SORT_DOWN = "pi pi-sort-down",
    SORT_DOWN_FILL = "pi pi-sort-down-fill",
    SORT_NUMERIC_DOWN = "pi pi-sort-numeric-down",
    SORT_NUMERIC_DOWN_ALT = "pi pi-sort-numeric-down-alt",
    SORT_NUMERIC_UP = "pi pi-sort-numeric-up",
    SORT_NUMERIC_UP_ALT = "pi pi-sort-numeric-up-alt",
    SORT_UP = "pi pi-sort-up",
    SORT_UP_FILL = "pi pi-sort-up-fill",
    SPARKLES = "pi pi-sparkles",
    SPINNER = "pi pi-spinner",
    SPINNER_DOTTED = "pi pi-spinner-dotted",
    STAR = "pi pi-star",
    STAR_FILL = "pi pi-star-fill",
    STAR_HALF = "pi pi-star-half",
    STAR_HALF_FILL = "pi pi-star-half-fill",
    STEP_BACKWARD = "pi pi-step-backward",
    STEP_BACKWARD_ALT = "pi pi-step-backward-alt",
    STEP_FORWARD = "pi pi-step-forward",
    STEP_FORWARD_ALT = "pi pi-step-forward-alt",
    STOP = "pi pi-stop",
    STOP_CIRCLE = "pi pi-stop-circle",
    STOPWATCH = "pi pi-stopwatch",
    SUN = "pi pi-sun",
    SYNC = "pi pi-sync",
    TABLE = "pi pi-table",
    TABLET = "pi pi-tablet",
    TAG = "pi pi-tag",
    TAGS = "pi pi-tags",
    TELEGRAM = "pi pi-telegram",
    TH_LARGE = "pi pi-th-large",
    THUMBS_DOWN = "pi pi-thumbs-down",
    THUMBS_DOWN_FILL = "pi pi-thumbs-down-fill",
    THUMBS_UP = "pi pi-thumbs-up",
    THUMBS_UP_FILL = "pi pi-thumbs-up-fill",
    THUMBTACK = "pi pi-thumbtack",
    TICKET = "pi pi-ticket",
    TIKTOK = "pi pi-tiktok",
    TIMES = "pi pi-times",
    TIMES_CIRCLE = "pi pi-times-circle",
    TRASH = "pi pi-trash",
    TROPHY = "pi pi-trophy",
    TRUCK = "pi pi-truck",
    TURKISH_LIRA = "pi pi-turkish-lira",
    TWITCH = "pi pi-twitch",
    TWITTER = "pi pi-twitter",
    UNDO = "pi pi-undo",
    UNLOCK = "pi pi-unlock",
    UPLOAD = "pi pi-upload",
    USER = "pi pi-user",
    USER_EDIT = "pi pi-user-edit",
    USER_MINUS = "pi pi-user-minus",
    USER_PLUS = "pi pi-user-plus",
    USERS = "pi pi-users",
    VENUS = "pi pi-venus",
    VERIFIED = "pi pi-verified",
    VIDEO = "pi pi-video",
    VIMEO = "pi pi-vimeo",
    VOLUME_DOWN = "pi pi-volume-down",
    VOLUME_OFF = "pi pi-volume-off",
    VOLUME_UP = "pi pi-volume-up",
    WALLET = "pi pi-wallet",
    WAREHOUSE = "pi pi-warehouse",
    WAVE_PULSE = "pi pi-wave-pulse",
    WHATSAPP = "pi pi-whatsapp",
    WIFI = "pi pi-wifi",
    WINDOW_MAXIMIZE = "pi pi-window-maximize",
    WINDOW_MINIMIZE = "pi pi-window-minimize",
    WRENCH = "pi pi-wrench",
    YOUTUBE = "pi pi-youtube"
}

// Services and Components
export class ConfirmationService {
    static ɵfac: i0.ɵɵFactoryDeclaration<ConfirmationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ConfirmationService>;
}

export class ContextMenuService {
    static ɵfac: i0.ɵɵFactoryDeclaration<ContextMenuService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ContextMenuService>;
}

export class FilterService {
    static ɵfac: i0.ɵɵFactoryDeclaration<FilterService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FilterService>;
}

export class MessageService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MessageService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MessageService>;
}

export class OverlayService {
    static ɵfac: i0.ɵɵFactoryDeclaration<OverlayService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<OverlayService>;
}

export class TreeDragDropService {
    static ɵfac: i0.ɵɵFactoryDeclaration<TreeDragDropService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TreeDragDropService>;
}

export class Header {
    static ɵfac: i0.ɵɵFactoryDeclaration<Header, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Header, "p-header", never, {}, {}, never, ["*"], false, never>;
}

export class Footer {
    static ɵfac: i0.ɵɵFactoryDeclaration<Footer, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Footer, "p-footer", never, {}, {}, never, ["*"], false, never>;
}

export class PrimeTemplate {
    static ɵfac: i0.ɵɵFactoryDeclaration<PrimeTemplate, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PrimeTemplate, "[pTemplate]", never, { "type": { "alias": "type"; "required": false; }; "name": { "alias": "pTemplate"; "required": false; }; }, {}, never, never, true, never>;
}

export class SharedModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<SharedModule, [typeof Header, typeof Footer], [typeof i1.CommonModule, typeof PrimeTemplate], [typeof Header, typeof Footer, typeof PrimeTemplate]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule>;
}