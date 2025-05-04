// features/engineering/components/useDataImport.js
import { useState, useEffect } from 'react';
// import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Setze den Worker für pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const useDataImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedItems, setParsedItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [rteContent, setRteContent] = useState('');

  // Datei-Upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setErrorMessage('');
    setParsedItems([]);
    setGroupedItems([]);
    setRteContent('');
  };

  // Parsing mit Überschriftenerkennung
  const handleParse = async () => {
    if (!selectedFile) {
      setErrorMessage('Bitte wählen Sie eine Datei aus.');
      return;
    }

    try {
      let parsedData = null;
      let groups = [];
      let items = [];
      const fileName = selectedFile.name.toLowerCase();

      if (fileName.endsWith('.json')) {
        const fileContent = await selectedFile.text();
        parsedData = JSON.parse(fileContent);
        items = Array.isArray(parsedData)
          ? parsedData
              .filter(item => item && (item.text || item.name || item.description))
              .map(item => ({
                id: item.id || uuidv4(),
                text: item.text || item.name || item.description || 'Unbekannt',
                type: 'Requirement',
                groupId: null,
              }))
          : [{ id: uuidv4(), text: 'Unbekanntes Element', type: 'Requirement', groupId: null }];
      } else if (fileName.endsWith('.csv')) {
        const fileContent = await selectedFile.text();
        const workbook = XLSX.read(fileContent, { type: 'string' });
        parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        items = parsedData.map((item, index) => ({
          id: item.id || uuidv4(),
          text: item.text || item.name || item.description || `Zeile ${index + 1}`,
          type: 'Requirement',
          groupId: null,
        }));
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        const fileContent = await selectedFile.text();
        const lines = fileContent.split('\n');
        let currentGroup = null;

        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          const headerMatch = trimmed.match(/^(#+)\s*(.*)$/);
          if (headerMatch) {
            const headerLevel = headerMatch[1].length;
            const headerText = headerMatch[2];
            if (headerLevel === 1) {
              const groupId = uuidv4();
              groups.push({ id: groupId, name: headerText, items: [] });
              currentGroup = groupId;
            }
            items.push({
              id: uuidv4(),
              text: headerText,
              type: 'Header',
              groupId: currentGroup,
            });
          } else {
            items.push({
              id: uuidv4(),
              text: trimmed,
              type: 'Requirement',
              groupId: currentGroup,
            });
          }
        });
      } else if (fileName.endsWith('.pdf')) {
        const buffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(new Uint8Array(buffer)).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
        const lines = text.split('\n');
        let currentGroup = null;
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          if (trimmed.length < 50 && trimmed === trimmed.toUpperCase()) {
            const groupId = uuidv4();
            groups.push({ id: groupId, name: trimmed, items: [] });
            currentGroup = groupId;
            items.push({
              id: uuidv4(),
              text: trimmed,
              type: 'Header',
              groupId: currentGroup,
            });
          } else {
            items.push({
              id: uuidv4(),
              text: trimmed,
              type: 'Requirement',
              groupId: currentGroup,
            });
          }
        });
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        const buffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        const lines = result.value.split('\n');
        let currentGroup = null;
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          if (trimmed.length < 50) {
            const groupId = uuidv4();
            groups.push({ id: groupId, name: trimmed, items: [] });
            currentGroup = groupId;
            items.push({
              id: uuidv4(),
              text: trimmed,
              type: 'Header',
              groupId: currentGroup,
            });
          } else {
            items.push({
              id: uuidv4(),
              text: trimmed,
              type: 'Requirement',
              groupId: currentGroup,
            });
          }
        });
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
        items = parsedData.map((item, index) => ({
          id: item.id || uuidv4(),
          text: item.text || item.name || item.description || `Zeile ${index + 1}`,
          type: 'Requirement',
          groupId: null,
        }));
      } else if (fileName.endsWith('.reqif')) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const response = await axios.post('/api/engineering/parse-reqif', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        parsedData = response.data;
        items = parsedData.map(item => ({
          id: item.id || uuidv4(),
          text: item.text || 'Unbekannt',
          type: 'Requirement',
          groupId: null,
        }));
      } else {
        throw new Error('Nicht unterstützter Dateityp.');
      }

      // Sicherheitsprüfung: Stelle sicher, dass alle Items eine ID haben
      items = items.map(item => ({
        ...item,
        id: item.id || uuidv4(), // Falls id undefined ist, generiere eine neue
      }));
      groups = groups.map(group => ({
        ...group,
        id: group.id || uuidv4(), // Falls group.id undefined ist, generiere eine neue
      }));

      setParsedItems(items);
      setGroupedItems(groups);
    } catch (error) {
      console.error('Fehler beim Parsen:', error);
      setErrorMessage('Fehler beim Parsen der Datei: ' + error.message);
    }
  };

  // Gruppierung
  const createGroup = (name = `Gruppe ${groupedItems.length + 1}`) => {
    const groupId = uuidv4();
    setGroupedItems([...groupedItems, { id: groupId, name, items: [] }]);
    return groupId;
  };

  const addToGroup = (itemIds, groupId) => {
    setParsedItems(prevItems =>
      prevItems.map(item =>
        itemIds.includes(item.id) ? { ...item, groupId } : item
      )
    );
  };

  const removeFromGroup = (itemId) => {
    setParsedItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, groupId: null } : item
      )
    );
  };

  // Typ ändern
  const handleTypeChange = (itemId, newType) => {
    setParsedItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, type: newType } : item
      )
    );
  };

  // Drag-and-Drop (vorübergehend entfernt)
  const onDragEnd = (result) => {
    // Wird später hinzugefügt
  };

  // RTF-Vorschau
  useEffect(() => {
    const grouped = groupedItems.map(group => ({
      ...group,
      items: parsedItems.filter(item => item.groupId === group.id),
    }));
    const ungrouped = parsedItems.filter(item => !item.groupId);

    let htmlContent = '';
    grouped.forEach(group => {
      htmlContent += `<h3>${group.name}</h3><ul>`;
      group.items.forEach(item => {
        htmlContent += `<li><strong>${item.type}:</strong> ${item.text}</li>`;
      });
      htmlContent += '</ul>';
    });
    if (ungrouped.length) {
      htmlContent += '<h3>Ungruppierte Elemente</h3><ul>';
      ungrouped.forEach(item => {
        htmlContent += `<li><strong>${item.type}:</strong> ${item.text}</li>`;
      });
      htmlContent += '</ul>';
    }

    setRteContent(htmlContent);
  }, [parsedItems, groupedItems]);

  return {
    selectedFile,
    handleFileChange,
    handleParse,
    parsedItems,
    groupedItems,
    createGroup,
    addToGroup,
    removeFromGroup,
    onDragEnd,
    handleTypeChange,
    rteContent,
    errorMessage,
    setErrorMessage,
  };
};

export default useDataImport;