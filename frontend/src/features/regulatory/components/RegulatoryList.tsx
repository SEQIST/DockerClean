import React from 'react';

interface RegulatoryISO {
  _id: string;
  name: string;
}

interface RegulatoryListProps {
  regulatoryISOs: RegulatoryISO[];
  selectedRegulatory: RegulatoryISO | null;
  newRegulatoryName: string;
  setRegulatoryISOs: React.Dispatch<React.SetStateAction<RegulatoryISO[]>>;
  setSelectedRegulatory: React.Dispatch<React.SetStateAction<RegulatoryISO | null>>;
  setSelectedContent: React.Dispatch<React.SetStateAction<any>>;
  setNewRegulatoryName: React.Dispatch<React.SetStateAction<string>>;
  handleAddRegulatory: () => void;
  handleDeleteRegulatory: (id: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showAddOptions?: boolean;
}

const RegulatoryList: React.FC<RegulatoryListProps> = ({
  regulatoryISOs,
  selectedRegulatory,
  newRegulatoryName,
  setRegulatoryISOs,
  setSelectedRegulatory,
  setSelectedContent,
  setNewRegulatoryName,
  handleAddRegulatory,
  handleDeleteRegulatory,
  handleFileUpload,
  showAddOptions = true,
}) => {
  return (
    <div className="h-full border-r border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-md overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Regulatorien
      </h2>
      {showAddOptions && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Neue Regulatorie"
            value={newRegulatoryName}
            onChange={(e) => setNewRegulatoryName(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 mb-2"
          />
          <button
            onClick={handleAddRegulatory}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          >
            Hinzufügen
          </button>
          <label className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            Datei hochladen
            <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.docx,.xlsx" />
          </label>
        </div>
      )}
      <ul>
        {regulatoryISOs && regulatoryISOs.length > 0 ? (
          regulatoryISOs.map(iso => (
            <li
              key={iso._id}
              onClick={() => {
                setSelectedRegulatory(iso);
                setSelectedContent(null);
              }}
              className={`flex items-center justify-between py-2 px-4 rounded-lg mb-1 cursor-pointer truncate ${
                selectedRegulatory && selectedRegulatory._id === iso._id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-gray-800 dark:text-gray-200 truncate">{iso.name}</span>
              {showAddOptions && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteRegulatory(iso._id); }}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2v1h8V5a2 2 0 00-2-2z"></path>
                  </svg>
                </button>
              )}
            </li>
          ))
        ) : (
          <li className="text-gray-600 dark:text-gray-400">Keine Regulatorien verfügbar</li>
        )}
      </ul>
    </div>
  );
};

export default RegulatoryList;