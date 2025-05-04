var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { merge, Property } from '@syncfusion/ej2-base';
/**
 * Represents the "Column" model class for TreeGrid, defining essential properties and functionalities of a column.
 */
var Column = /** @class */ (function () {
    function Column(options) {
        /**
         * Allows or disallows editing of the column. Set to `false` to make a column non-editable.
         * By default, all columns are editable.
         *
         * @default true
         */
        this.allowEditing = true;
        /**
         * Customization options for the edit cell.
         *
         * @default {}
         */
        this.edit = {};
        /**
         * When set to `true`, encodes HTML content in headers and cells to prevent HTML injection.
         *
         * @default true
         */
        this.disableHtmlEncode = true;
        /**
         * Disables column reordering if set to `false`. By default, columns can be reordered.
         *
         * @default true
         */
        this.allowReordering = true;
        /**
         * Disables column menu for the column if set to `false`. By default, column menus are enabled for all columns.
         *
         * @default true
         */
        this.showColumnMenu = true;
        /**
         * Disables filtering for the column if set to `false`. By default, columns are filterable.
         *
         * @default true
         */
        this.allowFiltering = true;
        /**
         * Disables sorting for the column if set to `false`. By default, columns are sortable.
         *
         * @default true
         */
        this.allowSorting = true;
        /**
         * Disables resizing for the column if set to `false`. By default, columns can be resized.
         *
         * @default true
         */
        this.allowResizing = true;
        /**
         * Customize default filter options for a specific column, providing types and UI definitions for custom components.
         *
         * @default null
         */
        this.filter = {};
        merge(this, options);
    }
    /**
     * Reflects state changes for TreeGrid column directives, particularly in React.
     *
     * @param {Column} column - The column to update.
     * @returns {void}
     * @hidden
     */
    Column.prototype.setProperties = function (column) {
        var keys = Object.keys(column);
        for (var i = 0; i < keys.length; i++) {
            this[keys[parseInt(i.toString(), 10)]] = column[keys[parseInt(i.toString(), 10)]];
            if (this.parent && this.parent['isReact'] && keys[parseInt(i.toString(), 10)] === 'template') {
                var refreshReactColumnTemplateByUid = 'refreshReactColumnTemplateByUid';
                this.parent.clipboardModule['treeGridParent'].renderModule["" + refreshReactColumnTemplateByUid](this.uid);
            }
        }
    };
    return Column;
}());
export { Column };
/**
 * Defines TreeGrid column
 */
var TreeGridColumn = /** @class */ (function (_super) {
    __extends(TreeGridColumn, _super);
    function TreeGridColumn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], TreeGridColumn.prototype, "columns", void 0);
    return TreeGridColumn;
}(Column));
export { TreeGridColumn };
/**
 * Defines stacked tree grid column
 */
var StackedColumn = /** @class */ (function (_super) {
    __extends(StackedColumn, _super);
    function StackedColumn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StackedColumn;
}(TreeGridColumn));
export { StackedColumn };
