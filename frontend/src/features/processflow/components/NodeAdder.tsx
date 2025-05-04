// NodeAdder.jsx
import React, { useState } from 'react';

const NodeAdder = ({ addNode }) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('default');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label) return;
    addNode({ label, type });
    setLabel('');
    setType('default');
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Neuer Node</h2>
      <div onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Node-Name"
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
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Hinzufügen
        </button>
      </div>
    </div>
  );
};

export default NodeAdder;