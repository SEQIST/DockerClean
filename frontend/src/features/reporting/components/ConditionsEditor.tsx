interface QueryField {
    name: string;
    label: string;
  }
  
  interface QueryCondition {
    field: string;
    value: string;
  }
  
  interface ConditionsEditorProps {
    fields: QueryField[];
    conditions: QueryCondition[];
    onAddCondition: () => void;
    onUpdateCondition: (index: number, field: string, value: string) => void;
    onRemoveCondition: (index: number) => void;
  }
  
  const ConditionsEditor: React.FC<ConditionsEditorProps> = ({
    fields,
    conditions,
    onAddCondition,
    onUpdateCondition,
    onRemoveCondition,
  }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#374151] mb-2">Anzuzeigende Daten</h3>
        {conditions.map((condition, index) => (
          <div key={index} className="flex flex-wrap gap-4 mb-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <select
                value={condition.field}
                onChange={(e) => onUpdateCondition(index, e.target.value, condition.value)}
                className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              >
                {fields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={condition.value}
                onChange={(e) => onUpdateCondition(index, condition.field, e.target.value)}
                placeholder="Filter Value"
                className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>
            <button
              onClick={() => onRemoveCondition(index)}
              className="px-4 py-2 bg-[#ef4444] text-[#ffffff] rounded hover:bg-[#f87171] focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
            >
              Remove filter
            </button>
          </div>
        ))}
        <button
          onClick={onAddCondition}
          className="px-4 py-2 bg-[#2563eb] text-[#ffffff] rounded hover:bg-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        >
          Filter hinzufügen
        </button>
      </div>
    );
  };
  
  export default ConditionsEditor;