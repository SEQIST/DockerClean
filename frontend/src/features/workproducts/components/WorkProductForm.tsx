import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Editor } from '@tinymce/tinymce-react';
import {
  createWorkProduct,
  updateWorkProduct,
} from '../services/workProductService';
import { WorkProduct } from '../../processes/services/processService';

// Lade den TinyMCE API-Schlüssel aus der .env-Datei
const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY;

interface WorkProductFormProps {
  workProduct: WorkProduct | null;
  setWorkProduct: (wp: WorkProduct | null) => void;
  setWorkProducts: (wps: WorkProduct[]) => void;
  workProducts: WorkProduct[];
  open: boolean;
  onClose: () => void;
  title: string;
}

const WorkProductForm: React.FC<WorkProductFormProps> = ({
  workProduct,
  setWorkProduct,
  setWorkProducts,
  workProducts,
  open,
  onClose,
  title,
}) => {
  const [formData, setFormData] = useState<WorkProduct>(
    workProduct || {
      _id: undefined,
      name: '',
      number: '',
      useMode: 'Internal',
      cost: null,
      description: '',
      digitalisierbarDurch: [],
    }
  );

  useEffect(() => {
    if (workProduct) {
      setFormData(workProduct);
    }
  }, [workProduct]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedFormData: WorkProduct = {
      ...formData,
      [name]: value === '' ? null : name === 'cost' ? parseFloat(value) : value,
    };
    setFormData(updatedFormData);
    setWorkProduct(updatedFormData);
  };

  const handleDescriptionChange = (content: string) => {
    const updatedFormData: WorkProduct = {
      ...formData,
      description: content,
    };
    setFormData(updatedFormData);
    setWorkProduct(updatedFormData);
  };

  const handleDigitalisierbarDurchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value, checked } = e.target;
    const updatedFormData: WorkProduct = { ...formData };
    if (!updatedFormData.digitalisierbarDurch) updatedFormData.digitalisierbarDurch = [];

    if (checked) {
      updatedFormData.digitalisierbarDurch = [...updatedFormData.digitalisierbarDurch, value];
    } else {
      updatedFormData.digitalisierbarDurch = updatedFormData.digitalisierbarDurch.filter(
        (item: string) => item !== value
      );
    }

    setFormData(updatedFormData);
    setWorkProduct(updatedFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData._id) {
        // Update
        const response = await updateWorkProduct(formData._id, formData);
        setWorkProducts(
          workProducts.map((wp) =>
            wp._id === formData._id ? response.data : wp
          )
        );
        toast.success('Work Product erfolgreich aktualisiert');
      } else {
        // Create
        const response = await createWorkProduct(formData);
        setWorkProducts([...workProducts, response.data]);
        toast.success('Work Product erfolgreich erstellt');
      }
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern des Work Products:', error);
      toast.error('Fehler beim Speichern des Work Products');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-h-[80vh] overflow-y-auto" style={{ maxWidth: '48rem' }}>
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Nummer</label>
            <input
              type="text"
              name="number"
              value={formData.number || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Use Mode</label>
            <select
              name="useMode"
              value={formData.useMode || 'Internal'}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="Internal">Internal</option>
              <option value="FromCustomer">From Customer</option>
              <option value="FromSupplier">From Supplier</option>
              <option value="ToCustomer">To Customer</option>
              <option value="None">None</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Kosten</label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Beschreibung</label>
            <Editor
              apiKey={TINYMCE_API_KEY}
              value={formData.description || ''}
              init={{
                height: 200,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount',
                ],
                toolbar:
                  'undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help',
              }}
              onEditorChange={handleDescriptionChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">
              Digitalisierbar durch
            </label>
            <div className="flex flex-col space-y-2">
              {[
                'Dokumentenmanagementsystem',
                'Wissensmanagementsystem',
                'Projektmanagement-Software',
                'Risikomanagement-Tool',
                'ERP-System ',
                'CRM-System ',
                'Cloud-Speicherlösungen ',
                'Workflow-Management-Tools (SEQ.IST))',
                'Automatisierungsplattformen ',
                'Datenanalysetools ',
                'Kollaborationstools ',
              ].map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    name="digitalisierbarDurch"
                    value={option}
                    checked={formData.digitalisierbarDurch?.includes(option) || false}
                    onChange={handleDigitalisierbarDurchChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-gray-700 dark:text-gray-300">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded dark:bg-gray-600 dark:text-gray-300"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkProductForm;