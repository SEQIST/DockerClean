import React, { useState } from 'react'; // Füge den React-Import hinzu
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import TableSelector from '../components/TableSelector';
import ConditionsEditor from '../components/ConditionsEditor';
import QuerySaver from '../components/QuerySaver';
import ResultsViewer from '../components/ResultsViewer';
import DependentTableSelector from '../components/DependentTableSelector';
import QueryRunner from '../components/QueryRunner';

interface QueryTable {
  name: string;
  label: string;
  fields: QueryField[];
}

interface QueryField {
  name: string;
  label: string;
}

interface QueryCondition {
  field: string;
  value: string;
}

interface DependentTable {
  table: string;
  fields: string[];
  dependent?: DependentTable;
}

const queryTables: QueryTable[] = [
  {
    name: 'processes',
    label: 'Prozesse',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'abbreviation', label: 'Abkürzung' },
      { name: 'purpose', label: 'Zweck' },
      { name: 'contextPositions', label: 'Kontextpositionen' },
      { name: 'owner', label: 'Eigentümer' },
      { name: 'department', label: 'Abteilung' },
      { name: 'processGroup', label: 'Prozessgruppe' },
      { name: 'outcomes', label: 'Ergebnisse' },
      { name: 'simulationWorkProducts', label: 'Simulationsarbeitsergebnisse' },
    ],
  },
  {
    name: 'departments',
    label: 'Abteilungen',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Beschreibung' },
      { name: 'company', label: 'Unternehmen' },
    ],
  },
  {
    name: 'roles',
    label: 'Rollen',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'abbreviation', label: 'Abkürzung' },
      { name: 'description', label: 'Beschreibung' },
      { name: 'department', label: 'Abteilung' },
      { name: 'company', label: 'Unternehmen' },
      { name: 'subordinateRoles', label: 'Untergeordnete Rollen' },
      { name: 'supervisorRole', label: 'Vorgesetzte Rolle' },
    ],
  },
  {
    name: 'activities',
    label: 'Aktivitäten',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'abbreviation', label: 'Abkürzung' },
      { name: 'description', label: 'Beschreibung' },
      { name: 'process', label: 'Prozess' },
      { name: 'executedBy', label: 'Ausgeführt von' },
    ],
  },
  {
    name: 'workproducts',
    label: 'Work Products',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Beschreibung' },
      { name: 'type', label: 'Typ' },
    ],
  },
  {
    name: 'results',
    label: 'Ergebnisse',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Beschreibung' },
    ],
  },
];

const QueryEditor: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('activities');
  const [dependentTables, setDependentTables] = useState<DependentTable[]>([]);
  const [conditions, setConditions] = useState<QueryCondition[]>([{ field: 'name', value: '' }]);
  const [results, setResults] = useState<any[]>([]);
  const [dependentResults, setDependentResults] = useState<any[]>([]);
  const [savedQueries, setSavedQueries] = useState<any[]>(() => {
    const saved = localStorage.getItem('savedQueries');
    return saved ? JSON.parse(saved) : [];
  });
  const [queryName, setQueryName] = useState<string>('');

  const currentTable = queryTables.find((table) => table.name === selectedTable) || queryTables[0];

  const addCondition = () => {
    setConditions([...conditions, { field: currentTable.fields[0].name, value: '' }]);
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = { field, value };
    setConditions(updatedConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addDependentTable = () => {
    setDependentTables([...dependentTables, { table: '', fields: [] }]);
  };

  const updateDependentTable = (index: number, table: string) => {
    const updatedTables = [...dependentTables];
    updatedTables[index].table = table;
    updatedTables[index].fields = [];
    setDependentTables(updatedTables);
  };

  const addDependentField = (index: number, field: string) => {
    const updatedTables = [...dependentTables];
    updatedTables[index].fields.push(field);
    setDependentTables(updatedTables);
  };

  const addNestedDependentTable = (index: number) => {
    const updatedTables = [...dependentTables];
    updatedTables[index].dependent = { table: '', fields: [] };
    setDependentTables(updatedTables);
  };

  const updateNestedDependentTable = (index: number, table: string) => {
    const updatedTables = [...dependentTables];
    updatedTables[index].dependent!.table = table;
    updatedTables[index].dependent!.fields = [];
    setDependentTables(updatedTables);
  };

  const addNestedDependentField = (index: number, field: string) => {
    const updatedTables = [...dependentTables];
    updatedTables[index].dependent!.fields.push(field);
    setDependentTables(updatedTables);
  };

  const saveQuery = () => {
    if (!queryName.trim()) {
      alert('Bitte geben Sie einen Namen für die Abfrage ein.');
      return;
    }

    const newQuery = {
      name: queryName,
      table: selectedTable,
      dependentTables,
      conditions,
    };

    const updatedQueries = [...savedQueries, newQuery];
    setSavedQueries(updatedQueries);
    localStorage.setItem('savedQueries', JSON.stringify(updatedQueries));
    setQueryName('');
  };

  const loadQuery = (query: any) => {
    setSelectedTable(query.table);
    setDependentTables(query.dependentTables || []);
    setConditions(query.conditions);
    setResults([]);
    setDependentResults([]);
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <PageBreadcrumb pageTitle="Query Editor" />

        <h2 className="text-2xl font-bold text-[#2563eb] mb-6">Abfrage</h2>

        <TableSelector
          tables={queryTables}
          selectedTable={selectedTable}
          onTableChange={(table) => {
            setSelectedTable(table);
            setConditions([{ field: queryTables.find((t) => t.name === table)!.fields[0].name, value: '' }]);
            setResults([]);
            setDependentResults([]);
            setDependentTables([]);
          }}
        />

        <DependentTableSelector
          selectedTable={selectedTable}
          dependentTables={dependentTables}
          queryTables={queryTables}
          addDependentTable={addDependentTable}
          updateDependentTable={updateDependentTable}
          addDependentField={addDependentField}
          addNestedDependentTable={addNestedDependentTable}
          updateNestedDependentTable={updateNestedDependentTable}
          addNestedDependentField={addNestedDependentField}
        />

        <ConditionsEditor
          fields={currentTable.fields}
          conditions={conditions}
          onAddCondition={addCondition}
          onUpdateCondition={updateCondition}
          onRemoveCondition={removeCondition}
        />

        <QuerySaver
          savedQueries={savedQueries}
          queryName={queryName}
          onQueryNameChange={setQueryName}
          onSaveQuery={saveQuery}
          onLoadQuery={loadQuery}
        />

        <QueryRunner
          selectedTable={selectedTable}
          conditions={conditions}
          dependentTables={dependentTables}
          setResults={setResults}
          setDependentResults={setDependentResults}
          queryTables={queryTables}
        />

        <ResultsViewer
          selectedTable={selectedTable}
          dependentTable={dependentTables[0]?.table || null}
          results={results}
          dependentResults={dependentResults}
          conditions={conditions}
        />
      </div>
    </div>
  );
};

export default QueryEditor;