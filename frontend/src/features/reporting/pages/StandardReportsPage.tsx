import { useState, useEffect, useRef } from 'react';
import CustomAutocomplete from '../../activities/components/CustomAutocomplete';
import useFetchActivityData from '../../activities/hooks/useFetchActivityData';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import { Process, Role, Activity as ActivityType, WorkProduct } from '../../processes/services/processService';
import { jsPDF } from 'jspdf';

interface StandardReportsPageProps {}

const StandardReportsPage: React.FC<StandardReportsPageProps> = () => {
  const { processes, roles, allWorkProducts, loading, error } = useFetchActivityData();
  const [reportType, setReportType] = useState<'process' | 'role'>('process');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [exportError, setExportError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const sortedProcesses = [...processes].sort((a, b) => a.name.localeCompare(b.name));
  const sortedRoles = [...roles].sort((a, b) => a.name.localeCompare(b.name));

  // Aktivitäten für den ausgewählten Prozess oder die Rolle abrufen
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Aktivitäten zurücksetzen
        setActivities([]);

        let url = '';
        if (reportType === 'process' && selectedProcess) {
          url = `http://localhost:5001/api/activities?process=${selectedProcess._id}`;
          console.log('Lade Aktivitäten für Prozess:', selectedProcess._id);
        } else if (reportType === 'role' && selectedRole) {
          url = `http://localhost:5001/api/activities?role=${selectedRole._id}`;
          console.log('Lade Aktivitäten für Rolle:', selectedRole._id);
        }
        if (url) {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Aktivitäten');
          }
          const data: ActivityType[] = await response.json();
          console.log('Geladene Aktivitäten:', data);
          // Alphabetisch sortieren
          setActivities(data.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (err: any) {
        console.error('Fehler beim Laden der Aktivitäten:', err);
        setActivities([]);
      }
    };

    fetchActivities();
  }, [reportType, selectedProcess, selectedRole]);

  const getWorkProductName = (id: string | { _id: string }): string => {
    const wpId = typeof id === 'string' ? id : id._id;
    const workProduct = allWorkProducts.find((wp: WorkProduct) => wp._id === wpId);
    return workProduct?.name || 'Unbekannt';
  };

  const handleExport = () => {
    if (!reportRef.current) {
      console.error('Report-Referenz nicht gefunden');
      setExportError('Report-Referenz nicht gefunden');
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20; // Startposition in mm

      // Titel hinzufügen
      pdf.setFontSize(16);
      pdf.text(
        reportType === 'process'
          ? `Prozessbeschreibung für ${selectedProcess?.name}`
          : `Rollehandbuch für ${selectedRole?.name}`,
        20,
        yPosition
      );
      yPosition += 10;

      // Standort und Datum
      pdf.setFontSize(12);
      pdf.text(
        `${reportType === 'process' ? selectedProcess?.owner || 'Standort nicht angegeben' : 'Standort nicht angegeben'}, den ${new Date().toLocaleDateString()}`,
        20,
        yPosition
      );
      yPosition += 10;

      // Generelle Beschreibung
      pdf.setFontSize(14);
      pdf.text('Generelle Beschreibung', 20, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.text(
        reportType === 'process'
          ? 'Die Prozess ist wie folgt beschrieben:'
          : 'Die Rolle ist wie folgt beschrieben:',
        20,
        yPosition
      );
      yPosition += 6;
      pdf.text(
        reportType === 'process'
          ? selectedProcess?.description || 'Keine Beschreibung verfügbar'
          : '[Keine Beschreibung verfügbar]',
        20,
        yPosition
      );
      yPosition += 10;

      // Schaubild (Platzhalter)
      if (reportType === 'process') {
        pdf.setFontSize(14);
        pdf.text('Schaubild', 20, yPosition);
        yPosition += 8;
        pdf.setFontSize(12);
        pdf.text(
          '[Platzhalter für ProzessCanvas Reactflow – Schaubild wird nicht exportiert, da die Implementierung zu komplex ist.]',
          20,
          yPosition
        );
        yPosition += 10;
      }

      // Aktivitäten
      pdf.setFontSize(14);
      pdf.text(
        reportType === 'process'
          ? 'Folgende Tätigkeiten sind in diesem Prozess'
          : 'Auszuführende Tätigkeiten',
        20,
        yPosition
      );
      yPosition += 8;

      if (activities.length > 0) {
        activities.forEach((activity) => {
          // Aktivitätstitel
          pdf.setFontSize(12);
          pdf.text(activity.name, 20, yPosition);
          yPosition += 6;

          // Trigger
          pdf.text('Bei Eingang von:', 20, yPosition);
          yPosition += 6;
          if (activity.trigger?.workProducts?.length) {
            activity.trigger.workProducts.forEach((wp, idx) => {
              pdf.text(
                `${idx + 1}. ${getWorkProductName(wp._id)} in einem Fertigstellungsgrad von ${wp.completionPercentage || 100}%`,
                25,
                yPosition
              );
              yPosition += 6;
            });
          } else {
            pdf.text('Keine Trigger vorhanden', 25, yPosition);
            yPosition += 6;
          }

          // Ausführung
          pdf.text(
            `wird durch ${typeof activity.executedBy === 'string' ? activity.executedBy : (typeof activity.executedBy === 'object' && activity.executedBy !== null && 'name' in activity.executedBy ? (activity.executedBy as Role).name : 'Rolle nicht angegeben')} folgendes durchgeführt:`,
            20,
            yPosition
          );
          yPosition += 6;
          pdf.text(activity.description || 'Keine Beschreibung verfügbar', 20, yPosition);
          yPosition += 6;

          // Ergebnis
          pdf.text('Das Ergebnis der Tätigkeit ist:', 20, yPosition);
          yPosition += 6;
          pdf.text(
            typeof activity.result === 'string' ? activity.result : activity.result?.name || 'Kein Ergebnis angegeben',
            20,
            yPosition
          );
          yPosition += 6;
          pdf.text('[Keine Beschreibung verfügbar]', 20, yPosition);
          yPosition += 10;

          // Neue Seite hinzufügen, wenn der Platz nicht ausreicht
          if (yPosition > pdfHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      } else {
        pdf.setFontSize(12);
        pdf.text('[Keine Aktivitäten verfügbar.]', 20, yPosition);
        yPosition += 10;
      }

      pdf.save(`${reportType === 'process' ? selectedProcess?.name : selectedRole?.name}_report.pdf`);
      setExportError(null);
    } catch (err) {
      console.error('Fehler beim Exportieren des PDFs:', err);
      setExportError('Fehler beim Exportieren des PDFs. Bitte überprüfen Sie die Konsole für Details.');
    }
  };

  if (loading) return <div className="text-gray-500 p-4">Lade Daten...</div>;
  if (error) return <div className="text-red-500 p-4">Fehler: {error}</div>;

  return (
    <div className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <PageBreadcrumb pageTitle="Reporting" />

        <div className="flex justify-center mb-6">
          <svg className="w-12 h-12 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#2563eb] mb-6">
          Standardberichte
        </h2>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Berichtstyp auswählen
            </label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as 'process' | 'role');
                setSelectedProcess(null);
                setSelectedRole(null);
              }}
              className="w-full px-3 py-2 text-sm text-[#374151] bg-transparent border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="process">Prozessbericht</option>
              <option value="role">Rollenbericht</option>
            </select>
          </div>

          <div className="flex-1 min-w-[300px]">
            {reportType === 'process' ? (
              <>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Prozess auswählen
                </label>
                <CustomAutocomplete<Process>
                  options={sortedProcesses}
                  value={selectedProcess}
                  onChange={(newValue: Process | null) => setSelectedProcess(newValue)}
                  getOptionLabel={(option: Process) => option.name}
                  placeholder="Prozess auswählen"
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Rolle auswählen
                </label>
                <CustomAutocomplete<Role>
                  options={sortedRoles}
                  value={selectedRole}
                  onChange={(newValue: Role | null) => setSelectedRole(newValue)}
                  getOptionLabel={(option: Role) => option.name}
                  placeholder="Rolle auswählen"
                />
              </>
            )}
          </div>
        </div>

        {exportError && (
          <div className="mb-4 text-[#ef4444]">
            {exportError}
          </div>
        )}

        {(selectedProcess || selectedRole) && (
          <div ref={reportRef} className="bg-[#ffffff] p-6 rounded-lg shadow-md">
            {reportType === 'process' && selectedProcess && (
              <>
                <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
                  Prozessbeschreibung für {selectedProcess.name}
                </h3>
                <p className="text-[#374151] mb-4">
                  <strong>{selectedProcess.owner || 'Standort nicht angegeben'}, den {new Date().toLocaleDateString()}</strong>
                </p>

                <h4 className="text-lg font-semibold text-[#374151] mb-2">
                  Generelle Beschreibung
                </h4>
                <p className="text-[#374151] mb-4">
                  Die Prozess ist wie folgt beschrieben:
                </p>
                <div
                  className="text-[#374151] mb-4"
                  dangerouslySetInnerHTML={{ __html: selectedProcess.description || 'Keine Beschreibung verfügbar' }}
                />

                <h4 className="text-lg font-semibold text-[#374151] mb-2">
                  Schaubild
                </h4>
                <p className="text-[#374151] mb-4">
                  [Platzhalter für ProzessCanvas Reactflow – Schaubild wird nicht exportiert, da die Implementierung zu komplex ist.]
                </p>

                <h4 className="text-lg font-semibold text-[#374151] mb-2">
                  Folgende Tätigkeiten sind in diesem Prozess
                </h4>
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={index} className="mb-6">
                      <h5 className="text-md font-semibold text-[#374151]">
                        {activity.name}
                      </h5>
                      <p className="text-[#374151] mt-2">
                        Bei Eingang von:
                      </p>
                      <ul className="list-decimal list-inside text-[#374151] mt-2">
                        {activity.trigger?.workProducts?.length ? (
                          activity.trigger.workProducts.map((wp, idx) => (
                            <li key={idx}>
                              <strong>{getWorkProductName(wp._id)}</strong> in einem Fertigstellungsgrad von {wp.completionPercentage || 100}%
                            </li>
                          ))
                        ) : (
                          <li>Keine Trigger vorhanden</li>
                        )}
                      </ul>
                      <p className="text-[#374151] mt-2">
                        wird durch <strong>
                          {
                            (() => {
                              if (typeof activity.executedBy === 'string') return activity.executedBy;
                              if (activity.executedBy && typeof activity.executedBy === 'object' && 'name' in activity.executedBy) {
                                return activity.executedBy.name;
                              }
                              console.error('Unexpected executedBy format:', activity.executedBy);
                              return 'Rolle nicht angegeben';
                            })()
                          }
                        </strong> folgendes durchgeführt:
                      </p>
                      <div
                        className="text-[#374151] mt-2"
                        dangerouslySetInnerHTML={{ __html: activity.description || 'Keine Beschreibung verfügbar' }}
                      />
                      <p className="text-[#374151] mt-2">
                        Das Ergebnis der Tätigkeit ist:
                      </p>
                      <h6 className="text-sm font-semibold text-[#374151] mt-2">
                        {typeof activity.result === 'string' ? activity.result : activity.result?.name || 'Kein Ergebnis angegeben'}
                      </h6>
                      <p className="text-[#374151] mt-2">
                        [Keine Beschreibung verfügbar]
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#374151]">[Keine Aktivitäten verfügbar.]</p>
                )}
              </>
            )}

            {reportType === 'role' && selectedRole && (
              <>
                <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
                  Rollehandbuch für {selectedRole.name}
                </h3>
                <p className="text-[#374151] mb-4">
                  <strong>Standort nicht angegeben, den {new Date().toLocaleDateString()}</strong>
                </p>

                <h4 className="text-lg font-semibold text-[#374151] mb-2">
                  Generelle Beschreibung
                </h4>
                <p className="text-[#374151] mb-4">
                  Die Rolle ist wie folgt beschrieben:
                </p>
                <p className="text-[#374151] mb-4">
                  [Keine Beschreibung verfügbar]
                </p>

                <h4 className="text-lg font-semibold text-[#374151] mb-2">
                  Vorgesetzter
                </h4>
                <p className="text-[#374151] mb-4">
                  [Platzhalter für Vorgesetzten – Nicht in der API verfügbar.]
                </p>

                <h4 className="text-lg font-semibold text-[#374151] mb-2">
                  Diese Rolle ist den folgenden Rollen übergeordnet
                </h4>
                <p className="text-[#374151] mb-4">
                  [Platzhalter für untergebene Rollen – Nicht in der API verfügbar.]
                </p>

                <h4 className="text-lg font-semibold text-[#374151] mb-2">
                  Auszuführende Tätigkeiten
                </h4>
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={index} className="mb-6">
                      <h5 className="text-md font-semibold text-[#374151]">
                        {activity.name}
                      </h5>
                      <p className="text-[#374151] mt-2">
                        Bei Eingang von:
                      </p>
                      <ul className="list-decimal list-inside text-[#374151] mt-2">
                        {activity.trigger?.workProducts?.length ? (
                          activity.trigger.workProducts.map((wp, idx) => (
                            <li key={idx}>
                              <strong>{getWorkProductName(wp._id)}</strong> in einem Fertigstellungsgrad von {wp.completionPercentage || 100}%
                            </li>
                          ))
                        ) : (
                          <li>Keine Trigger vorhanden</li>
                        )}
                      </ul>
                      <p className="text-[#374151] mt-2">
                        wird folgendes durchgeführt:
                      </p>
                      <div
                        className="text-[#374151] mt-2"
                        dangerouslySetInnerHTML={{ __html: activity.description || 'Keine Beschreibung verfügbar' }}
                      />
                      <p className="text-[#374151] mt-2">
                        Das Ergebnis der Tätigkeit ist:
                      </p>
                      <h6 className="text-sm font-semibold text-[#374151] mt-2">
                        {typeof activity.result === 'string' ? activity.result : activity.result?.name || 'Kein Ergebnis angegeben'}
                      </h6>
                      <p className="text-[#374151] mt-2">
                        [Keine Beschreibung verfügbar]
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#374151]">[Keine Aktivitäten verfügbar.]</p>
                )}
              </>
            )}
          </div>
        )}

        {(selectedProcess || selectedRole) && (
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-[#2563eb] text-[#ffffff] rounded hover:bg-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              onClick={handleExport}
            >
              Als PDF exportieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardReportsPage;