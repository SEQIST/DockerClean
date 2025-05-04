interface RoleHandbookViewerProps {
    roleData: any;
  }
  
  const RoleHandbookViewer: React.FC<RoleHandbookViewerProps> = ({ roleData }) => {
    return (
      <div className="bg-[#ffffff] p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
          Rollenhandbuch für {roleData.name}
        </h3>
        <p className="text-[#374151] mb-4">
          <strong>Standort nicht angegeben, den {new Date().toLocaleDateString()}</strong>
        </p>
  
        <h4 className="text-lg font-semibold text-[#374151] mb-2">Generelle Beschreibung</h4>
        <p className="text-[#374151] mb-4">Die Rolle ist wie folgt beschrieben:</p>
        <div
          className="text-[#374151] mb-4"
          dangerouslySetInnerHTML={{ __html: roleData.description || 'Keine Beschreibung verfügbar' }}
        />
  
        <h4 className="text-lg font-semibold text-[#374151] mb-2">Abteilung</h4>
        <p className="text-[#374151] mb-4">{roleData.department?.name || 'N/A'}</p>
  
        <h4 className="text-lg font-semibold text-[#374151] mb-2">Unternehmen</h4>
        <p className="text-[#374151] mb-4">{typeof roleData.company === 'string' ? roleData.company : roleData.company?.name || 'N/A'}</p>
  
        <h4 className="text-lg font-semibold text-[#374151] mb-2">Vorgesetzter</h4>
        <p className="text-[#374151] mb-4">{roleData.supervisorRole?.name || 'N/A'}</p>
  
        <h4 className="text-lg font-semibold text-[#374151] mb-2">Untergeordnete Rollen</h4>
        <ul className="list-disc list-inside text-[#374151] mb-4">
          {roleData.subordinateRoles.length > 0 ? (
            roleData.subordinateRoles.map((subRole: any) => (
              <li key={subRole._id}>{subRole.name}</li>
            ))
          ) : (
            <li>Keine untergeordneten Rollen vorhanden</li>
          )}
        </ul>
  
        <h4 className="text-lg font-semibold text-[#374151] mb-2">Auszuführende Tätigkeiten</h4>
        {roleData.activities.length > 0 ? (
          roleData.activities.map((activity: any, idx: number) => (
            <div key={idx} className="mb-6">
              <h5 className="text-md font-semibold text-[#374151]">{activity.name}</h5>
              <p className="text-[#374151] mt-2">Bei Eingang von:</p>
              <ul className="list-decimal list-inside text-[#374151] mt-2">
                {activity.trigger?.workProducts?.length ? (
                  activity.trigger.workProducts.map((wp: any, idx: number) => (
                    <li key={idx}>
                      <strong>{wp._id?.name || wp._id}</strong> in einem Fertigstellungsgrad von {wp.completionPercentage || 100}%
                    </li>
                  ))
                ) : (
                  <li>Keine Trigger vorhanden</li>
                )}
              </ul>
              <p className="text-[#374151] mt-2">wird folgendes durchgeführt:</p>
              <div
                className="text-[#374151] mt-2"
                dangerouslySetInnerHTML={{ __html: activity.description || 'Keine Beschreibung verfügbar' }}
              />
              <p className="text-[#374151] mt-2">Das Ergebnis der Tätigkeit ist:</p>
              <h6 className="text-sm font-semibold text-[#374151] mt-2">
                {activity.result?.name || activity.result || 'Kein Ergebnis angegeben'}
              </h6>
            </div>
          ))
        ) : (
          <p className="text-[#374151]">[Keine Aktivitäten verfügbar.]</p>
        )}
      </div>
    );
  };
  
  export default RoleHandbookViewer;