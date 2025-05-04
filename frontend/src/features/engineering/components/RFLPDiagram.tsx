// features/engineering/components/RFLPDiagram.jsx
import React, { useEffect, useRef } from 'react';
import { DiagramComponent } from '@syncfusion/ej2-react-diagrams';
import { Box, Typography } from '@mui/material';

const RFLPDiagram = ({ selectedNode, selectedType, rflpData }) => {
  const diagramInstance = useRef(null);

  // Debugging: Überprüfe die Eingaben
  useEffect(() => {
    console.log('RFLPDiagram - selectedNode:', selectedNode);
    console.log('RFLPDiagram - selectedType:', selectedType);
    console.log('RFLPDiagram - rflpData:', rflpData);
  }, [selectedNode, selectedType, rflpData]);

  if (!selectedNode || !selectedType || !rflpData) {
    return <Typography>Keine Daten zum Anzeigen</Typography>;
  }

  // Erstelle Knoten und Verbindungen basierend auf dem ausgewählten Knoten
  const nodes = [
    {
      id: selectedNode.id,
      offsetX: 300,
      offsetY: 200,
      width: 100,
      height: 50,
      annotations: [{ content: selectedNode.name || 'Unbenannt' }],
    },
  ];

  const connectors = [];

  // Füge abhängige Knoten hinzu (z. B. traces)
  if (selectedNode.traces && selectedNode.traces.length > 0) {
    selectedNode.traces.forEach((trace, index) => {
      const targetNode = rflpData.customerRequirements.find(req => req.id === trace) ||
                        rflpData.systemRequirements.find(req => req.id === trace) ||
                        rflpData.functional.find(func => func.id === trace) ||
                        rflpData.logical.find(logic => logic.id === trace) ||
                        rflpData.physical.find(phys => phys.id === trace);

      if (targetNode) {
        nodes.push({
          id: targetNode.id,
          offsetX: 300 + (index + 1) * 150,
          offsetY: 200,
          width: 100,
          height: 50,
          annotations: [{ content: targetNode.name || 'Unbenannt' }],
        });

        connectors.push({
          id: `connector-${selectedNode.id}-${targetNode.id}`,
          sourceID: selectedNode.id,
          targetID: targetNode.id,
        });
      }
    });
  }

  // Debugging: Überprüfe die Knoten und Verbindungen
  useEffect(() => {
    console.log('RFLPDiagram - nodes:', nodes);
    console.log('RFLPDiagram - connectors:', connectors);
  }, [nodes, connectors]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Diagramm: {selectedNode.name || 'Unbenannt'}
      </Typography>
      <DiagramComponent
        id="diagram"
        ref={diagramInstance}
        width={'100%'}
        height={'600px'}
        nodes={nodes}
        connectors={connectors}
        getNodeDefaults={(node) => {
          node.style = { fill: '#6BA5D7', strokeColor: 'white' };
          return node;
        }}
        getConnectorDefaults={(connector) => {
          connector.style = { strokeColor: '#6BA5D7', strokeWidth: 2 };
          connector.targetDecorator = { shape: 'Arrow', style: { fill: '#6BA5D7', strokeColor: '#6BA5D7' } };
          return connector;
        }}
      />
    </Box>
  );
};

export default RFLPDiagram;