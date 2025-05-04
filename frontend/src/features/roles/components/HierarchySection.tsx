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

interface HierarchySectionProps {
  editRole: Role | null;
  roles: Role[];
  onChange: (field: string, value: any) => void;
}

const HierarchySection: React.FC<HierarchySectionProps> = ({
  editRole,
  roles,
  onChange,
}) => {
  const sortedRoles = [...roles].sort((a, b) => a.name.localeCompare(b.name));

  // Sicherstellen, dass subordinateRoles korrekt abgeleitet werden
  const selectedSubordinateRoles = editRole?.subordinateRoles
    ? editRole.subordinateRoles
        .map(role => {
          const roleId = typeof role === 'string' ? role : role._id;
          // Finden Sie das entsprechende Role-Objekt in sortedRoles
          return sortedRoles.find(r => r._id === roleId);
        })
        .filter((role): role is Role => role !== undefined)
    : [];

  // Debugging: Ausgabe der Werte
  console.log('editRole.subordinateRoles:', editRole?.subordinateRoles);
  console.log('selectedSubordinateRoles:', selectedSubordinateRoles);
  console.log('sortedRoles:', sortedRoles);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vorgesetztenrolle</label>
        <CustomAutocomplete
          options={sortedRoles}
          value={sortedRoles.find(r => {
            if (typeof editRole?.supervisorRole === 'string') return r._id === editRole.supervisorRole;
            return r._id === editRole?.supervisorRole?._id;
          }) || null}
          onChange={(newValue) => onChange('supervisorRole', newValue?._id || null)}
          getOptionLabel={(option: Role) => option.name || ''}
          placeholder="Vorgesetztenrolle auswählen"
          multiple={false}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Untergeordnete Rollen</label>
        <CustomAutocomplete
          options={sortedRoles}
          value={selectedSubordinateRoles}
          onChange={(newValue) => {
            console.log('New subordinate roles selected:', newValue);
            onChange('subordinateRoles', newValue?.map((v: Role) => v._id) || []);
          }}
          getOptionLabel={(option: Role) => option.name || ''}
          placeholder="Untergeordnete Rollen auswählen"
          multiple={true}
        />
      </div>
    </div>
  );
};

export default HierarchySection;