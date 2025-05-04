// src/features/departments/components/DepartmentEditModal.tsx
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Department, Role } from '../types/Department';

interface DepartmentEditModalProps {
  open: boolean;
  onClose: () => void;
  editDepartment: Department | null;
  departments: Department[];
  roles: Role[];
  onChange: (field: keyof Department, value: any) => void;
  onSave: () => void;
}

const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || '8bmk9fctlv8xyyt73d6m24h';

const DepartmentEditModal: React.FC<DepartmentEditModalProps> = ({
  open,
  onClose,
  editDepartment,
  departments,
  roles,
  onChange,
  onSave,
}) => {
  if (!open || !editDepartment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[600px] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Abteilung bearbeiten
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={editDepartment.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Beschreibung
            </label>
            <Editor
              apiKey={apiKey}
              value={editDepartment.description || ''}
              onEditorChange={(value) => onChange('description', value)}
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
              value={typeof editDepartment.isJuniorTo === 'string' ? editDepartment.isJuniorTo : editDepartment.isJuniorTo?._id || ''}
              onChange={(e) => onChange('isJuniorTo', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">Keine</option>
              {departments
                .filter(d => d._id !== editDepartment._id)
                .map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
            </select>
            <select
              value={typeof editDepartment.headOfDepartment === 'string' ? editDepartment.headOfDepartment : editDepartment.headOfDepartment?._id || ''}
              onChange={(e) => onChange('headOfDepartment', e.target.value || null)}
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
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentEditModal;