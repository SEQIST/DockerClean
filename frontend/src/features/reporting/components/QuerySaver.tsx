interface SavedQuery {
    name: string;
    table: string;
    conditions: QueryCondition[];
  }
  
  interface QueryCondition {
    field: string;
    value: string;
  }
  
  interface QuerySaverProps {
    savedQueries: SavedQuery[];
    queryName: string;
    onQueryNameChange: (name: string) => void;
    onSaveQuery: () => void;
    onLoadQuery: (query: SavedQuery) => void;
  }
  
  const QuerySaver: React.FC<QuerySaverProps> = ({
    savedQueries,
    queryName,
    onQueryNameChange,
    onSaveQuery,
    onLoadQuery,
  }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#374151] mb-2">Abfrage speichern</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={queryName}
            onChange={(e) => onQueryNameChange(e.target.value)}
            placeholder="Abfragename"
            className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <button
            onClick={onSaveQuery}
            className="px-4 py-2 bg-[#2563eb] text-[#ffffff] rounded hover:bg-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            Abfrage speichern
          </button>
        </div>
        {savedQueries.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">Gespeicherte Abfragen</h3>
            <select
              onChange={(e) => {
                const selectedQuery = savedQueries.find((q) => q.name === e.target.value);
                if (selectedQuery) onLoadQuery(selectedQuery);
              }}
              className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="">Wählen Sie eine Abfrage...</option>
              {savedQueries.map((query) => (
                <option key={query.name} value={query.name}>
                  {query.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };
  
  export default QuerySaver;