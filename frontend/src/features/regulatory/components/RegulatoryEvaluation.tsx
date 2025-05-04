import React, { useState, ChangeEvent } from 'react';

interface Content {
  _id: string;
  text: string;
  type: string;
  regulatoryISO: { _id: string };
}

interface EvidencedBy {
  roles: Array<{ _id: string; name: string }>;
  processes: Array<{ _id: string; name: string }>;
  activities: Array<{ _id: string; name: string }>;
  workProducts: Array<{ _id: string; name: string }>;
}

interface Evaluation {
  _id: string;
  type: 'Header' | 'Definition' | 'Information' | 'Requirement';
  completed: boolean;
  evidencedBy: EvidencedBy;
  regulatoryContent: { _id: string };
}

interface RegulatoryEvaluationProps {
  selectedContent: Content | null;
  editEvaluation: Evaluation | null;
  setEditEvaluation: (evaluation: Evaluation | null) => void;
  roles: Array<{ _id: string; name: string }>;
  processes: Array<{ _id: string; name: string }>;
  activities: Array<{ _id: string; name: string }>;
  workProducts: Array<{ _id: string; name: string }>;
  handleEditEvaluation: () => void;
}

const RegulatoryEvaluation: React.FC<RegulatoryEvaluationProps> = ({
  selectedContent,
  editEvaluation,
  setEditEvaluation,
  roles,
  processes,
  activities,
  workProducts,
  handleEditEvaluation,
}) => {
  const [roleInput, setRoleInput] = useState<string>('');
  const [processInput, setProcessInput] = useState<string>('');
  const [activityInput, setActivityInput] = useState<string>('');
  const [workProductInput, setWorkProductInput] = useState<string>('');

  const [roleSuggestions, setRoleSuggestions] = useState<Array<{ _id: string; name: string }>>([]);
  const [processSuggestions, setProcessSuggestions] = useState<Array<{ _id: string; name: string }>>([]);
  const [activitySuggestions, setActivitySuggestions] = useState<Array<{ _id: string; name: string }>>([]);
  const [workProductSuggestions, setWorkProductSuggestions] = useState<Array<{ _id: string; name: string }>>([]);

  const handleInputChange = (
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setSuggestions: React.Dispatch<React.SetStateAction<Array<{ _id: string; name: string }>>>,
    items: Array<{ _id: string; name: string }>,
    selectedItems: Array<{ _id: string; name: string }>
  ) => {
    setInput(input);
    if (input.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filteredSuggestions = items.filter(
      (item) =>
        item.name.toLowerCase().includes(input.toLowerCase()) &&
        !selectedItems.some((selected) => selected._id === item._id)
    );
    setSuggestions(filteredSuggestions);
  };

  const addItem = (
    item: { _id: string; name: string },
    selectedItems: Array<{ _id: string; name: string }>,
    key: keyof EvidencedBy,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setSuggestions: React.Dispatch<React.SetStateAction<Array<{ _id: string; name: string }>>>
  ) => {
    if (!editEvaluation) return;
    const updatedItems = [...selectedItems, item];
    setEditEvaluation({
      ...editEvaluation,
      evidencedBy: {
        ...editEvaluation.evidencedBy,
        [key]: updatedItems,
      },
    });
    setInput('');
    setSuggestions([]);
  };

  const removeItem = (
    itemId: string,
    selectedItems: Array<{ _id: string; name: string }>,
    key: keyof EvidencedBy
  ) => {
    if (!editEvaluation) return;
    const updatedItems = selectedItems.filter((item) => item._id !== itemId);
    setEditEvaluation({
      ...editEvaluation,
      evidencedBy: {
        ...editEvaluation.evidencedBy,
        [key]: updatedItems,
      },
    });
  };

  return (
    <div className="w-1/5 p-4 bg-white dark:bg-gray-900 shadow-md overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Bewertung</h2>
      {selectedContent ? (
        editEvaluation ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ</label>
            <select
              value={editEvaluation.type || ''}
              onChange={(e) =>
                setEditEvaluation({ ...editEvaluation, type: e.target.value as Evaluation['type'] })
              }
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 mb-4"
            >
              <option value="Header">Header</option>
              <option value="Definition">Definition</option>
              <option value="Information">Information</option>
              <option value="Requirement">Requirement</option>
            </select>

            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Evidenced by:</p>

            {/* Rollen */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rollen</label>
            <div className="relative mb-4">
              <input
                type="text"
                value={roleInput}
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    setRoleInput,
                    setRoleSuggestions,
                    roles,
                    editEvaluation.evidencedBy.roles
                  )
                }
                placeholder="Rollen hinzufügen..."
                className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
              />
              {roleSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md max-h-40 overflow-y-auto">
                  {roleSuggestions.map((role) => (
                    <li
                      key={role._id}
                      onClick={() =>
                        addItem(
                          role,
                          editEvaluation.evidencedBy.roles,
                          'roles',
                          setRoleInput,
                          setRoleSuggestions
                        )
                      }
                      className="px-3 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {role.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {editEvaluation.evidencedBy.roles.map((role) => (
                <div
                  key={role._id}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                >
                  <span>{role.name}</span>
                  <button
                    onClick={() => removeItem(role._id, editEvaluation.evidencedBy.roles, 'roles')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Prozesse */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prozesse</label>
            <div className="relative mb-4">
              <input
                type="text"
                value={processInput}
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    setProcessInput,
                    setProcessSuggestions,
                    processes,
                    editEvaluation.evidencedBy.processes
                  )
                }
                placeholder="Prozesse hinzufügen..."
                className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
              />
              {processSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md max-h-40 overflow-y-auto">
                  {processSuggestions.map((process) => (
                    <li
                      key={process._id}
                      onClick={() =>
                        addItem(
                          process,
                          editEvaluation.evidencedBy.processes,
                          'processes',
                          setProcessInput,
                          setProcessSuggestions
                        )
                      }
                      className="px-3 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {process.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {editEvaluation.evidencedBy.processes.map((process) => (
                <div
                  key={process._id}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                >
                  <span>{process.name}</span>
                  <button
                    onClick={() => removeItem(process._id, editEvaluation.evidencedBy.processes, 'processes')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Aktivitäten */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aktivitäten</label>
            <div className="relative mb-4">
              <input
                type="text"
                value={activityInput}
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    setActivityInput,
                    setActivitySuggestions,
                    activities,
                    editEvaluation.evidencedBy.activities
                  )
                }
                placeholder="Aktivitäten hinzufügen..."
                className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
              />
              {activitySuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md max-h-40 overflow-y-auto">
                  {activitySuggestions.map((activity) => (
                    <li
                      key={activity._id}
                      onClick={() =>
                        addItem(
                          activity,
                          editEvaluation.evidencedBy.activities,
                          'activities',
                          setActivityInput,
                          setActivitySuggestions
                        )
                      }
                      className="px-3 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {activity.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {editEvaluation.evidencedBy.activities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                >
                  <span>{activity.name}</span>
                  <button
                    onClick={() => removeItem(activity._id, editEvaluation.evidencedBy.activities, 'activities')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Work Products */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Products</label>
            <div className="relative mb-4">
              <input
                type="text"
                value={workProductInput}
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    setWorkProductInput,
                    setWorkProductSuggestions,
                    workProducts,
                    editEvaluation.evidencedBy.workProducts
                  )
                }
                placeholder="Work Products hinzufügen..."
                className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
              />
              {workProductSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md max-h-40 overflow-y-auto">
                  {workProductSuggestions.map((wp) => (
                    <li
                      key={wp._id}
                      onClick={() =>
                        addItem(
                          wp,
                          editEvaluation.evidencedBy.workProducts,
                          'workProducts',
                          setWorkProductInput,
                          setWorkProductSuggestions
                        )
                      }
                      className="px-3 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {wp.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {editEvaluation.evidencedBy.workProducts.map((wp) => (
                <div
                  key={wp._id}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                >
                  <span>{wp.name}</span>
                  <button
                    onClick={() => removeItem(wp._id, editEvaluation.evidencedBy.workProducts, 'workProducts')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={editEvaluation.completed || false}
                onChange={(e) => setEditEvaluation({ ...editEvaluation, completed: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
            </label>

            <div className="flex justify-between mt-4">
              <button
                onClick={handleEditEvaluation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Speichern
              </button>
              <button
                onClick={() => setEditEvaluation(null)}
                className="px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Keine Bewertung verfügbar</p>
        )
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Wähle ein Inhaltselement aus der Liste</p>
      )}
    </div>
  );
};

export default RegulatoryEvaluation;