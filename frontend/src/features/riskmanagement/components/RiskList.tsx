import { useNavigate } from 'react-router-dom';

// Interface für ein Risiko
interface Risk {
  _id: string;
  category?: { _id: string; name: string } | string;
  status?: string;
  title?: string;
  submitter?: string;
  description?: string;
  likelihoodBefore?: number;
  severityBeforeCalculated?: number;
}

// Interface für die Props der RiskList-Komponente
interface RiskListProps {
  risks: Risk[] | null;
  setRisks: React.Dispatch<React.SetStateAction<Risk[] | null>>;
  onDelete: (id: string) => void;
}

const getRiskColor = (likelihood: number, severity: number): string => {
  const riskLevel = likelihood * severity;
  if (riskLevel <= 4) return '#4CAF50'; // Grün
  if (riskLevel <= 12) return '#FFC107'; // Gelb
  return '#F44336'; // Rot
};

const RiskList: React.FC<RiskListProps> = ({ risks, setRisks, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[400px]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Kategorie</th>
              <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Status</th>
              <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Titel</th>
              <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Submitter</th>
              <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Beschreibung</th>
              <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Risikostatus</th>
              <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {risks && risks.length > 0 ? risks.map((risk) => {
              const categoryName = typeof risk.category === 'object' && risk.category?.name ? risk.category.name : risk.category?.toString() || 'N/A';
              const plainText = risk.description ? risk.description.replace(/<[^>]+>/g, '') : 'N/A';
              const firstLine = plainText.split('\n')[0];
              return (
                <tr key={risk._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-200 dark:border-gray-600 p-2 max-w-[150px] truncate">{categoryName}</td>
                  <td className="border border-gray-200 dark:border-gray-600 p-2 max-w-[150px] truncate">{risk.status || 'N/A'}</td>
                  <td className="border border-gray-200 dark:border-gray-600 p-2 max-w-[200px] truncate">{risk.title || 'N/A'}</td>
                  <td className="border border-gray-200 dark:border-gray-600 p-2 max-w-[150px] truncate">{risk.submitter || 'N/A'}</td>
                  <td className="border border-gray-200 dark:border-gray-600 p-2 max-w-[300px] truncate">{firstLine}</td>
                  <td className="border border-gray-200 dark:border-gray-600 p-2">
                    <svg
                      className="w-5 h-5"
                      fill={getRiskColor(risk.likelihoodBefore || 1, risk.severityBeforeCalculated || 1)}
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 p-2">
                    <button
                      onClick={() => navigate(`/riskmanagement/edit/${risk._id}`)}
                      className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828L14.586 4.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(risk._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2v1h8V5a2 2 0 00-2-2z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="border border-gray-200 dark:border-gray-600 p-2 text-center text-gray-700 dark:text-gray-300">
                  Keine Risiken verfügbar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskList;