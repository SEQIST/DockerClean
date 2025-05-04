import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RoleFormContent = React.forwardRef(({ role, onChange, roles, departments, subsidiaries, title, onSubmit, onCancel }: any, ref: any) => {
  // Funktion zum Flatten der Standort-Hierarchie
  const flattenSubsidiaries = (subs: any[], parentName = '') => {
    let flatList: any[] = [];
    subs.forEach(sub => {
      const displayName = parentName ? `${parentName} > ${sub.name}` : sub.name;
      flatList.push({ ...sub, displayName });
      if (sub.subsidiaries && sub.subsidiaries.length > 0) {
        flatList = flatList.concat(flattenSubsidiaries(sub.subsidiaries, displayName));
      }
    });
    return flatList;
  };

  const flatSubsidiaries = flattenSubsidiaries(subsidiaries);

  return (
    <div ref={ref} className="w-[600px] bg-white dark:bg-gray-900 shadow-xl p-6 rounded-lg">
      <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">{title}</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            id="role-name"
            type="text"
            value={role.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="abbreviation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Abkürzung
            </label>
            <input
              id="abbreviation"
              type="text"
              value={role.abbreviation || ''}
              onChange={(e) => onChange('abbreviation', e.target.value)}
              className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Abteilung
            </label>
            <select
              id="department"
              value={role.department?._id || role.department || ''}
              onChange={(e) => onChange('department', e.target.value || null)}
              className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            >
              <option value="">Keine Abteilung</option>
              {departments.map((dept: any) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="subsidiary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Standort
            </label>
            <select
              id="subsidiary"
              value={role.subsidiary?._id || role.subsidiary || ''}
              onChange={(e) => onChange('subsidiary', e.target.value || null)}
              className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            >
              <option value="">Kein Standort</option>
              {flatSubsidiaries.map((sub: any) => (
                <option key={sub._id} value={sub._id}>{sub.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="payment-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Zahlungstyp
            </label>
            <select
              id="payment-type"
              value={role.paymentType || 'yearly'}
              onChange={(e) => onChange('paymentType', e.target.value)}
              className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            >
              <option value="yearly">Jährlich</option>
              <option value="hourly">Stündlich</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="payment-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {role.paymentType === 'yearly' ? 'Jahresgehalt' : 'Stundensatz'}
            </label>
            <input
              id="payment-value"
              type="number"
              value={role.paymentValue || 0}
              onChange={(e) => onChange('paymentValue', e.target.value)}
              className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
          <div>
            <label htmlFor="number-of-holders" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Anzahl Rolleninhaber
            </label>
            <input
              id="number-of-holders"
              type="number"
              value={role.numberOfHolders || 0}
              onChange={(e) => onChange('numberOfHolders', Number(e.target.value) || 0)}
              min="0"
              className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="supervisor-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vorgesetzter (Rolle)
            </label>
            <select
              id="supervisor-role"
              value={role.supervisorRole?._id || role.supervisorRole || ''}
              onChange={(e) => onChange('supervisorRole', e.target.value || null)}
              className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            >
              <option value="">Keine</option>
              {roles.map((r: any) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subordinate-roles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Untergebene Rollen
            </label>
            <select
              id="subordinate-roles"
              multiple
              value={role.subordinateRoles?.map((r: any) => r._id || r) || []}
              onChange={(e) => onChange('subordinateRoles', Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            >
              {roles.map((r: any) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-200 mb-2">
            Rechte
          </h3>
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            value={role.rights || ''}
            onEditorChange={(value) => onChange('rights', value)}
            init={{
              height: 200,
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
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Abbrechen
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {title === 'Neue Rolle hinzufügen' ? 'Hinzufügen' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default RoleFormContent;