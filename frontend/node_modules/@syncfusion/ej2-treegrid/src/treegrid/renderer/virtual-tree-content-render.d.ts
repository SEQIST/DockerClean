import { Cell, CellType, Column, NotifyArgs, SentinelType } from '@syncfusion/ej2-grids';
import { Offsets, VirtualInfo, ServiceLocator, IGrid, IModelGenerator } from '@syncfusion/ej2-grids';
import { VirtualContentRenderer } from '@syncfusion/ej2-grids';
import { InterSectionObserver } from '@syncfusion/ej2-grids';
/**
 * VirtualTreeContentRenderer
 *
 * @hidden
 */
export declare class VirtualTreeContentRenderer extends VirtualContentRenderer {
    getModelGenerator(): IModelGenerator<Column>;
    constructor(parent: IGrid, locator?: ServiceLocator);
    private isExpandCollapse;
    private observers;
    private translateY;
    private maxiPage;
    private rowPosition;
    private addRowIndex;
    private dataRowIndex;
    private recordAdded;
    /** @hidden */
    startIndex: number;
    private endIndex;
    private totalRecords;
    private contents;
    private fn;
    private preTranslate;
    private isRemoteExpand;
    private previousInfo;
    /** @hidden */
    isDataSourceChanged: boolean;
    /**
     * Retrieves the row element for a given row index.
     *
     * @param {number} index - The index of the row to retrieve.
     * @returns {Element} The row element at the specified index.
     */
    getRowByIndex(index: number): Element;
    /**
     * Retrieves the frozen right virtual row element by its index.
     *
     * @param {number} index - The index of the row to be retrieved.
     * @returns {Element} The DOM element representing the frozen right virtual row.
     */
    getFrozenRightVirtualRowByIndex(index: number): Element;
    /**
     * Retrieves the row or record from the virtual tree grid based on the provided index.
     * Considers conditions such as frozen rows and pagination for accurate retrieval.
     *
     * @param {number} index - The index of the desired row or record.
     * @param {boolean} isMovable - Specifies if the content is movable.
     * @param {boolean} [isRowObject] - Optional. Determines if the return value should be a row object.
     * @param {boolean} [isFrozenRight] - Optional. Used for determining frozen right rows.
     * @returns {Element | Object} - The HTML element or row object.
     */
    getRowCollection(index: number, isMovable: boolean, isRowObject?: boolean, isFrozenRight?: boolean): Element | Object;
    /**
     * @hidden
     * @returns {void}
     */
    addEventListener(): void;
    /**
     * Handles virtual scrolling actions based on the provided arguments.
     *
     * @param {Object} args - The argument object.
     * @param {boolean} args.setTop - Determines if the virtual scroll position should reset to top.
     * @param {boolean} args.isExpandCollapse - Determines if the action is part of an expand/collapse operation.
     * @returns {void}
     */
    private virtualOtherAction;
    /**
     * Modifies the index based on various conditions such as record addition, deletion, or data source changes.
     *
     * @private
     * @param {Object} args - Contains parameters for the current operation.
     * @param {number} args.startIndex - The starting index for the modification.
     * @param {number} args.endIndex - The ending index for the modification.
     * @param {number} args.count - The number of items affected in the operation.
     * @param {string} args.requestType - The type of request, such as 'insert', 'delete', or 'update'.
     * @returns {void}
     */
    private indexModifier;
    /**
     * Handles the addition or removal of event listeners for virtual scrolling in a TreeGrid.
     *
     * @param {string} action - The action to perform, either 'on' or 'off'.
     * @returns {void}
     */
    eventListener(action: string): void;
    /**
     * Handles cell focus transitions in a virtualized tree grid component
     * when a keyboard event is triggered.
     *
     * @param {KeyboardEventArgs} e - The keyboard event arguments that contain
     *                                information about the key action.
     * @returns {void}
     */
    private cellFocus;
    /**
     * Handles the data ready event for the virtual tree grid content renderer.
     *
     * @param {NotifyArgs} [e] - The notification arguments that contain information about the data.
     * @returns {void}
     */
    protected onDataReady(e?: NotifyArgs): void;
    /**
     * Renders the table for the virtual tree content. It sets up a new `TreeInterSectionObserver`
     * based on certain conditions regarding the data source and counting requirements.
     *
     * @returns {void}
     */
    renderTable(): void;
    /**
     * Calculates the translateY value for a virtual tree grid based on the scroll top, container height,
     * and additional virtual scrolling information. This method specifically handles logic for remote
     * data sources and ensures smooth scrolling with respect to expansion states.
     *
     * @param {number} sTop - The scroll top position.
     * @param {number} cHeight - The height of the container.
     * @param {VirtualInfo} [info] - Optional virtual scrolling information.
     * @param {boolean} [isOnenter] - Flag indicating if the scroll event is on enter.
     * @returns {number} The calculated translateY value.
     */
    protected getTranslateY(sTop: number, cHeight: number, info?: VirtualInfo, isOnenter?: boolean): number;
    /**
     * Handles the dataBound event to calculate and set the initial row top position for the grid.
     *
     * @returns {void}
     */
    private dataBoundEvent;
    /**
     * Handles the row selection event for virtual tree grid rows.
     * It invokes the base class's rowSelected method and notifies
     * the parent component about a virtual transformation change.
     *
     * @param {RowSelectEventArgs} args - The arguments related to the row selection event.
     * @returns {void} This method does not return a value.
     */
    private rowSelectedEvent;
    /**
     * Handles virtual row selection in TreeGrid.
     *
     * @param {Object} args - The argument object containing the selected index.
     * @param {number} args.selectedIndex - The index of the row to be selected.
     *
     * @returns {void}
     */
    private toSelectVirtualRow;
    /**
     * Refreshes the cells for the given row object by regenerating them.
     *
     * @param {Row<Column>} rowObj - The row object for which the cells need to be refreshed.
     * @returns {void} This method does not return any value.
     */
    private refreshCell;
    /**
     * Generates an array of cells for each column in the parent.
     *
     * @returns {Cell<Column>[]} An array of cells for the corresponding columns.
     */
    generateCells(): Cell<Column>[];
    /**
     * Generates a cell object with provided column and row configurations.
     *
     * @param {Column} col - The Column object which holds the column configuration.
     * @param {string} [rowId] - An optional string that represents the row ID.
     * @param {CellType} [cellType] - An optional CellType enum to specify the type of the cell.
     * @param {number} [colSpan] - An optional number to specify the column span of the cell.
     * @param {number} [oIndex] - An optional number for the order index of the cell.
     * @param {Object} [foreignKeyData] - An optional object for foreign key data associated with the column.
     *
     * @returns {Cell<Column>} Returns a newly created Cell object of type Column.
     */
    generateCell(col: Column, rowId?: string, cellType?: CellType, colSpan?: number, oIndex?: number, foreignKeyData?: Object): Cell<Column>;
    /**
     * Begins the edit operation for a specified row in the grid.
     * Updates the `editedRowIndex` and assigns row data to the event data.
     *
     * @param {{ data: Object, index: number }} e - An object containing the row data and index.
     * @param {Object} e.data - The data of the row to be edited.
     * @param {number} e.index - The index of the row to be edited.
     * @returns {void}
     */
    private beginEdit;
    /**
     * Begins the process of adding a new row in the tree grid.
     *
     * @param {Object} args - The arguments for adding a new row.
     * @param {boolean} args.startEdit - A flag indicating whether to start editing.
     * @returns {void}
     */
    private beginAdd;
    /**
     * Restores the edit state of the tree grid content. This method calls the
     * base class method to handle the restoration logic.
     *
     * @returns {void} This method does not return any value.
     */
    private restoreEditState;
    /**
     * Resets the edit state if certain conditions are met.
     *
     * @returns {void}
     */
    private resetIseditValue;
    /**
     * Handles the successful editing operation when virtual scrolling is enabled.
     * Checks if a row has been added to the tree grid and sets the `recordAdded` flag accordingly.
     *
     * @returns {void}
     */
    private virtualEditSuccess;
    /**
     * Cancels the edit operation for the provided data.
     *
     * @param {Object} args - The arguments containing the data to cancel edit for.
     * @param {Object} args.data - The specific data object for which the edit operation needs to be canceled.
     * @returns {void}
     */
    private cancelEdit;
    /**
     * Handles the action of selecting a row when the context menu is opened.
     *
     * @param {Object} args - An object containing related parameters.
     * @param {boolean} args.isOpen - A flag indicating whether the context menu is open.
     * @returns {void} This method does not return any value.
     */
    private toSelectRowOnContextOpen;
    /**
     * Restores a new row in the grid when necessary by adding it back to the content.
     *
     * @returns {void} This method does not return any value.
     */
    private restoreNewRow;
    /**
     * Retrieves virtual data for operations like adding or canceling rows in the grid.
     *
     * @param {Object} data - An object containing properties to determine the virtual data processing.
     * @param {Object} data.virtualData - The virtual data object to be processed.
     * @param {boolean} data.isAdd - A boolean indicating if the operation is an addition.
     * @param {boolean} data.isCancel - A boolean indicating if the operation is a cancellation.
     * @returns {void} This method does not return any value.
     */
    private getData;
    /**
     * Initiates the beginning of an action within the tree grid component.
     * This method is invoked before any action is performed, allowing for
     * any necessary modifications or cancellations of the upcoming action.
     *
     * @param {NotifyArgs} args - The arguments associated with the action,
     * providing context and specifics about what is being commenced.
     * @returns {void}
     */
    protected handleActionBegin(args: NotifyArgs): void;
    /**
     * Handles the completion of various actions, such as adding a new row.
     * Updates row positions and indexes based on the action completed.
     *
     * @param {NotifyArgs} args - An object containing the details of the completed action.
     *               Specifically, it includes the `requestType` which determines the type
     *               of action that was completed.
     * @returns {void} This method does not return any value.
     */
    private onActionComplete;
    /**
     * Creates a callback function to be executed during virtual scrolling actions.
     * This function handles the adjustment of virtual elements and rendering logic,
     * particularly optimizing for non-IE browsers, wheel events, and virtual masks.
     *
     * @returns {Function} A function that handles scrolling and adjusts table rendering.
     * @param {HTMLElement} element - The HTML element involved in the action.
     * @param {SentinelType} current - The type of sentinel indicating the scroll.
     * @param {string} direction - The scroll direction.
     * @param {Offsets} e - The offset values indicating the current scroll position.
     * @param {boolean} isWheel - Indicates if the scrolling was initiated by a mouse wheel.
     * @param {boolean} check - A boolean flag for additional control logic.
     */
    private onEnteredAction;
    /**
     * Handles scroll events to manage virtual scrolling and row rendering.
     * Adjusts view information, row indexes, and translates viewport positioning
     * based on the given scroll arguments.
     *
     * @param {ScrollArg} scrollArgs - Contains the scroll offsets, sentinel information, direction of scroll, and other related details.
     * @returns {void} - No return value. It adjusts scrolling state internally.
     */
    scrollListeners(scrollArgs: ScrollArg): void;
    /**
     * Prevents scrolling under specific conditions related to adding a new row.
     *
     * @param {ScrollArg} scrollArgs - The scroll event arguments containing offset details.
     * @returns {void}
     */
    private shouldPreventScrolling;
    /**
     * Appends content to the target element. Handles dynamic adjustments for remote data sources,
     * frozen columns, and virtual scrolling.
     *
     * @param {HTMLElement} target - The target HTML element where content is to be appended.
     * @param {DocumentFragment} newChild - The new content as a DocumentFragment to append.
     * @param {NotifyArgs} e - Object containing information about the operation.
     * @returns {void}
     */
    appendContent(target: HTMLElement, newChild: DocumentFragment, e: NotifyArgs): void;
    /**
     * Unsubscribes all event listeners to prevent memory leaks.
     * This method is called when the component is being destroyed or when event listeners need to be cleaned up.
     *
     * @returns {void}
     */
    removeEventListener(): void;
}
export declare class TreeInterSectionObserver extends InterSectionObserver {
    private isWheeling;
    private newPos;
    private lastPos;
    private timer;
    /**
     * Sets up observers to monitor scroll events on a given container
     * and its movable companion within a virtual grid setup.
     *
     * @param {Function} callback - Function to call when a scroll event is detected.
     * @param {Function} onEnterCallback - Function to call when a specific event, like entering a region, is detected.
     * @param {IGrid} instance - The grid instance that requires observation.
     * @returns {void}
     */
    observes(callback: Function, onEnterCallback: Function, instance: IGrid): void;
    /**
     * Clears the last known position.
     *
     * @returns {void} No value is returned from this function.
     */
    private clear;
    /**
     * Handles virtual scrolling events and manages scroll direction and debouncing for rendering updates.
     *
     * @private
     * @param {Function} callback - Function to call on scroll end.
     * @param {Function} onEnterCallback - Function to call on entering a virtual scrolling area.
     * @param {IGrid} instance - The grid instance on which virtual scrolling is being implemented.
     * @returns {Function} - A function that processes scroll events.
     */
    private virtualScrollHandlers;
}
declare type ScrollArg = {
    direction: string;
    isWheel: boolean;
    sentinel: SentinelType;
    offset: Offsets;
    focusElement: HTMLElement;
};
export {};
