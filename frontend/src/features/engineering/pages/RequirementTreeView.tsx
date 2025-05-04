// features/engineering/components/RequirementTreeView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';

const RequirementTreeView = ({
  filteredCustomerRequirements,
  selectedRequirement,
  setSelectedRequirement,
  selectedProject,
  setAllItems,
}) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [allItems, setLocalAllItems] = useState([]);
  const [filter, setFilter] = useState({
    Header: true,
    Information: true,
    Definition: true,
    Requirement: true,
  });
  const textRefs = useRef({});

  // Handle Filter-Änderung
  const handleFilterChange = (category) => (event) => {
    setFilter({
      ...filter,
      [category]: event.target.checked,
    });
  };

  // Hilfsfunktion, um alle Elemente zu extrahieren (für den scrollbaren Text)
  const extractAllItems = (parsedItems, groupedItems) => {
    const items = [];

    // Verarbeite Gruppen
    groupedItems.forEach(group => {
      items.push({
        id: group.id,
        text: group.name,
        type: 'Header',
      });
      if (group.items && Array.isArray(group.items)) {
        group.items.forEach(item => {
          items.push({
            id: item.id,
            text: item.text,
            type: item.type || 'Requirement',
            classification: item.classification,
            completed: item.completed,
          });
        });
      }
    });

    // Verarbeite ungruppierte Elemente
    if (parsedItems && Array.isArray(parsedItems)) {
      parsedItems
        .filter(item => !item.groupId)
        .forEach(item => {
          items.push({
            id: item.id,
            text: item.text,
            type: item.type || 'Requirement',
            classification: item.classification,
            completed: item.completed,
          });
        });
    }

    return items;
  };

  // Konvertiere die Daten in die Struktur, die Syncfusion TreeView erwartet
  useEffect(() => {
    if (!filteredCustomerRequirements || filteredCustomerRequirements.length === 0) {
      setTreeData([]);
      setLocalAllItems([]);
      setAllItems([]);
      return;
    }

    // Extrahiere parsedItems und groupedItems aus den gefilterten Anforderungen
    const parsedItems = [];
    const groupedItems = [];

    // Verarbeite Anforderungen (Kunden- oder Systemanforderungen)
    filteredCustomerRequirements.forEach(item => {
      // Prüfe, ob das Element die erwarteten Eigenschaften hat
      if (item.groups && Array.isArray(item.groups)) {
        item.groups.forEach(group => {
          groupedItems.push({
            id: group.id || `group-${item.id || 'unknown'}-${group.name}`,
            name: group.name || 'Unbenannte Gruppe',
            items: group.items || group.requirements || [],
          });
        });
      }
      if (item.ungrouped && Array.isArray(item.ungrouped)) {
        item.ungrouped.forEach(req => {
          parsedItems.push({
            id: req.id,
            text: req.text || 'Unbenanntes Element',
            type: req.type || 'Requirement',
            classification: req.classification,
            completed: req.completed,
            groupId: null,
          });
        });
      }
      // Verarbeite Gruppenelemente in parsedItems
      if (item.groups && Array.isArray(item.groups)) {
        item.groups.forEach(group => {
          const groupItems = group.items || group.requirements || [];
          if (groupItems && Array.isArray(groupItems)) {
            groupItems.forEach(req => {
              parsedItems.push({
                id: req.id,
                text: req.text || 'Unbenanntes Element',
                type: req.type || 'Requirement',
                classification: req.classification,
                completed: req.completed,
                groupId: group.id || `group-${item.id || 'unknown'}-${group.name}`,
              });
            });
          }
        });
      }

      // Fallback: Wenn keine groups/ungrouped vorhanden sind, behandle das Element direkt als Anforderung
      if (!item.groups && !item.ungrouped && item.id && (item.name || item.text || item.header)) {
        parsedItems.push({
          id: item.id,
          text: item.name || item.text || item.header || 'Unbenanntes Element',
          type: item.type || item.classification || 'Requirement',
          classification: item.classification,
          completed: item.completed,
          groupId: null,
        });
      }
    });

    // Filtere die Elemente basierend auf den Checkboxen
    const filteredParsedItems = parsedItems.filter(item => {
      const classification = item.classification || item.type || 'Requirement';
      return filter[classification];
    });

    const filteredGroupedItems = groupedItems
      .map(group => ({
        ...group,
        items: (group.items || []).filter(item => {
          const classification = item.classification || item.type || 'Requirement';
          return filter[classification];
        }),
      }))
      .filter(group => group.items.length > 0 || filter['Header']);

    // Erstelle die Baumstruktur
    const data = [
      {
        id: 'ungrouped',
        name: 'Ungruppierte Elemente',
        expanded: true,
        hasChildren: filteredParsedItems.filter(item => !item.groupId).length > 0,
        children: filteredParsedItems
          .filter(item => !item.groupId)
          .map(item => ({
            id: `ungrouped-${item.id}`,
            name: item.text,
            type: item.type || 'Requirement',
          })),
      },
      ...filteredGroupedItems.map(group => ({
        id: `group-${group.id}`,
        name: group.name,
        expanded: true,
        hasChildren: group.items.length > 0,
        children: group.items.map(item => ({
          id: `grouped-${item.id}`,
          name: item.text,
          type: item.type || 'Requirement',
        })),
      })),
    ];
    setTreeData(data);

    // Extrahiere alle Elemente für den scrollbaren Text
    const items = extractAllItems(filteredParsedItems, filteredGroupedItems);
    setLocalAllItems(items);
    setAllItems(items);
  }, [filteredCustomerRequirements, setAllItems, filter]);

  // Handle Knoten-Auswahl (Baum → Text)
  const onNodeSelect = (args) => {
    const nodeData = args.nodeData;
    const selectedItem = allItems.find(item => item.id === nodeData.id.replace(/(ungrouped-|grouped-|system-)/, ''));
    setSelectedNode(selectedItem || null);
    setSelectedRequirement(selectedItem);

    // Scrolle zum entsprechenden Textabschnitt und hebe ihn hervor
    if (selectedItem && textRefs.current[selectedItem.id]) {
      textRefs.current[selectedItem.id].scrollIntoView({ behavior: 'smooth', block: 'center' });
      textRefs.current[selectedItem.id].style.backgroundColor = '#e0e0e0';
      setTimeout(() => {
        if (textRefs.current[selectedItem.id]) {
          textRefs.current[selectedItem.id].style.backgroundColor = '';
        }
      }, 2000);
    }
  };

  // Handle Text-Auswahl (Text → Baum)
  const onTextClick = (itemId) => {
    const selectedItem = allItems.find(item => item.id === itemId);
    setSelectedNode(selectedItem || null);
    setSelectedRequirement(selectedItem);

    // Wähle den Knoten im Baum aus
    const treeObj = document.querySelector('.e-treeview').ej2_instances[0];
    if (treeObj && itemId) {
      // Prüfe, ob das Element in einer Gruppe oder ungruppiert ist
      const isGrouped = selectedItem.groupId;
      let nodeId;
      if (isGrouped) {
        nodeId = `grouped-${itemId}`;
      } else {
        nodeId = `ungrouped-${itemId}`;
      }
      treeObj.selectedNodes = [nodeId];
    }
  };

  // Erstelle den gesamten scrollbaren Text
  const fullText = allItems.map(item => (
    <Typography
      key={item.id}
      ref={el => (textRefs.current[item.id] = el)}
      sx={{
        whiteSpace: 'pre-wrap',
        cursor: 'pointer',
        p: 1,
        '&:hover': { bgcolor: '#f0f0f0' },
      }}
      onClick={() => onTextClick(item.id)}
      dangerouslySetInnerHTML={{ __html: item.text }}
    />
  ));

  if (allItems.length === 0) {
    return <Typography>Keine Daten verfügbar</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Links: Baumstruktur */}
        <Box sx={{ width: '20%', maxHeight: 600, overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom sx={{ ml: -1 }}>
            Geparse Daten
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={filter.Header} onChange={handleFilterChange('Header')} />}
              label="Header"
            />
            <FormControlLabel
              control={<Checkbox checked={filter.Information} onChange={handleFilterChange('Information')} />}
              label="Information"
            />
            <FormControlLabel
              control={<Checkbox checked={filter.Definition} onChange={handleFilterChange('Definition')} />}
              label="Definition"
            />
            <FormControlLabel
              control={<Checkbox checked={filter.Requirement} onChange={handleFilterChange('Requirement')} />}
              label="Requirement"
            />
          </Box>
          <TreeViewComponent
            fields={{ dataSource: treeData, id: 'id', text: 'name', child: 'children' }}
            allowDragAndDrop={true}
            nodeSelected={onNodeSelect}
            cssClass="custom-tree"
          />
        </Box>

        {/* Mitte: Scrollbarer Text */}
        <Box sx={{ width: '80%', maxHeight: 600, overflowY: 'auto', p: 2, bgcolor: 'grey.100' }}>
          <Typography variant="h6" gutterBottom>
            Dokumentinhalt
          </Typography>
          {fullText}
        </Box>

        {/* Rechts: Wird von RequirementEvaluation bereitgestellt */}
      </Box>
    </Box>
  );
};

export default RequirementTreeView;