// features/engineering/components/ParsedDataView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';

const ParsedDataView = ({ parsedItems, groupedItems, addToGroup, handleTypeChange }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const textRefs = useRef({});

  // Konvertiere parsedItems und groupedItems in die Struktur, die Syncfusion TreeView erwartet
  useEffect(() => {
    const data = [
      {
        id: 'ungrouped',
        name: 'Ungruppierte Elemente',
        expanded: true,
        hasChildren: true,
        children: parsedItems
          .filter(item => !item.groupId)
          .map(item => ({
            id: item.id,
            name: item.text,
            type: item.type,
          })),
      },
      ...groupedItems.map(group => ({
        id: group.id,
        name: group.name,
        expanded: true,
        hasChildren: true,
        children: parsedItems
          .filter(item => item.groupId === group.id)
          .map(item => ({
            id: item.id,
            name: item.text,
            type: item.type,
          })),
      })),
    ];
    setTreeData(data);
  }, [parsedItems, groupedItems]);

  // Handle Drag-and-Drop
  const onNodeDragStop = (args) => {
    const draggedNodeId = args.draggedNodeData.id;
    const targetNodeId = args.droppedNodeData.id;

    // Finde die Zielgruppe
    const targetGroup = groupedItems.find(group => group.id === targetNodeId) || { id: null };
    addToGroup([draggedNodeId], targetGroup.id);

    // Aktualisiere die Baumstruktur
    const updatedData = [
      {
        id: 'ungrouped',
        name: 'Ungruppierte Elemente',
        expanded: true,
        hasChildren: true,
        children: parsedItems
          .filter(item => !item.groupId)
          .map(item => ({
            id: item.id,
            name: item.text,
            type: item.type,
          })),
      },
      ...groupedItems.map(group => ({
        id: group.id,
        name: group.name,
        expanded: true,
        hasChildren: true,
        children: parsedItems
          .filter(item => item.groupId === group.id)
          .map(item => ({
            id: item.id,
            name: item.text,
            type: item.type,
          })),
      })),
    ];
    setTreeData(updatedData);
  };

  // Handle Knoten-Auswahl (Baum → Text)
  const onNodeSelect = (args) => {
    const nodeData = args.nodeData;
    const selectedItem = parsedItems.find(item => item.id === nodeData.id);
    setSelectedNode(selectedItem || null);

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
    const selectedItem = parsedItems.find(item => item.id === itemId);
    setSelectedNode(selectedItem || null);

    // Wähle den Knoten im Baum aus
    const treeObj = document.querySelector('.e-treeview').ej2_instances[0];
    if (treeObj && itemId) {
      treeObj.selectedNodes = [itemId];
    }
  };

  // Handle Typ-Änderung
  const handleNodeTypeChange = (value) => {
    if (!selectedNode) return;
    handleTypeChange(selectedNode.id, value);
    setSelectedNode({ ...selectedNode, type: value });
  };

  // Erstelle den gesamten scrollbaren Text
  const fullText = parsedItems.map(item => (
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
    >
      {item.text}
    </Typography>
  ));

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Links: Baumstruktur */}
      <Box sx={{ width: '30%', maxHeight: 600, overflowY: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Geparse Daten
        </Typography>
        <TreeViewComponent
          fields={{ dataSource: treeData, id: 'id', text: 'name', child: 'children' }}
          allowDragAndDrop={true}
          nodeDragStop={onNodeDragStop}
          nodeSelected={onNodeSelect}
        />
      </Box>

      {/* Mitte: Scrollbarer Text */}
      <Box sx={{ width: '40%', maxHeight: 600, overflowY: 'auto', p: 2, bgcolor: 'grey.100' }}>
        <Typography variant="h6" gutterBottom>
          Dokumentinhalt
        </Typography>
        {fullText}
      </Box>

      {/* Rechts: Typ-Auswahl */}
      <Box sx={{ width: '30%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Typ bearbeiten
        </Typography>
        {selectedNode ? (
          <FormControl fullWidth>
            <InputLabel>Typ</InputLabel>
            <Select
              value={selectedNode.type || 'Requirement'}
              onChange={(e) => handleNodeTypeChange(e.target.value)}
              label="Typ"
            >
              <MenuItem value="Header">Header</MenuItem>
              <MenuItem value="Definition">Definition</MenuItem>
              <MenuItem value="Information">Information</MenuItem>
              <MenuItem value="Requirement">Requirement</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <Typography>Bitte wählen Sie einen Knoten aus</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ParsedDataView;