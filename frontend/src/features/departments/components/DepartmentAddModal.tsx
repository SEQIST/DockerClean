// src/features/departments/components/DepartmentAddModal.tsx
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Department, Role } from '../types/Department';

interface DepartmentAddModalProps {
  open: boolean;
  onClose: () => void;
  departments: Department[];
  roles: Role[];
  newName: string;
  setNewName: (value: string) => void;
  newDescription: string;
  setNewDescription: (value: string) => void;
  newIsJuniorTo: string | null;
  setNewIsJuniorTo: (value: string | null) => void;
  newHeadOfDepartment: string | null;
  setNewHeadOfDepartment: (value: string | null) => void;
  onAdd: () => void;
}

const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || '8bmk9fctlv8xyyt73d6m24h';

const DepartmentAddModal: React.FC<DepartmentAddModalProps> = ({
  open,
  onClose,
  departments,
  roles,
  newName,
  setNewName,
  newDescription,
  setNewDescription,
  newIsJuniorTo,
  setNewIsJuniorTo,
  newHeadOfDepartment,
  setNewHeadOfDepartment,
  onAdd,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[600px] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Neue Abteilung hinzufügen
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Beschreibung
            </label>
            <Editor
              apiKey={apiKey}
              value={newDescription}
              onEditorChange={(value) => setNewDescription(value)}
              init={{
                height: 150,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                  'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
              }}
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={newIsJuniorTo || ''}
              onChange={(e) => setNewIsJuniorTo(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">Keine</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
            <select
              value={newHeadOfDepartment || ''}
              onChange={(e) => setNewHeadOfDepartment(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">Keine Abteilungsleitung</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Abbrechen
            </button>
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAddModal;