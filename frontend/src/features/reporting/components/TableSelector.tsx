interface QueryTable {
    name: string;
    label: string;
    fields: QueryField[];
  }
  
  interface QueryField {
    name: string;
    label: string;
  }
  
  interface TableSelectorProps {
    tables: QueryTable[];
    selectedTable: string;
    onTableChange: (table: string) => void;
  }
  
  const TableSelector: React.FC<TableSelectorProps> = ({ tables, selectedTable, onTableChange }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#374151] mb-2">Tabelle auswählen</h3>
        <select
          value={selectedTable}
          onChange={(e) => onTableChange(e.target.value)}
          className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] mb-4"
        >
          {tables.map((table) => (
            <option key={table.name} value={table.name}>
              {table.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  export default TableSelector;