interface QueryTable {
    name: string;
    label: string;
    fields: QueryField[];
  }
  
  interface QueryField {
    name: string;
    label: string;
  }
  
  interface DependentTable {
    table: string;
    fields: string[];
    dependent?: DependentTable;
  }
  
  interface DependentTableSelectorProps {
    selectedTable: string;
    dependentTables: DependentTable[];
    queryTables: QueryTable[];
    addDependentTable: () => void;
    updateDependentTable: (index: number, table: string) => void;
    addDependentField: (index: number, field: string) => void;
    addNestedDependentTable: (index: number) => void;
    updateNestedDependentTable: (index: number, table: string) => void;
    addNestedDependentField: (index: number, field: string) => void;
  }
  
  const DependentTableSelector: React.FC<DependentTableSelectorProps> = ({
    selectedTable,
    dependentTables,
    queryTables,
    addDependentTable,
    updateDependentTable,
    addDependentField,
    addNestedDependentTable,
    updateNestedDependentTable,
    addNestedDependentField,
  }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#374151] mb-2">Abhängige Tabellen</h3>
        {dependentTables.map((depTable, index) => (
          <div key={index} className="mb-4">
            <select
              value={depTable.table}
              onChange={(e) => updateDependentTable(index, e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] mb-2"
            >
              <option value="">Wählen Sie eine Tabelle...</option>
              {queryTables
                .filter((table) => table.name !== selectedTable && !dependentTables.some((dt, i) => i !== index && dt.table === table.name))
                .map((table) => (
                  <option key={table.name} value={table.name}>
                    {table.label}
                  </option>
                ))}
            </select>
            {depTable.table && (
              <>
                <h4 className="text-md font-semibold text-[#374151] mb-2">Felder auswählen</h4>
                <select
                  onChange={(e) => addDependentField(index, e.target.value)}
                  className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] mb-2"
                >
                  <option value="">Feld auswählen...</option>
                  {queryTables
                    .find((t) => t.name === depTable.table)!
                    .fields.map((field) => (
                      <option key={field.name} value={field.name}>
                        {field.label}
                      </option>
                    ))}
                </select>
                <div className="ml-4">
                  {depTable.fields.map((field: string, idx: number) => (
                    <div key={idx}>{field}</div>
                  ))}
                </div>
                <button
                  onClick={() => addNestedDependentTable(index)}
                  className="mt-2 px-4 py-2 bg-[#2563eb] text-[#ffffff] rounded hover:bg-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  Weitere abhängige Tabelle hinzufügen
                </button>
                {depTable.dependent && (
                  <div className="ml-4 mt-2 border-l-2 pl-4">
                    <h4 className="text-md font-semibold text-[#374151] mb-2">Weitere Abhängigkeit</h4>
                    <select
                      value={depTable.dependent.table}
                      onChange={(e) => updateNestedDependentTable(index, e.target.value)}
                      className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] mb-2"
                    >
                      <option value="">Wählen Sie eine Tabelle...</option>
                      {queryTables
                        .filter(
                          (table) =>
                            table.name !== selectedTable &&
                            table.name !== depTable.table &&
                            !dependentTables.some((dt, i) => i !== index && dt.table === table.name)
                        )
                        .map((table) => (
                          <option key={table.name} value={table.name}>
                            {table.label}
                          </option>
                        ))}
                    </select>
                    {depTable.dependent.table && (
                      <>
                        <h5 className="text-sm font-semibold text-[#374151] mb-2">Felder auswählen</h5>
                        <select
                          onChange={(e) => addNestedDependentField(index, e.target.value)}
                          className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] mb-2"
                        >
                          <option value="">Feld auswählen...</option>
                          {queryTables
                            .find((t) => t.name === depTable.dependent!.table)!
                            .fields.map((field) => (
                              <option key={field.name} value={field.name}>
                                {field.label}
                              </option>
                            ))}
                        </select>
                        <div className="ml-4">
                          {depTable.dependent.fields.map((field: string, idx: number) => (
                            <div key={idx}>{field}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        <button
          onClick={addDependentTable}
          className="px-4 py-2 bg-[#2563eb] text-[#ffffff] rounded hover:bg-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        >
          Abhängige Tabelle hinzufügen
        </button>
      </div>
    );
  };
  
  export default DependentTableSelector;