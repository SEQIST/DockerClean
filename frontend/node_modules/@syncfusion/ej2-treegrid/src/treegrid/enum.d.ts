/**
 * Defines modes of Filter Hierarchy used in TreeGrids.
 * The available modes are:
 * * `Parent`: Shows filtered records along with their parent records.
 * * `Child`: Shows filtered records along with their child records.
 * * `Both`: Shows filtered records with both parent and child records.
 * * `None`: Shows only the filtered records without any parent or child context.
 */
export declare type FilterHierarchyMode = 'Parent' | 'Child' | 'Both' | 'None';
/**
 * Defines predefined toolbar items for TreeGrids.
 * The available toolbar items are:
 * * `Add`: Add a new record.
 * * `Edit`: Edit the selected record.
 * * `Update`: Update the edited record.
 * * `Delete`: Delete the selected record.
 * * `Cancel`: Cancel the current edit operation.
 * * `Search`: Search TreeGrid records by a given key.
 * * `ExpandAll`: Expand all the rows in the TreeGrid.
 * * `CollapseAll`: Collapse all the rows in the TreeGrid.
 * * `ExcelExport`: Export the TreeGrid as an Excel document.
 * * `PdfExport`: Export the TreeGrid as a PDF document.
 * * `CsvExport`: Export the TreeGrid as a CSV document.
 * * `Print`: Print the TreeGrid contents.
 *
 * @hidden
 */
export declare type ToolbarItems = 'Add' | 'Delete' | 'Update' | 'Cancel' | 'Edit' | 'Search' | 'ExpandAll' | 'CollapseAll' | 'ExcelExport' | 'PdfExport' | 'CsvExport' | 'Print';
/**
 * Defines enumerable toolbar items for programmatic access.
 *
 * @hidden
 */
export declare enum ToolbarItem {
    Add = 0,
    Edit = 1,
    Update = 2,
    Delete = 3,
    Cancel = 4,
    Search = 5,
    ExpandAll = 6,
    CollapseAll = 7,
    ExcelExport = 8,
    PdfExport = 9,
    CsvExport = 10,
    Print = 11,
    RowIndent = 12,
    RowOutdent = 13
}
/**
 * Defines the available PageSizeMode options for pagination in a tree grid structure.
 *
 * The available page size modes are:
 *
 * * `All`: Considers all records, including both parent and child records, when calculating the number of records per page.
 * * `Root`: Considers only root-level parent records, excluding child records, when calculating the number of records per page.
 */
export declare type PageSizeMode = 'All' | 'Root';
/**
 * Defines predefined context menu items for row and column interactions.
 * The available context menu items are:
 * * `AutoFitAll`: Automatically fit the size of all columns.
 * * `AutoFit`: Automatically fit the size of the current column.
 * * `SortAscending`: Sort the current column in ascending order.
 * * `SortDescending`: Sort the current column in descending order.
 * * `Edit`: Edit the current record.
 * * `Delete`: Delete the current record.
 * * `Save`: Save the edited state.
 * * `Cancel`: Cancel the current edit operation.
 * * `PdfExport`: Export the TreeGrid as a PDF format.
 * * `ExcelExport`: Export the TreeGrid as an Excel format.
 * * `CsvExport`: Export the TreeGrid as a CSV format.
 * * `FirstPage`: Navigate to the first page.
 * * `PrevPage`: Navigate to the previous page.
 * * `LastPage`: Navigate to the last page.
 * * `NextPage`: Navigate to the next page.
 * * `AddRow`: Add a new row.
 * * `Indent`: Indent the selected rows.
 * * `Outdent`: Outdent the selected rows.
 *
 * @hidden
 */
export declare type ContextMenuItem = 'AutoFitAll' | 'AutoFit' | 'SortAscending' | 'SortDescending' | 'Edit' | 'Delete' | 'Save' | 'Cancel' | 'PdfExport' | 'ExcelExport' | 'CsvExport' | 'FirstPage' | 'PrevPage' | 'LastPage' | 'NextPage' | 'AddRow' | 'Indent' | 'Outdent';
/**
 * Enumerates detailed context menu items used for menu configurations.
 *
 * @hidden
 */
export declare enum ContextMenuItems {
    AutoFit = 0,
    AutoFitAll = 1,
    SortAscending = 2,
    SortDescending = 3,
    Edit = 4,
    Delete = 5,
    Save = 6,
    Cancel = 7,
    PdfExport = 8,
    ExcelExport = 9,
    CsvExport = 10,
    FirstPage = 11,
    PrevPage = 12,
    LastPage = 13,
    NextPage = 14,
    AddRow = 15,
    RowIndent = 16,
    RowOutdent = 17
}
/**
 * Defines modes of editing supported by TreeGrids.
 * The available editing modes are:
 * * `Cell`: Enables cell editing mode.
 * * `Row`: Enables row editing mode.
 * * `Dialog`: Opens a dialog for editing.
 * * `Batch`: Allows for batch editing of multiple records.
 */
export declare type EditMode = 'Cell' | 'Row' | 'Dialog' | 'Batch';
/**
 * Defines the target position for adding new rows in the TreeGrid.
 * The available positions are:
 * * `Top`: Adds a new row at the top of all rows.
 * * `Bottom`: Adds a new row at the bottom of all rows.
 * * `Above`: Adds a new row above the currently selected row.
 * * `Below`: Adds a new row below the currently selected row.
 * * `Child`: Adds a new row as a child to the currently selected row.
 */
export declare type RowPosition = 'Top' | 'Bottom' | 'Above' | 'Below' | 'Child';
/**
 * Defines types of filters available in TreeGrids.
 * The available filter types are:
 * * `Menu`: Applies a dialog-based filtering option, where users can select operators such as 'equals', 'contains', etc., and enter filter values for more granular control.
 * * `Excel`: Provides Excel-like filtering capabilities.
 * * `FilterBar`: Uses a filter bar at the top of each column.
 */
export declare type FilterType = 'FilterBar' | 'Excel' | 'Menu';
/**
 * Defines wrapping modes for column content in TreeGrids.
 * The available wrap modes are:
 * * `Both`: Wraps both header and content.
 * * `Header`: Wraps only the header.
 * * `Content`: Wraps only the content.
 */
export declare type WrapMode = 'Both' | 'Header' | 'Content';
/**
 * Defines the types of CopyHierarchyMode for grid data.
 * The available copy hierarchy types are:
 * * `Parent`: Copies data maintaining only parent hierarchy.
 * * `Child`: Copies data with child hierarchy.
 * * `Both`: Maintains both parent and child hierarchy during copy.
 * * `None`: Copies data without any hierarchy structure.
 */
export declare type CopyHierarchyType = 'Parent' | 'Child' | 'Both' | 'None';
