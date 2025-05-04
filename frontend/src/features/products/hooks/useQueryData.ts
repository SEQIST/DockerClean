// src/features/products/hooks/useQueryData.js
import { useState, useEffect } from 'react';

const useQueryData = () => {
  const [entities] = useState(['Work Products', 'Rollen', 'Aktivitäten', 'Prozesse']);
  const [selectedEntity, setSelectedEntity] = useState('Rollen'); // Standardmäßig auf "Rollen" setzen
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState(['name', 'description']); // Standardmäßig für Rollenhandbuch
  const [data, setData] = useState([]);
  const [dependencies, setDependencies] = useState([]); // Standardwert: leeres Array
  const [selectedDependencies, setSelectedDependencies] = useState([]); // Hinzugefügt
  const [dependencyHierarchy, setDependencyHierarchy] = useState([['Aktivitäten']]); // Standardmäßig für Rollenhandbuch
  const [dependencyFields, setDependencyFields] = useState({
    Aktivitäten: ['name', 'description', 'trigger', 'result'],
    Rollen: ['name', 'description'],
    'Work Products': ['name', 'description'],
  }); // Standardmäßig für Rollenhandbuch
  const [dependencyData, setDependencyData] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedQueries, setSavedQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);

  // Gespeicherte Abfragen laden
  useEffect(() => {
    const fetchSavedQueries = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/queries');
        if (!response.ok) throw new Error('Fehler beim Abrufen der gespeicherten Abfragen');
        const data = await response.json();
        setSavedQueries(data);
      } catch (error) {
        console.error('Fehler beim Abrufen der gespeicherten Abfragen:', error);
        setError(error.message);
      }
    };

    const loadDependenciesAndQuery = async () => {
      await fetchSavedQueries();

      // Standardabfrage setzen
      setSelectedEntity('Rollen');
      setSelectedFields(['name', 'description']);
      setDependencyHierarchy([['Aktivitäten']]); // Nur Aktivitäten als Abhängigkeit
      setDependencyFields({
        Aktivitäten: ['name', 'description', 'trigger', 'result'], // Trigger und Result für Rollenhandbuch
        Rollen: ['name', 'description'],
        'Work Products': ['name', 'description'],
      });

      // Abhängigkeiten laden
      await Promise.all([
        fetchDependencyData('Aktivitäten'),
        fetchDependencyData('Rollen'),
        fetchDependencyData('Work Products'),
      ]);

      // Standardabfrage ausführen
      handleQuery();
    };

    loadDependenciesAndQuery();
  }, []); // Keine Bedingung, immer ausführen

  // Daten abrufen
  useEffect(() => {
    if (selectedEntity) {
      fetchData();
      // Abhängigkeiten für Rollenhandbuch abrufen
      fetchDependencyData('Aktivitäten');
      fetchDependencyData('Rollen');
      fetchDependencyData('Work Products');
    }
  }, [selectedEntity]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      switch (selectedEntity) {
        case 'Work Products':
          endpoint = 'http://localhost:5001/api/workproducts';
          break;
        case 'Rollen':
          endpoint = 'http://localhost:5001/api/roles';
          break;
        case 'Aktivitäten':
          endpoint = 'http://localhost:5001/api/activities';
          break;
        case 'Prozesse':
          endpoint = 'http://localhost:5001/api/processes';
          break;
        default:
          throw new Error('Unbekannte Entität');
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Fehler beim Abrufen der ${selectedEntity}`);
      const data = await response.json();
      setData(data);

      // Felder basierend auf der Entität setzen
      if (data.length > 0) {
        const sample = data[0];
        const availableFields = Object.keys(sample).filter(key => key !== '_id' && key !== '__v');
        setFields(availableFields);

        // Abhängigkeiten basierend auf der Entität setzen
        let deps = [];
        if (selectedEntity === 'Rollen') {
          deps = ['Aktivitäten', 'Work Products', 'Prozesse'];
        } else if (selectedEntity === 'Aktivitäten') {
          deps = ['Work Products', 'Rollen', 'Prozesse'];
        } else if (selectedEntity === 'Prozesse') {
          deps = ['Aktivitäten', 'Work Products', 'Rollen'];
        } else if (selectedEntity === 'Work Products') {
          deps = ['Aktivitäten', 'Rollen'];
        }
        setDependencies(deps);
      } else {
        setFields([]);
        setDependencies([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchDependencyData = async (dep) => {
    let endpoint = '';
    switch (dep) {
      case 'Work Products':
        endpoint = 'http://localhost:5001/api/workproducts';
        break;
      case 'Rollen':
        endpoint = 'http://localhost:5001/api/roles';
        break;
      case 'Aktivitäten':
        endpoint = 'http://localhost:5001/api/activities';
        break;
      case 'Prozesse':
        endpoint = 'http://localhost:5001/api/processes';
        break;
      default:
        console.warn(`Unbekannte Abhängigkeit: ${dep}`);
        return [];
    }

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Fehler beim Abrufen der ${dep}: ${response.statusText}`);
      const data = await response.json();
      setDependencyData(prev => ({
        ...prev,
        [dep]: Array.isArray(data) ? data : [],
      }));
      // Nur Felder setzen, wenn sie noch nicht definiert sind
      if (!dependencyFields[dep] || dependencyFields[dep].length === 0) {
        if (Array.isArray(data) && data.length > 0) {
          const sample = data[0];
          const availableFields = Object.keys(sample).filter(key => key !== '_id' && key !== '__v');
          setDependencyFields(prev => ({
            ...prev,
            [dep]: availableFields,
          }));
        } else {
          setDependencyFields(prev => ({
            ...prev,
            [dep]: [],
          }));
        }
      }
      return data; // Rückgabe der Daten für Debugging
    } catch (error) {
      console.error('Fehler beim Abrufen der Abhängigkeiten:', error);
      setDependencyFields(prev => ({
        ...prev,
        [dep]: [],
      }));
      setDependencyData(prev => ({
        ...prev,
        [dep]: [],
      }));
      return []; // Rückgabe eines leeren Arrays bei Fehler
    }
  };

  const handleQuery = () => {
    const filteredData = data.map(item => {
      const result = {};
      selectedFields.forEach(field => {
        result[field] = item[field] || 'N/A';
      });

      // Rollenhandbuch-spezifische Logik
      if (selectedEntity === 'Rollen') {
        // Aktivitäten für die Rolle abrufen
        const activities = (dependencyData['Aktivitäten'] || []).filter(
          act => act.executedBy?._id === item._id || act.executedBy === item._id
        );

        // Aktivitäten alphabetisch sortieren
        activities.sort((a, b) => a.name.localeCompare(b.name));

        const activityData = activities.map(act => {
          const actResult = {
            name: act.name || 'N/A',
            description: act.description || 'N/A',
            executionMode: act.executionMode || 'N/A',
            workMode: act.workMode || 'N/A',
            trigger: act.trigger || { workProducts: [] }, // Trigger-Daten hinzufügen
          };

          // Trigger (Work Products) abrufen
          const triggerWorkProductIds = act.trigger?.workProducts?.map(triggerWp => triggerWp._id?.toString()) || [];
          console.log(`Trigger Work Product IDs for ${act.name}:`, triggerWorkProductIds);

          const triggerWorkProducts = (dependencyData['Work Products'] || []).filter(wp => {
            const wpId = wp._id?.toString();
            const isMatch = triggerWorkProductIds.includes(wpId);
            console.log(`Checking Work Product ${wp.name} (ID: ${wpId}) - Match: ${isMatch}`);
            return isMatch;
          }).map(wp => ({
            name: wp.name || 'N/A',
            description: wp.description || 'N/A',
            _id: wp._id || 'N/A',
          }));

          console.log(`Trigger Work Products for ${act.name}:`, triggerWorkProducts);

          // Ergebnis Work Product abrufen
          const resultWorkProduct = (dependencyData['Work Products'] || []).find(
            wp => wp._id === act.result?._id || wp._id === act.result
          );

          // ExecutedBy in ein Array konvertieren
          const executedBy = act.executedBy ? (Array.isArray(act.executedBy) ? act.executedBy : [act.executedBy]) : [];

          actResult.trigger.workProducts = triggerWorkProducts;
          actResult.resultWorkProduct = resultWorkProduct ? {
            name: resultWorkProduct.name || 'N/A',
            description: resultWorkProduct.description || 'N/A',
          } : null;
          actResult.executedBy = executedBy; // Füge executedBy als Array hinzu

          return actResult;
        });

        result.activities = activityData;
      }

      console.log('Dependency Hierarchy:', dependencyHierarchy);
      dependencyHierarchy.forEach((depLevel, level) => {
        depLevel.forEach(dep => {
          console.log(`Verarbeite Abhängigkeit: ${dep} für Item:`, item);
          console.log(`Dependency Data für ${dep}:`, dependencyData[dep]);
          const filteredDepData = (dependencyData[dep] || []).filter(depItem => {
            if (dep === 'Aktivitäten') {
              return depItem.executedBy?._id === item._id || depItem.executedBy === item._id;
            }
            return true;
          }).map(depItem => {
            const depResult = {};
            (dependencyFields[dep] || []).forEach(field => {
              depResult[field] = depItem[field] || 'N/A';
            });
            return depResult;
          });
          console.log(`Gefilterte Daten für ${dep}:`, filteredDepData);
          result[dep] = filteredDepData;
        });
      });

      return result;
    });

    // Rollen alphabetisch sortieren
    filteredData.sort((a, b) => a.name.localeCompare(b.name));

    console.log('Filtered Data:', filteredData);
    setResults(filteredData);
  };

  const handleLoadQuery = (query) => {
    setSelectedEntity(query.entity);
    setSelectedFields(query.fields);
    setDependencyHierarchy(query.dependencies || []); // Sicherstellen, dass dependencyHierarchy immer ein Array ist
    setDependencyFields(query.dependencyFields);
    setResults([]);
    query.dependencies.forEach(dep => fetchDependencyData(dep));
  };

  return {
    entities,
    selectedEntity,
    setSelectedEntity,
    fields,
    selectedFields,
    setSelectedFields,
    data,
    dependencies,
    setDependencies,
    selectedDependencies,
    setSelectedDependencies,
    dependencyHierarchy,
    setDependencyHierarchy,
    dependencyFields,
    setDependencyFields,
    dependencyData,
    results,
    setResults,
    loading,
    error,
    fetchDependencyData,
    handleQuery,
    savedQueries,
    setSavedQueries,
    selectedQuery,
    setSelectedQuery,
    handleLoadQuery,
  };
};

export default useQueryData;