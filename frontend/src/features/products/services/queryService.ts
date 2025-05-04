// src/features/products/services/queryService.js
export const saveQuery = async (query) => {
    try {
      const response = await fetch('http://localhost:5001/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      if (!response.ok) throw new Error('Fehler beim Speichern der Abfrage');
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  };
  
  export const fetchQueries = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/queries');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Abfragen');
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  };