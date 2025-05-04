import { ChildProperty, DateFormatOptions, NumberFormatOptions } from '@syncfusion/ej2-base';
import { AggregateColumnModel } from './summary-model';
import { CustomSummaryType, AggregateType, CellType } from '@syncfusion/ej2-grids';
/**
 * Configures the aggregate column for the TreeGrid.
 */
export declare class AggregateColumn extends ChildProperty<AggregateColumn> {
    private formatFn;
    private intl;
    private templateFn;
    /**
     * Defines the aggregate type(s) for a particular column.
     * To apply multiple aggregates to a single column, specify the `type` as an array.
     * Available aggregate types include:
     * * `sum`: Calculates the sum of all values in a column.
     * * `average`: Computes the average of the column values.
     * * `max`: Finds the maximum value in a column.
     * * `min`: Finds the minimum value in a column.
     * * `count`: Counts the number of records.
     * * `falsecount`: Counts the number of false values.
     * * `truecount`: Counts the number of true values.
     * * `custom`: Allows for a custom aggregate function.
     *
     * Use `custom` to specify a custom aggregation.
     *
     * @aspType string
     * @default null
     */
    type: AggregateType | AggregateType[] | string;
    /**
     * Defines a template for the footer cell of the aggregate column.
     * Use the aggregate `type` names within the template to access aggregate values.
     *
     * @default null
     * @aspType string
     *
     */
    footerTemplate: string | Function;
    /**
     * Specifies the column name on which to perform the aggregation.
     *
     * @default null
     */
    field: string;
    /**
     * Specifies the format to be applied to the calculated aggregate value before display.
     * Supports both standard and custom formats for numbers and dates.
     * Refer to the Syncfusion documentation for [number](https://ej2.syncfusion.com/documentation/common/internationalization/#supported-format-string)
     * and [date](https://ej2.syncfusion.com/documentation/common/internationalization#date-formatting) formats.
     *
     * @aspType string
     * @default null
     */
    format: string | NumberFormatOptions | DateFormatOptions;
    /**
     * Specifies the column name to display the aggregate value. If not defined, the `field` name is used by default.
     *
     * @default null
     */
    columnName: string;
    /**
     * Defines a custom function to calculate the aggregate value. The `type` must be set to `custom`.
     * Use the custom value as `${custom}` in templates.
     * * `Total aggregation`: The custom function is called with the entire dataset and the current `AggregateColumn` object.
     * * `Group aggregation`: It is called with the current group details and the `AggregateColumn` object.
     *
     * @default null
     */
    customAggregate: CustomSummaryType | string;
    /**
     * Custom format function
     *
     * @hidden
     * @param {string} cultureName - culture name to format
     * @returns {void}
     */
    setFormatter(cultureName: string): void;
    /**
     * @param {NumberFormatOptions | DateFormatOptions} format - formatting options for number and date values
     * @hidden
     * @returns {Function} - return formatter function
     */
    getFormatFunction(format: NumberFormatOptions | DateFormatOptions): Function;
    /**
     * @hidden
     * @returns {Function} - Returns formatter function
     */
    getFormatter(): Function;
    /**
     * @param {Object} helper - Specified the helper
     * @hidden
     * @returns {void}
     */
    setTemplate(helper?: Object): void;
    /**
     * @param {CellType} type - specifies the cell type
     * @returns {Object} returns the object
     * @hidden
     */
    getTemplate(type: CellType): {
        fn: Function;
        property: string;
    };
    /**
     * @param {Object} prop - updates aggregate properties without change detection
     * @hidden
     * @returns {void}
     */
    setPropertiesSilent(prop: Object): void;
}
/**
 * Configures the aggregate rows in the TreeGrid.
 */
export declare class AggregateRow extends ChildProperty<AggregateRow> {
    /**
     * Configures the collection of aggregate columns.
     *
     * @default []
     */
    columns: AggregateColumnModel[];
    /**
     * Determines whether to display child summaries for each parent row.
     *
     */
    showChildSummary: boolean;
}
