import React from 'react';
import CustomAutocomplete from '../../activities/components/CustomAutocomplete';

interface Role {
  _id: string;
  name: string;
  abbreviation?: string;
  department?: { _id: string; name: string } | string;
  supervisorRole?: { _id: string; name: string } | string;
  subordinateRoles?: (Role | string)[];
  company?: string;
  subsidiary?: { _id: string } | string;
  availableDailyHours?: number;
  workHoursDayMaxLoad?: number;
  paymentType: string;
  paymentValue: number;
  numberOfHolders: number;
  rights?: string;
  tasks?: any[];
}

interface BasicInfoSectionProps {
  editRole: Role | null;
  departments: any[];
  subsidiaries: any[];
  onChange: (field: string, value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  editRole,
  departments,
  subsidiaries,
  onChange,
}) => {
  const sortedDepartments = [...departments].sort((a, b) => a.name.localeCompare(b.name));
  const sortedSubsidiaries = [...subsidiaries].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
        <div className="relative">
          <input
            type="text"
            value={editRole?.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 pl-10"
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18m-9-9v18"></path>
            </svg>
          </span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abkürzung</label>
        <div className="relative">
          <input
            type="text"
            value={editRole?.abbreviation || ''}
            onChange={(e) => onChange('abbreviation', e.target.value)}
            placeholder="Abk."
            maxLength={10}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 pl-10"
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 4v2m-2 0v2m-2-2v2m-2 0v2m8 0v2m-2 0v2m-2-2v2m-2 0v2m8 0v2m-2 0v2m-2-2v2m-2 0v2"></path>
            </svg>
          </span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abteilung</label>
        <CustomAutocomplete
          options={sortedDepartments}
          value={sortedDepartments.find(d => {
            if (typeof editRole?.department === 'string') return d._id === editRole.department;
            return d._id === editRole?.department?._id;
          }) || null}
          onChange={(newValue) => onChange('department', newValue?._id || null)}
          getOptionLabel={(option: any) => option.name}
          placeholder="Abteilung auswählen"
          multiple={false}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zahlungstyp</label>
        <select
          value={editRole?.paymentType || 'yearly'}
          onChange={(e) => onChange('paymentType', e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        >
          <option value="yearly">Jährlich</option>
          <option value="hourly">Stündlich</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zahlungswert</label>
        <input
          type="number"
          value={editRole?.paymentValue || 0}
          onChange={(e) => onChange('paymentValue', parseFloat(e.target.value))}
          placeholder="Zahlungswert"
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Anzahl der Mitarbeiter</label>
        <input
          type="number"
          value={editRole?.numberOfHolders || 0}
          onChange={(e) => onChange('numberOfHolders', parseInt(e.target.value))}
          placeholder="Anzahl der Mitarbeiter"
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tochtergesellschaft</label>
        <CustomAutocomplete
          options={sortedSubsidiaries}
          value={sortedSubsidiaries.find(s => {
            if (typeof editRole?.subsidiary === 'string') return s._id === editRole.subsidiary;
            return s._id === editRole?.subsidiary?._id;
          }) || null}
          onChange={(newValue) => onChange('subsidiary', newValue?._id || null)}
          getOptionLabel={(option: any) => option.name}
          placeholder="Tochtergesellschaft auswählen"
          multiple={false}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;