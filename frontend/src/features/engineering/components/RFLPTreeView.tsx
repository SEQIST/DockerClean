// features/engineering/components/RFLPTreeView.jsx
import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { v4 as uuidv4 } from 'uuid';

const RFLPTreeView = ({ rflpData, onSelectNode }) => {
  console.log('rflpData in RFLPTreeView:', rflpData);

  if (!rflpData) {
    return <Typography>Keine Daten verfügbar</Typography>;
  }

  // Hilfsfunktion, um eindeutige IDs sicherzustellen
  const ensureUniqueIds = (nodes, parentId = 'root') => {
    if (!nodes || !Array.isArray(nodes)) return [];
    return nodes
      .filter(node => {
        if (!node || typeof node !== 'object') {
          console.warn('Ungültiger Knoten gefunden und gefiltert:', node);
          return false;
        }
        return true;
      })
      .map((node, index) => {
        const newId = node.id && node.id !== 'undefined' ? node.id : `${parentId}-item-${index}-${uuidv4()}`;
        const newNode = {
          ...node,
          id: newId,
        };
        // Rekursiv Unterelemente behandeln
        newNode.subRequirements = ensureUniqueIds(newNode.subRequirements, newId);
        newNode.subSystemRequirements = ensureUniqueIds(newNode.subSystemRequirements, newId);
        newNode.subFunctions = ensureUniqueIds(newNode.subFunctions, newId);
        newNode.subLogics = ensureUniqueIds(newNode.subLogics, newId);
        newNode.subPhysicals = ensureUniqueIds(newNode.subPhysicals, newId);
        return newNode;
      });
  };

  // Bereinigte Daten mit useMemo
  const cleanedRflpData = useMemo(() => {
    if (!rflpData) return {};
    const cleanedData = {
      customerRequirements: ensureUniqueIds(rflpData.customerRequirements || [], 'customerRequirements'),
      systemRequirements: ensureUniqueIds(rflpData.systemRequirements || [], 'systemRequirements'),
      functional: ensureUniqueIds(rflpData.functional || [], 'functional'),
      logical: ensureUniqueIds(rflpData.logical || [], 'logical'),
      physical: ensureUniqueIds(rflpData.physical || [], 'physical'),
    };
    // Zusätzliches Logging, um ungültige IDs zu finden
    console.log('cleanedRflpData in RFLPTreeView:', cleanedData);
    Object.keys(cleanedData).forEach(key => {
      cleanedData[key].forEach((item, index) => {
        if (!item.id || item.id === 'undefined') {
          console.error(`Ungültige ID in ${key} an Index ${index}:`, item);
        }
      });
    });
    return cleanedData;
  }, [rflpData]);

  const handleNodeSelect = (node, type) => {
    if (!node || !node.id) {
      console.error('Ungültiger Knoten beim Auswählen:', node);
      return;
    }
    onSelectNode(node, type);
  };

  // Rekursive Funktion zum Rendern von Unterknoten
  const renderTreeItems = (items, type) => {
    if (!items || items.length === 0) {
      return <Typography>Keine Elemente verfügbar</Typography>;
    }
    return items
      .filter(item => {
        if (!item || !item.id || item.id === 'undefined') {
          console.warn(`Ungültiges Element gefiltert in ${type}:`, item);
          return false;
        }
        return true;
      })
      .map((item, index) => (
        <TreeItem
          key={item.id}
          nodeId={item.id}
          label={item.name || `${type} ${index + 1}`}
          onClick={() => handleNodeSelect(item, type)}
        >
          {item.subRequirements && renderTreeItems(item.subRequirements, 'subRequirements')}
          {item.subSystemRequirements && renderTreeItems(item.subSystemRequirements, 'subSystemRequirements')}
          {item.subFunctions && renderTreeItems(item.subFunctions, 'subFunctions')}
          {item.subLogics && renderTreeItems(item.subLogics, 'subLogics')}
          {item.subPhysicals && renderTreeItems(item.subPhysicals, 'subPhysicals')}
        </TreeItem>
      ));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        RFLP Struktur
      </Typography>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <TreeItem nodeId="requirements" label="Requirements">
          {renderTreeItems(cleanedRflpData.customerRequirements, 'requirements')}
        </TreeItem>
        <TreeItem nodeId="systemRequirements" label="System Requirements">
          {renderTreeItems(cleanedRflpData.systemRequirements, 'systemRequirements')}
        </TreeItem>
        <TreeItem nodeId="functional" label="Functional">
          {renderTreeItems(cleanedRflpData.functional, 'functional')}
        </TreeItem>
        <TreeItem nodeId="logical" label="Logical">
          {renderTreeItems(cleanedRflpData.logical, 'logical')}
        </TreeItem>
        <TreeItem nodeId="physical" label="Physical">
          {renderTreeItems(cleanedRflpData.physical, 'physical')}
        </TreeItem>
      </TreeView>
    </Box>
  );
};

export default RFLPTreeView;