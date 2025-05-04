import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

interface EditableNodeProps {
  data: {
    label: string;
    head: string;
    onLabelChange: (id: string, newLabel: string) => void;
  };
  id: string;
}

const EditableNode: React.FC<EditableNodeProps> = ({ data, id }) => {
  const [label, setLabel] = useState<string>(data.label);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    if (label !== data.label) {
      try {
        const response = await fetch(`http://localhost:5001/api/departments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: label }),
        });
        if (!response.ok) throw new Error('Fehler beim Speichern in die Datenbank');
        data.onLabelChange(id, label);
      } catch (error) {
        console.error('Fehler beim Speichern:', error);
        setLabel(data.label);
      }
    }
  };

  return (
    <div
      className="w-[200px] h-[70px] bg-gray-100 dark:bg-gray-800 border border-gray-700 rounded-lg flex flex-col items-center justify-center p-2 relative"
    >
      <Handle type="target" position={Position.Top} className="bg-gray-500 rounded-full" />
      {isEditing ? (
        <input
          value={label}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
          className="w-[90%] text-center bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded"
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className="text-sm font-bold text-gray-800 dark:text-gray-200"
        >
          {label}
        </span>
      )}
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Leiter: {data.head || 'Kein Leiter'}
      </span>
      <Handle type="source" position={Position.Bottom} className="bg-gray-500 rounded-full" />
    </div>
  );
};

export default EditableNode;