// features/engineering/services/engineeringService.js
const fetchEngineeringStandards = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/engineering/standards');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Engineering-Standards');
      const data = await response.json();
      console.log('Engineering Standards:', data);
      return data;
    } catch (error) {
      console.error('Error fetching engineering standards:', error);
      throw error;
    }
  };
  
  const fetchEngineeringContents = async (engineeringStandardId, pageNum, itemsPerPage) => {
    try {
      const response = await fetch(`http://localhost:5001/api/engineering/content?engineeringStandard=${engineeringStandardId}&page=${pageNum}&limit=${itemsPerPage}`);
      if (!response.ok) throw new Error('Fehler beim Abrufen der Engineering-Inhaltselemente');
      const data = await response.json();
      console.log('Engineering Contents (Page ' + pageNum + '):', data);
      return data;
    } catch (error) {
      console.error('Error fetching engineering contents:', error);
      throw error;
    }
  };
  
  const fetchAllEngineeringContentsForCache = async (engineeringStandardId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/engineering/content?engineeringStandard=${engineeringStandardId}&limit=10000`);
      if (!response.ok) throw new Error('Fehler beim Abrufen der Engineering-Inhaltselemente für Cache');
      const data = await response.json();
      console.log('Cached Engineering Contents:', data);
      return data;
    } catch (error) {
      console.error('Error fetching all engineering contents for cache:', error);
      throw error;
    }
  };
  
  const fetchEngineeringEvaluations = async (engineeringStandardId) => {
    try {
      const contents = await fetch(`http://localhost:5001/api/engineering/content?engineeringStandard=${engineeringStandardId}`).then(res => res.json());
      const contentIds = contents.map(content => content._id);
      const response = await fetch('http://localhost:5001/api/regulatory-evaluations');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Bewertungen');
      const data = await response.json();
      const filteredEvaluations = data.filter(evaluation => evaluation.regulatoryContent && contentIds.includes(evaluation.regulatoryContent._id.toString()));
      console.log('Filtered Engineering Evaluations:', filteredEvaluations);
      return filteredEvaluations;
    } catch (error) {
      console.error('Error fetching engineering evaluations:', error);
      throw error;
    }
  };
  
  const fetchEvaluationForContent = async (contentId) => {
    try {
      console.log(`Fetching evaluation for contentId: ${contentId}`);
      const response = await fetch(`http://localhost:5001/api/regulatory-evaluations?regulatoryContent=${contentId}`);
      if (!response.ok) throw new Error('Fehler beim Abrufen der Bewertung');
      const data = await response.json();
      console.log(`Evaluation response for contentId ${contentId}:`, data);
      return data[0];
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      throw error;
    }
  };
  
  const createEvaluation = async (contentId) => {
    try {
      const newEvaluation = {
        regulatoryContent: contentId,
        type: 'Information',
        completed: false,
        evidencedBy: { roles: [], processes: [], activities: [], workProducts: [] },
        createdAt: new Date(),
      };
      const response = await fetch('http://localhost:5001/api/regulatory-evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvaluation),
      });
      if (!response.ok) throw new Error('Fehler beim Erstellen der Bewertung');
      const data = await response.json();
      console.log(`Created new evaluation for contentId ${contentId}:`, data);
      return data;
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
  };
  
  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/roles');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Rollen');
      const data = await response.json();
      console.log('Roles:', data);
      return data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  };
  
  const fetchProcesses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/processes');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Prozesse');
      const data = await response.json();
      console.log('Processes:', data);
      return data;
    } catch (error) {
      console.error('Error fetching processes:', error);
      throw error;
    }
  };
  
  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/activities');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Aktivitäten');
      const data = await response.json();
      console.log('Activities:', data);
      return data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  };
  
  const fetchWorkProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/workproducts');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Work Products');
      const data = await response.json();
      console.log('Work Products:', data);
      return data;
    } catch (error) {
      console.error('Error fetching work products:', error);
      throw error;
    }
  };
  
  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Fehler beim Verarbeiten der Datei');
      const result = await response.json();
      console.log('Upload Response:', result);
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  const addEngineeringStandard = async (newStandardName) => {
    try {
      const newStandard = {
        name: newStandardName,
        description: '',
        source: 'Manuell',
      };
      const response = await fetch('http://localhost:5001/api/engineering/standards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStandard),
      });
      const savedStandard = await response.json();
      return savedStandard;
    } catch (error) {
      console.error('Error adding engineering standard:', error);
      throw error;
    }
  };
  
  const deleteEngineeringStandard = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/engineering/standards/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting engineering standard:', error);
      throw error;
    }
  };
  
  const deleteContent = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/engineering/content/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  };
  
  const updateEvaluation = async (editEvaluation) => {
    try {
      const response = await fetch(`http://localhost:5001/api/regulatory-evaluations/${editEvaluation._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEvaluation),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.log('PUT Response Error Text:', errorText);
        throw new Error(`Fehler beim Speichern der Bewertung: ${errorText || response.statusText}`);
      }
      const updatedEvaluation = await response.json();
      console.log('Updated Evaluation:', updatedEvaluation);
      return updatedEvaluation;
    } catch (error) {
      console.error('Error updating evaluation:', error);
      throw error;
    }
  };
  
  const updateContentType = async (contentId, type) => {
    try {
      const response = await fetch(`http://localhost:5001/api/engineering/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.log('PUT Content Response Error Text:', errorText);
        throw new Error(`Fehler beim Aktualisieren des Inhaltselements: ${errorText || response.statusText}`);
      }
      const updatedContent = await response.json();
      console.log('Updated Content:', updatedContent);
      return updatedContent;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };
  
  export {
    fetchEngineeringStandards,
    fetchEngineeringContents,
    fetchAllEngineeringContentsForCache,
    fetchEngineeringEvaluations,
    fetchEvaluationForContent,
    createEvaluation,
    fetchRoles,
    fetchProcesses,
    fetchActivities,
    fetchWorkProducts,
    uploadFile,
    addEngineeringStandard,
    deleteEngineeringStandard,
    deleteContent,
    updateEvaluation,
    updateContentType,
  };