import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Role } from '../types/Role';
import CustomAutocomplete from '../../activities/components/CustomAutocomplete';

interface RoleEditModalProps {
  open: boolean;
  onClose: () => void;
  editRole: Role | null;
  roles: Role[];
  departments: any[];
  subsidiaries: any[];
  onChange: (field: keyof Role, value: any) => void;
  onSave: () => void;
}

const RoleEditModal: React.FC<RoleEditModalProps> = ({
  open,
  onClose,
  editRole,
  roles,
  departments,
  subsidiaries,
  onChange,
  onSave,
}) => {
  if (!open || !editRole) return null;

  const sortedDepartments = [...departments].sort((a, b) => a.name.localeCompare(b.name));
  const sortedRoles = [...roles].sort((a, b) => a.name.localeCompare(b.name));
  const sortedSubsidiaries = [...subsidiaries].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[600px] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Rolle bearbeiten
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={editRole.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <input
            type="text"
            value={editRole.abbreviation || ''}
            onChange={(e) => onChange('abbreviation', e.target.value)}
            placeholder="Abkürzung"
            maxLength={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rechte
            </label>
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
              value={editRole.rights || ''}
              onEditorChange={(value) => onChange('rights', value)}
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
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Abteilung
              </label>
              <select
                value={typeof editRole.department === 'string' ? editRole.department : editRole.department?._id || ''}
                onChange={(e) => onChange('department', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">Keine Abteilung</option>
                {sortedDepartments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zahlungstyp
              </label>
              <select
                value={editRole.paymentType || 'yearly'}
                onChange={(e) => onChange('paymentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="yearly">Jährlich</option>
                <option value="hourly">Stündlich</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zahlungswert
              </label>
              <input
                type="number"
                value={editRole.paymentValue || 0}
                onChange={(e) => onChange('paymentValue', parseFloat(e.target.value))}
                placeholder="Zahlungswert"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Anzahl der Mitarbeiter
              </label>
              <input
                type="number"
                value={editRole.numberOfHolders || 0}
                onChange={(e) => onChange('numberOfHolders', parseInt(e.target.value))}
                placeholder="Anzahl der Mitarbeiter"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vorgesetztenrolle
              </label>
              <select
                value={typeof editRole.supervisorRole === 'string' ? editRole.supervisorRole : editRole.supervisorRole?._id || ''}
                onChange={(e) => onChange('supervisorRole', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">Keine</option>
                {sortedRoles
                  .filter(r => r._id !== editRole._id)
                  .map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tochtergesellschaft
              </label>
              <select
                value={typeof editRole.subsidiary === 'string' ? editRole.subsidiary : editRole.subsidiary?._id || ''}
                onChange={(e) => onChange('subsidiary', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">Keine Tochtergesellschaft</option>
                {sortedSubsidiaries.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Untergeordnete Rollen
            </label>
            <CustomAutocomplete
              options={sortedRoles.filter(r => r._id !== editRole._id)}
              value={sortedRoles.filter(role => editRole.subordinateRoles?.some(sub => (typeof sub === 'string' ? sub : sub._id) === role._id))}
              onChange={(newValue) => onChange('subordinateRoles', newValue?.map((v: Role) => v._id) || [])}
              getOptionLabel={(option: Role) => option.name || ''}
              placeholder="Untergeordnete Rollen auswählen"
              multiple={true}
            />
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

export default RoleEditModal;