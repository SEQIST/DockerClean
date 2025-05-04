// NodeEditor.jsx
import React, { useState } from 'react';

const NodeEditor = ({ node, updateNode, deleteNode, onClose }) => {
  const [label, setLabel] = useState(node.data.label);
  const [color, setColor] = useState(node.style?.background || '#B0BEC5');
  const [type, setType] = useState(node.type || 'default');

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedNode = {
      ...node,
      type,
      data: { ...node.data, label },
      style: {
        ...node.style,
        background: color,
        width: ['diamond', 'circle', 'hexagon'].includes(type) ? 100 : type === 'arrowRectangle' ? 150 : 200,
        height: ['diamond', 'circle', 'hexagon'].includes(type) ? 100 : 60,
        borderRadius: type === 'circle' ? '50%' : ['diamond', 'hexagon'].includes(type) ? 0 : 6,
        color: 'white',
      },
    };
    updateNode(updatedNode);
  };

  const handleDelete = () => {
    deleteNode(node.id);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Node bearbeiten</h2>
      <div onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Farbe</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Typ</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="default">Rechteck</option>
            <option value="input">Eingang (abgerundet oben)</option>
            <option value="output">Ausgang (abgerundet unten)</option>
            <option value="diamond">Diamant</option>
            <option value="circle">Kreis</option>
            <option value="arrowRectangle">Pfeil-Rechteck</option>
            <option value="hexagon">Sechseck</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Speichern
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Löschen
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;