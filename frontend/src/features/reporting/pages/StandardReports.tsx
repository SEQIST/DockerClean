import { useState, useEffect } from 'react';
import CustomAutocomplete from '../../activities/components/CustomAutocomplete';
import { Process, Role, Activity as ActivityType } from '../../processes/services/processService';

interface StandardReportsProps {
  processes: Process[];
  roles: Role[];
}

const StandardReports: React.FC<StandardReportsProps> = ({ processes, roles }) => {
  const [reportType, setReportType] = useState<'process' | 'role'>('process');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [latexContent, setLatexContent] = useState<string>('');

  const sortedProcesses = [...processes].sort((a, b) => a.name.localeCompare(b.name));
  const sortedRoles = [...roles].sort((a, b) => a.name.localeCompare(b.name));

  const generateLatexContent = () => {
    if (reportType === 'process' && selectedProcess) {
      const activities: ActivityType[] = []; // Hier müssten die Aktivitäten für den Prozess abgerufen werden
      // Da wir die Aktivitäten nicht direkt haben, fügen wir einen Platzhalter ein
      const latex = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[ngerman]{babel}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{fancyhdr}
\\usepackage{geometry}
\\geometry{a4paper, margin=2.5cm}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{Prozessbeschreibung für ${selectedProcess.name}}
\\fancyhead[R]{\\today}
\\fancyfoot[C]{\\thepage}
\\begin{document}
\\section*{Prozessbeschreibung für ${selectedProcess.name}}
\\textbf{${selectedProcess.owner || 'Standort nicht angegeben'}, den \\today}

\\subsection*{Generelle Beschreibung}
Die Prozess ist wie folgt beschrieben:

${selectedProcess.description || 'Keine Beschreibung verfügbar'}

\\subsection*{Schaubild}
[Platzhalter für ProzessCanvas Reactflow – Schaubild kann nicht direkt in PDF gerendert werden.]

\\subsection*{Folgende Tätigkeiten sind in diesem Prozess}
[Platzhalter für Aktivitäten – Aktivitäten müssen über die API abgerufen werden.]

\\end{document}
`;
      setLatexContent(latex);
    } else if (reportType === 'role' && selectedRole) {
      const activities: ActivityType[] = []; // Hier müssten die Aktivitäten für die Rolle abgerufen werden
      const latex = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[ngerman]{babel}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{fancyhdr}
\\usepackage{geometry}
\\geometry{a4paper, margin=2.5cm}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{Rollehandbuch für ${selectedRole.name}}
\\fancyhead[R]{\\today}
\\fancyfoot[C]{\\thepage}
\\begin{document}
\\section*{Rollehandbuch für ${selectedRole.name}}
\\textbf{${'Standort nicht angegeben'}, den \\today}

\\subsection*{Generelle Beschreibung}
Die Rolle ist wie folgt beschrieben:

${'Keine Beschreibung verfügbar'}

\\subsection*{Vorgesetzter}
[Platzhalter für Vorgesetzten – Nicht in der API verfügbar.]

\\subsection*{Diese Rolle ist den folgenden Rollen übergeordnet}
[Platzhalter für untergebene Rollen – Nicht in der API verfügbar.]

\\subsection*{Auszuführende Tätigkeiten}
[Platzhalter für Aktivitäten – Aktivitäten müssen über die API abgerufen werden.]

\\end{document}
`;
      setLatexContent(latex);
    } else {
      setLatexContent('');
    }
  };

  useEffect(() => {
    generateLatexContent();
  }, [reportType, selectedProcess, selectedRole]);

  return (
    <div className="page-content px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          Standardberichte
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Berichtstyp auswählen
          </label>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value as 'process' | 'role');
              setSelectedProcess(null);
              setSelectedRole(null);
            }}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="process">Prozessbericht</option>
            <option value="role">Rollenbericht</option>
          </select>
        </div>

        {reportType === 'process' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prozess auswählen
            </label>
            <CustomAutocomplete<Process>
              options={sortedProcesses}
              value={selectedProcess}
              onChange={(newValue: Process | null) => setSelectedProcess(newValue)}
              getOptionLabel={(option: Process) => option.name}
              placeholder="Prozess auswählen"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rolle auswählen
            </label>
            <CustomAutocomplete<Role>
              options={sortedRoles}
              value={selectedRole}
              onChange={(newValue: Role | null) => setSelectedRole(newValue)}
              getOptionLabel={(option: Role) => option.name}
              placeholder="Rolle auswählen"
            />
          </div>
        )}

        {latexContent && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Berichtsvorschau
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              Der Bericht wird als PDF generiert. Klicken Sie auf "Exportieren", um den Bericht herunterzuladen.
            </p>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                // Der Export wird durch latexmk automatisch gehandhabt
                console.log('Exportiere LaTeX:', latexContent);
              }}
            >
              Als PDF exportieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardReports;