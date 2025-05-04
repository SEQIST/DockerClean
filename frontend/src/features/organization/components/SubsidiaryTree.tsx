import React from 'react';
import Tree, { TreeNodeDatum } from 'react-d3-tree';
import { Subsidiary } from '../types/organization';

// Typ für die Knoten-Daten mit benutzerdefinierten Eigenschaften
interface CustomTreeNode {
  name: string;
  _id?: string;
  isRoot?: boolean;
  location?: string;
  children?: CustomTreeNode[];
}

// Erweitere TreeNodeDatum für die Verwendung in renderCustomNodeElement
interface CustomNodeDatum extends TreeNodeDatum {
  _id?: string;
  isRoot?: boolean;
  location?: string;
}

interface SubsidiaryTreeProps {
  subsidiaries: Subsidiary[];
  onEditSubsidiary: (id: string) => void;
  companyName: string;
}

const SubsidiaryTree: React.FC<SubsidiaryTreeProps> = ({ subsidiaries, onEditSubsidiary, companyName }) => {
  // Baumdaten für react-d3-tree mit verschachtelten Strukturen
  const buildTreeData = (subsidiaries: Subsidiary[], parentId: string | null = null, visited = new Set<string>()): CustomTreeNode[] => {
    return subsidiaries
      .filter((sub) => {
        const subParentId = sub.isChildOf ? sub.isChildOf.toString() : null;
        const subId = sub._id?.toString();
        if (visited.has(subId!)) return false;
        return subParentId === parentId;
      })
      .map((sub) => {
        const subId = sub._id?.toString();
        visited.add(subId!);
        return {
          name: sub.name || 'Unbenannt',
          _id: sub._id,
          isRoot: false,
          location: sub.location || 'Kein Standort',
          children: buildTreeData(subsidiaries, subId!, new Set(visited)),
        };
      });
  };

  const treeData: CustomTreeNode = {
    name: companyName || 'Organisation',
    isRoot: true,
    location: 'Hauptsitz',
    children: subsidiaries && subsidiaries.length > 0 ? buildTreeData(subsidiaries) : [],
  };

  return (
    <div className="w-full h-[600px] bg-white rounded-md">
      {subsidiaries && subsidiaries.length > 0 ? (
        <Tree
          data={treeData}
          orientation="vertical"
          translate={{ x: 500, y: 50 }} // Zentriere das Diagramm
          nodeSize={{ x: 300, y: 150 }}
          pathFunc="diagonal" // Für schönere Verbindungslinien
          zoom={0.8}
          separation={{ siblings: 1, nonSiblings: 1.5 }}
          renderCustomNodeElement={({ nodeDatum }) => {
            const customNode = nodeDatum as CustomNodeDatum;
            const isRoot = customNode.isRoot || false;
            const nodeWidth = 250;
            const nodeHeight = 80;
            return (
              <g>
                {/* Rechteckiger Knoten */}
                <rect
                  width={nodeWidth}
                  height={nodeHeight}
                  x={-nodeWidth / 2}
                  y={-nodeHeight / 2}
                  rx={8}
                  ry={8}
                  fill={isRoot ? "#1976d2" : "#42a5f5"}
                  stroke="#1976d2"
                  strokeWidth="2"
                />
                {/* Name des Standorts */}
                <text
                  fill="#ffffff"
                  strokeWidth="0"
                  x={0}
                  y={-nodeHeight / 4}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {customNode.name}
                </text>
                {/* Standortinformation */}
                <text
                  fill="#ffffff"
                  strokeWidth="0"
                  x={0}
                  y={0}
                  textAnchor="middle"
                  fontSize="12"
                >
                  {customNode.location}
                </text>
                {/* Bearbeiten-Link */}
                {!isRoot && customNode._id && (
                  <foreignObject
                    x={-nodeWidth / 2}
                    y={nodeHeight / 2 - 10}
                    width={nodeWidth}
                    height={20}
                  >
                    <button
                      className="text-blue-600 hover:underline text-xs w-full text-center"
                      onClick={() => onEditSubsidiary(customNode._id!)}
                    >
                      Bearbeiten
                    </button>
                  </foreignObject>
                )}
              </g>
            );
          }}
        />
      ) : (
        <p className="text-gray-500 text-center pt-4">Keine Tochtergesellschaften vorhanden.</p>
      )}
    </div>
  );
};

export default SubsidiaryTree;