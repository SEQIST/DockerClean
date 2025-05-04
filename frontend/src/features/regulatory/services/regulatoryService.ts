
// #### 1.2. `features/regulatory/services/regulatoryService.js`
// Hier lagern wir alle API-Aufrufe aus.

// ```javascript
// features/regulatory/services/regulatoryService.js
const fetchRegulatoryISOs = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/regulatory-isos');
    if (!response.ok) throw new Error('Fehler beim Abrufen der Regulatorien');
    const data = await response.json();
    console.log('Regulatory ISOs:', data);
    return data;
  } catch (error) {
    console.error('Error fetching regulatory ISOs:', error);
    throw error;
  }
};

const fetchRegulatoryContents = async (regulatoryISOId, pageNum, itemsPerPage) => {
  try {
    const response = await fetch(`http://localhost:5001/api/regulatory-content?regulatoryISO=${regulatoryISOId}&page=${pageNum}&limit=${itemsPerPage}`);
    if (!response.ok) throw new Error('Fehler beim Abrufen der Inhaltselemente');
    const data = await response.json();
    console.log('Regulatory Contents (Page ' + pageNum + '):', data);
    return data;
  } catch (error) {
    console.error('Error fetching regulatory contents:', error);
    throw error;
  }
};

const fetchAllContentsForCache = async (regulatoryISOId) => {
  try {
    const response = await fetch(`http://localhost:5001/api/regulatory-content?regulatoryISO=${regulatoryISOId}&limit=10000`);
    if (!response.ok) throw new Error('Fehler beim Abrufen der Inhaltselemente für Cache');
    const data = await response.json();
    console.log('Cached Contents:', data);
    return data;
  } catch (error) {
    console.error('Error fetching all contents for cache:', error);
    throw error;
  }
};

const fetchRegulatoryEvaluations = async (regulatoryISOId) => {
  try {
    const contents = await fetch(`http://localhost:5001/api/regulatory-content?regulatoryISO=${regulatoryISOId}`).then(res => res.json());
    const contentIds = contents.map(content => content._id);
    const response = await fetch('http://localhost:5001/api/regulatory-evaluations');
    if (!response.ok) throw new Error('Fehler beim Abrufen der Bewertungen');
    const data = await response.json();
    const filteredEvaluations = data.filter(evaluation => evaluation.regulatoryContent && contentIds.includes(evaluation.regulatoryContent._id.toString()));
    console.log('Filtered Regulatory Evaluations:', filteredEvaluations);
    return filteredEvaluations;
  } catch (error) {
    console.error('Error fetching regulatory evaluations:', error);
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

const addRegulatory = async (newRegulatoryName) => {
  try {
    const newRegulatoryISO = {
      name: newRegulatoryName,
      description: '',
      source: 'Manuell',
    };
    const response = await fetch('http://localhost:5001/api/regulatory-isos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRegulatoryISO),
    });
    const savedRegulatoryISO = await response.json();
    return savedRegulatoryISO;
  } catch (error) {
    console.error('Error adding regulatory ISO:', error);
    throw error;
  }
};

const deleteRegulatory = async (id) => {
  try {
    await fetch(`http://localhost:5001/api/regulatory-isos/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting regulatory ISO:', error);
    throw error;
  }
};

const deleteContent = async (id) => {
  try {
    await fetch(`http://localhost:5001/api/regulatory-content/${id}`, {
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
    const response = await fetch(`http://localhost:5001/api/regulatory-content/${contentId}`, {
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
  fetchRegulatoryISOs,
  fetchRegulatoryContents,
  fetchAllContentsForCache,
  fetchRegulatoryEvaluations,
  fetchEvaluationForContent,
  createEvaluation,
  fetchRoles,
  fetchProcesses,
  fetchActivities,
  fetchWorkProducts,
  uploadFile,
  addRegulatory,
  deleteRegulatory,
  deleteContent,
  updateEvaluation,
  updateContentType,
};