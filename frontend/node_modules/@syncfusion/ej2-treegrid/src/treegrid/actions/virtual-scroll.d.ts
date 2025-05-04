import { TreeGrid } from '../base/treegrid';
import { VirtualScroll as GridVirtualScroll, IGrid, ServiceLocator } from '@syncfusion/ej2-grids';
/**
 * TreeGrid Virtual Scroll module will handle Virtualization
 *
 * @hidden
 */
export declare class VirtualScroll {
    private parent;
    private expandCollapseRec;
    private prevstartIndex;
    setEndIndexToGantt: boolean;
    ganttEndIndex: number;
    private prevendIndex;
    private visualData;
    private prevrequestType;
    prevSelectedRecord: object;
    /**
     * Constructor for VirtualScroll module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Returns VirtualScroll module name
     */
    protected getModuleName(): string;
    /**
     * @hidden
     * @returns {void}
     */
    addEventListener(): void;
    /**
     * @hidden
     * @returns {void}
     */
    removeEventListener(): void;
    /**
     * Handles the virtual child collapse or expand action in a tree grid.
     *
     * @param {object} row - Object containing information about the collapse/expand action.
     * @param {string} row.action - The type of action, either "collapse" or "expand".
     * @param {HTMLTableRowElement} row.row - The HTML row element that is affected by the action.
     * @param {ITreeData} row.record - The tree data record associated with the row.
     * @param {RowCollapsedEventArgs} row.args - Additional event arguments related to the row collapse or expand.
     *
     * @returns {void} No return value as the function executes a procedure.
     */
    private collapseExpandVirtualchilds;
    /**
     * Handles selection logic for the TreeGrid component.
     *
     * @returns {void}
     */
    private handleSelection;
    /**
     * Handles the action related to virtual scrolling with paging details.
     *
     * @param {Object} pageingDetails - Contains the result data, count of results, and action arguments.
     * @param {ITreeData[]} pageingDetails.result - The result data to be handled.
     * @param {number} pageingDetails.count - The count of results.
     * @param {ActionEventArgs} pageingDetails.actionArgs - The action arguments related to the virtual page action.
     * @returns {void}
     */
    private virtualPageAction;
    /**
     * To destroy the virtualScroll module
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    /**
     * Updates the row selection when the header checkbox is clicked and the number of selected rows
     * does not match the current view data length.
     *
     * @param {RowDeselectEventArgs} args - The arguments containing details of the row deselection event.
     * @returns {void} - This method does not return a value.
     */
    private updateSelection;
}
export declare class TreeVirtual extends GridVirtualScroll {
    constructor(parent: IGrid, locator?: ServiceLocator);
    getModuleName(): string;
    protected instantiateRenderers(): void;
    ensurePageSize(): void;
}
