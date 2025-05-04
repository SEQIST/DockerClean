import React, { useState, ChangeEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { WorkProduct } from '../types/WorkProduct'; // Import der gemeinsamen WorkProduct-Schnittstelle

interface WorkProductFormForActivityProps {
  onClose: () => void;
  onSave: (savedWorkProduct: WorkProduct) => void; // Verwende die WorkProduct-Schnittstelle
}

const WorkProductFormForActivity: React.FC<WorkProductFormForActivityProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<WorkProduct>({ // Verwende die WorkProduct-Schnittstelle
    name: '',
    number: '',
    useMode: 'Internal',
    cost: '',
    description: '',
  });

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/workproducts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Work Products');
      }

      const savedWorkProduct: WorkProduct = await response.json();
      console.log('Neues Work Product gespeichert:', savedWorkProduct);
      onSave(savedWorkProduct);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Neues Work Product erstellen</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleTextChange}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nummer</label>
        <input
          type="text"
          name="number"
          value={formData.number}
          onChange={handleTextChange}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verwendungsmodus</label>
        <select
          name="useMode"
          value={formData.useMode}
          onChange={handleTextChange}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        >
          <option value="None">None</option>
          <option value="Internal">Internal</option>
          <option value="FromCustomer">From Customer</option>
          <option value="FromSupplier">From Supplier</option>
          <option value="ToCustomer">To Customer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kosten</label>
        <input
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleTextChange}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          value={formData.description}
          onEditorChange={handleDescriptionChange}
          init={{
            height: 200,
            menubar: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'preview',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | removeformat | code | help',
          }}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Speichern
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
};

export default WorkProductFormForActivity;