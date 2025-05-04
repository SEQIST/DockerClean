import { useState } from "react";
import { toast } from "react-toastify";
import BreadCrumb from "../../../pages/UiElements/BreadCrumb";

interface ProcessReport {
  processName: string;
  description: string;
  subProcesses: { name: string; description: string }[];
  activities: {
    name: string;
    triggerWorkProducts: string[];
    resultWorkProduct: string | null;
  }[];
}

interface Activity {
  name: string;
  description?: string;
  startConditions?: string;
  triggerWorkProducts: string[];
  resultWorkProduct: string | null;
}

interface Role {
  name: string;
  description: string;
  activities: {
    name: string;
    description?: string;
    startConditions?: string;
    triggerWorkProducts: string[];
    resultWorkProduct: string | null;
  }[];
}

interface WorkProduct {
  name: string;
  description?: string;
  number?: string;
  useMode?: string;
  cost?: number | null;
  digitalisierbarDurch?: string[];
}

interface ReportResponse<T> {
  reportName: string;
  generatedAt: string;
  data: T[];
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'h1' | 'h2' | 'h3' | 'text';
}

interface TableConfig {
  name: string;
  fields: FieldConfig[];
  dependency1?: TableConfig;
  dependency2?: TableConfig;
}

const ReportsPage = () => {
  const [report, setReport] = useState<ReportResponse<ProcessReport | Activity | Role | WorkProduct> | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableConfig, setTableConfig] = useState<TableConfig>({
    name: 'processes',
    fields: [
      { key: 'processName', label: 'Prozessname', type: 'h1' },
      { key: 'description', label: 'Beschreibung', type: 'text' },
    ],
    dependency1: {
      name: 'activities',
      fields: [
        { key: 'name', label: 'Verantwortlich für: Aktivitätsname', type: 'h2' },
        { key: 'description', label: 'Aktivitätsbeschreibung:', type: 'text' },
        { key: 'startConditions', label: 'Startbedingungen:', type: 'text' },
        { key: 'triggerWorkProducts', label: 'Trigger Work Product:', type: 'text' },
        { key: 'resultWorkProduct', label: 'Ergebnis:', type: 'text' },
      ],
    },
  });

  const availableTables = [
    {
      name: 'processes',
      label: 'Prozesse',
      fields: ['processName', 'description'],
      dependencyFields: ['activities'],
    },
    {
      name: 'activities',
      label: 'Aktivitäten',
      fields: ['name', 'description', 'startConditions', 'triggerWorkProducts', 'resultWorkProduct'],
      dependencyFields: [],
    },
    {
      name: 'roles',
      label: 'Rollen',
      fields: ['name', 'description'],
      dependencyFields: ['activities'],
    },
    {
      name: 'workproducts',
      label: 'Work Products',
      fields: ['name', 'description', 'number', 'useMode', 'cost', 'digitalisierbarDurch'],
      dependencyFields: [],
    },
  ];

  const fieldLabels: { [key: string]: string } = {
    processName: 'Prozessname',
    description: 'Beschreibung',
    name: 'Name',
    number: 'Nummer',
    useMode: 'Use Mode',
    cost: 'Kosten',
    digitalisierbarDurch: 'Digitalisierbar durch:',
    startConditions: 'Startbedingungen:',
    triggerWorkProducts: 'Trigger Work Product:',
    resultWorkProduct: 'Ergebnis:',
  };

  const handleTableChange = (tableName: string, level: 'main' | 'dep1' | 'dep2') => {
    const newConfig = { ...tableConfig };
    const selectedTable = availableTables.find((table) => table.name === tableName);

    if (level === 'main') {
      newConfig.name = tableName;
      newConfig.fields = selectedTable?.fields.map((field) => ({
        key: field,
        label: fieldLabels[field] || field,
        type: field === 'name' || field === 'processName' ? 'h1' : 'text',
      })) || [];
      newConfig.dependency1 = undefined;
      newConfig.dependency2 = undefined;
      if (selectedTable?.dependencyFields.length) {
        const depTable = availableTables.find((table) => table.name === selectedTable.dependencyFields[0]);
        if (depTable) {
          newConfig.dependency1 = {
            name: depTable.name,
            fields: depTable.fields.map((field) => ({
              key: field,
              label: fieldLabels[field] || field,
              type: field === 'name' ? 'h2' : 'text',
            })),
          };
        }
      }
    } else if (level === 'dep1') {
      if (tableName === '') {
        newConfig.dependency1 = undefined;
        newConfig.dependency2 = undefined;
      } else {
        newConfig.dependency1 = {
          name: tableName,
          fields: selectedTable?.fields.map((field) => ({
            key: field,
            label: fieldLabels[field] || field,
            type: field === 'name' ? 'h2' : 'text',
          })) || [],
        };
        newConfig.dependency2 = undefined;
      }
    } else if (level === 'dep2') {
      if (tableName === '') {
        newConfig.dependency2 = undefined;
      } else {
        newConfig.dependency2 = {
          name: tableName,
          fields: selectedTable?.fields.map((field) => ({
            key: field,
            label: fieldLabels[field] || field,
            type: field === 'name' ? 'h3' : 'text',
          })) || [],
        };
      }
    }

    setTableConfig(newConfig);
    setReportGenerated(false);
    setError(null);
  };

  const handleFieldConfigChange = (index: number, key: string, value: string, level: 'main' | 'dep1' | 'dep2') => {
    const newConfig = { ...tableConfig };
    if (level === 'main') {
      const updatedFields = [...newConfig.fields];
      updatedFields[index] = { ...updatedFields[index], [key]: value };
      newConfig.fields = updatedFields;
    } else if (level === 'dep1' && newConfig.dependency1) {
      const updatedFields = [...newConfig.dependency1.fields];
      updatedFields[index] = { ...updatedFields[index], [key]: value };
      newConfig.dependency1.fields = updatedFields;
    } else if (level === 'dep2' && newConfig.dependency2) {
      const updatedFields = [...newConfig.dependency2.fields];
      updatedFields[index] = { ...updatedFields[index], [key]: value };
      newConfig.dependency2.fields = updatedFields;
    }
    setTableConfig(newConfig);
    setReportGenerated(false);
    setError(null);
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/reports/${tableConfig.name}`);
      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
      }
      const data: ReportResponse<ProcessReport | Activity | Role | WorkProduct> = await response.json();
      setReport(data);
      setReportGenerated(true);
      setError(null);
    } catch (error) {
      console.error("Fehler beim Laden des Berichts:", error);
      setError(`Fehler beim Laden des Berichts: Der Berichtstyp "${tableConfig.name}" ist derzeit nicht verfügbar.`);
      setReportGenerated(false);
      setReport(null);
      toast.error("Fehler beim Laden des Berichts");
    }
  };

  const renderField = (item: ProcessReport | Activity | Role | WorkProduct, field: FieldConfig) => {
    const value = field.key.includes('.')
      ? field.key.split('.').reduce((obj: any, key: string) => obj[key] || '', item)
      : (item as any)[field.key];
    const displayValue = Array.isArray(value) ? value.join(", ") : value || "Keine";

    switch (field.type) {
      case 'h1':
        return <h1 className="text-2xl font-bold mb-2">{displayValue}</h1>;
      case 'h2':
        return <h2 className="text-xl font-semibold mb-2">{displayValue}</h2>;
      case 'h3':
        return <h3 className="text-lg font-medium mb-2">{displayValue}</h3>;
      case 'text':
      default:
        return (
          <p
            className="mb-2 text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: displayValue }}
          />
        );
    }
  };

  return (
    <div className="page-content px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <BreadCrumb title="Berichte" pageTitle="Reporting" />

        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Berichtskonfiguration
          </h4>

          <div className="mb-4">
            <label htmlFor="mainTableSelect" className="block text-gray-700 dark:text-gray-300 mb-2">
              Haupttabelle auswählen
            </label>
            <select
              id="mainTableSelect"
              value={tableConfig.name}
              onChange={(e) => handleTableChange(e.target.value, 'main')}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {availableTables.map((table) => (
                <option key={table.name} value={table.name}>
                  {table.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <h5 className="text-gray-800 dark:text-white mb-2">Felder der Haupttabelle auswählen</h5>
            {tableConfig.fields.map((field, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  value={field.key}
                  onChange={(e) => handleFieldConfigChange(index, 'key', e.target.value, 'main')}
                  className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  {availableTables
                    .find((table) => table.name === tableConfig.name)
                    ?.fields.map((fieldKey) => (
                      <option key={fieldKey} value={fieldKey}>
                        {fieldLabels[fieldKey] || fieldKey}
                      </option>
                    ))}
                </select>
                <select
                  value={field.type}
                  onChange={(e) => handleFieldConfigChange(index, 'type', e.target.value, 'main')}
                  className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="h1">Überschrift 1</option>
                  <option value="h2">Überschrift 2</option>
                  <option value="h3">Überschrift 3</option>
                  <option value="text">Text</option>
                </select>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label htmlFor="dep1TableSelect" className="block text-gray-700 dark:text-gray-300 mb-2">
              Abhängige Tabelle 1 auswählen (optional)
            </label>
            <select
              id="dep1TableSelect"
              value={tableConfig.dependency1?.name || ''}
              onChange={(e) => handleTableChange(e.target.value, 'dep1')}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Keine</option>
              {availableTables
                .filter((table) => table.name !== tableConfig.name)
                .map((table) => (
                  <option key={table.name} value={table.name}>
                    {table.label}
                  </option>
                ))}
            </select>
          </div>

          {tableConfig.dependency1 && (
            <div className="mb-4">
              <h5 className="text-gray-800 dark:text-white mb-2">Felder der Abhängigen Tabelle 1 auswählen</h5>
              {tableConfig.dependency1.fields.map((field, index) => {
                const dep1Name = tableConfig.dependency1?.name;
                const depTable = dep1Name ? availableTables.find((table) => table.name === dep1Name) : null;
                return (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <select
                      value={field.key}
                      onChange={(e) => handleFieldConfigChange(index, 'key', e.target.value, 'dep1')}
                      className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      {depTable?.fields.map((fieldKey) => (
                        <option key={fieldKey} value={fieldKey}>
                          {fieldLabels[fieldKey] || fieldKey}
                        </option>
                      ))}
                    </select>
                    <select
                      value={field.type}
                      onChange={(e) => handleFieldConfigChange(index, 'type', e.target.value, 'dep1')}
                      className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="h1">Überschrift 1</option>
                      <option value="h2">Überschrift 2</option>
                      <option value="h3">Überschrift 3</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          {tableConfig.dependency1 && (
            <div className="mb-4">
              <label htmlFor="dep2TableSelect" className="block text-gray-700 dark:text-gray-300 mb-2">
                Abhängige Tabelle 2 auswählen (optional)
              </label>
              <select
                id="dep2TableSelect"
                value={tableConfig.dependency2?.name || ''}
                onChange={(e) => handleTableChange(e.target.value, 'dep2')}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Keine</option>
                {availableTables
                  .filter(
                    (table) =>
                      table.name !== tableConfig.name &&
                      table.name !== (tableConfig.dependency1?.name || '')
                  )
                  .map((table) => (
                    <option key={table.name} value={table.name}>
                      {table.label}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {tableConfig.dependency1 && tableConfig.dependency2 && (
            <div className="mb-4">
              <h5 className="text-gray-800 dark:text-white mb-2">Felder der Abhängigen Tabelle 2 auswählen</h5>
              {tableConfig.dependency2.fields.map((field, index) => {
                const dep2Name = tableConfig.dependency2?.name;
                const depTable = dep2Name ? availableTables.find((table) => table.name === dep2Name) : null;
                return (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <select
                      value={field.key}
                      onChange={(e) => handleFieldConfigChange(index, 'key', e.target.value, 'dep2')}
                      className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      {depTable?.fields.map((fieldKey) => (
                        <option key={fieldKey} value={fieldKey}>
                          {fieldLabels[fieldKey] || fieldKey}
                        </option>
                      ))}
                    </select>
                    <select
                      value={field.type}
                      onChange={(e) => handleFieldConfigChange(index, 'type', e.target.value, 'dep2')}
                      className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="h1">Überschrift 1</option>
                      <option value="h2">Überschrift 2</option>
                      <option value="h3">Überschrift 3</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Bericht generieren
          </button>
        </div>

        {error && (
          <div className="mt-6 text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {reportGenerated && report && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {report ? report.reportName : "Bericht"}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Generiert am: {new Date(report.generatedAt).toLocaleString()}
            </p>
            {report.data && report.data.length > 0 ? (
              report.data.map((item, index) => (
                <div key={index} className="mb-6">
                  {tableConfig.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex}>
                      {renderField(item, field)}
                    </div>
                  ))}
                  {tableConfig.dependency1 && (item as any)[tableConfig.dependency1.name]?.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-gray-800 dark:text-white mb-2">
                        {tableConfig.dependency1.name
                          ? availableTables.find((t) => t.name === tableConfig.dependency1.name)?.label || "Abhängige Tabelle 1"
                          : "Abhängige Tabelle 1"}
                      </h5>
                      {(item as any)[tableConfig.dependency1.name].map((subItem: any, subIndex: number) => (
                        <div key={subIndex} className="mb-4">
                          {tableConfig.dependency1.fields.map((field) => (
                            <div key={field.key}>
                              {renderField(subItem, field)}
                            </div>
                          ))}
                          {tableConfig.dependency2 && tableConfig.dependency2.name && subItem[tableConfig.dependency2.name]?.length > 0 && (
                            <div className="mt-4 ml-4">
                              <h5 className="text-gray-800 dark:text-white mb-2">
                                {tableConfig.dependency2.name
                                  ? availableTables.find((t) => t.name === tableConfig.dependency2.name)?.label || "Abhängige Tabelle 2"
                                  : "Abhängige Tabelle 2"}
                              </h5>
                              {subItem[tableConfig.dependency2.name].map((subSubItem: any, subSubIndex: number) => (
                                <div key={subSubIndex} className="mb-2">
                                  {tableConfig.dependency2.fields.map((field) => (
                                    <div key={field.key}>
                                      {renderField(subSubItem, field)}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-700 dark:text-gray-300">Keine Daten im Bericht verfügbar.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;