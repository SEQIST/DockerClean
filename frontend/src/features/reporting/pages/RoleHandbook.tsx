import { useState, useEffect } from 'react';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import RoleHandbookViewer from '../components/RoleHandbookViewer';
import RoleHandbookExporter from '../components/RoleHandbookExporter';

export const fetchRoleData = async (
  roleId: string,
  roles: any[],
  setRoleData: (data: any) => void
) => {
  if (!roleId) return;

  try {
    const role = roles.find((r: any) => r._id === roleId);
    if (!role) {
      throw new Error('Rolle nicht gefunden');
    }

    const activitiesResponse = await fetch(`http://localhost:5001/api/activities`);
    if (!activitiesResponse.ok) {
      throw new Error('Fehler beim Abrufen der Aktivitäten');
    }
    const activitiesData = await activitiesResponse.json();
    const activities = activitiesData.filter((activity: any) =>
      roleId === (typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id)
    );

    const rolesResponse = await fetch(`http://localhost:5001/api/roles`);
    if (!rolesResponse.ok) {
      throw new Error('Fehler beim Abrufen der Rollen');
    }
    const rolesData = await rolesResponse.json();
    const subordinateRoles = rolesData.filter((subRole: any) =>
      role.subordinateRoles?.includes(subRole._id)
    );

    setRoleData({
      ...role,
      activities,
      subordinateRoles,
    });
  } catch (err: any) {
    console.error('Fehler beim Abrufen der Rollen-Daten:', err);
    setRoleData(null);
  }
};

const RoleHandbook: React.FC = () => {
  const [roleId, setRoleId] = useState<string>('');
  const [roleData, setRoleData] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/roles`);
        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Rollen');
        }
        const data = await response.json();
        setRoles(data);
      } catch (err: any) {
        console.error('Fehler beim Abrufen der Rollen:', err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    document.title = 'Rollenhandbuch';
  }, []);

  return (
    <div className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <PageBreadcrumb pageTitle="Rollenhandbuch" />

        <h2 className="text-2xl font-bold text-[#2563eb] mb-6">Rollenhandbuch</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#374151] mb-2">Rolle auswählen</h3>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] mb-4"
          >
            <option value="">Wählen Sie eine Rolle...</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchRoleData(roleId, roles, setRoleData)}
            className="px-4 py-2 bg-[#2563eb] text-[#ffffff] rounded hover:bg-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            Handbuch erstellen
          </button>
        </div>

        {roleData && (
          <>
            <RoleHandbookViewer roleData={roleData} />
            <div className="mt-4">
              <RoleHandbookExporter roleData={roleData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleHandbook;