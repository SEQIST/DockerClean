import React from 'react';
import { Chart } from 'react-google-charts';

const RegulatoryContent = ({
  selectedRegulatory,
  regulatoryContents,
  cachedContents,
  regulatoryEvaluations,
  selectedContent,
  loadingContents,
  setSelectedContent,
  handleDeleteContent,
  getComplianceStats,
  handleScroll,
}) => {
  return (
    <div
      className="w-3/5 p-4 bg-white dark:bg-gray-900 shadow-md overflow-y-auto h-[calc(100vh-80px)]"
      onScroll={handleScroll}
    >
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Inhalt
      </h2>
      {selectedRegulatory && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Compliance-Status
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Number of Items: {getComplianceStats.totalItems}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Requirements No: {getComplianceStats.requirements}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Completed No: {getComplianceStats.completedRequirements}
          </p>
          <Chart
            chartType="PieChart"
            data={getComplianceStats.chartData}
            options={{
              title: 'Compliance-Status',
              colors: ['#ff0000', '#0000ff'],
              chartArea: { width: '80%', height: '70%' },
              legend: { position: 'bottom' },
            }}
            width="100%"
            height="300px"
          />
        </div>
      )}
      {selectedRegulatory ? (
        loadingContents && regulatoryContents.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Lade Inhaltselemente...</p>
        ) : regulatoryContents.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Keine Inhaltselemente verfügbar.</p>
        ) : (
          <ul>
            {regulatoryContents.map((content, index) => {
              const evaluation = regulatoryEvaluations.find(evaluation => evaluation.regulatoryContent && evaluation.regulatoryContent._id.toString() === content._id.toString());
              const isRequirement = content.type === 'Requirement';
              const isCompleted = evaluation && evaluation.completed;
              const isHeader = content.type === 'Header';
              const previousContent = index > 0 ? regulatoryContents[index - 1] : null;
              const isIndented = !isHeader && previousContent && previousContent.type === 'Header';

              return (
                <li
                  key={content._id}
                  onClick={() => setSelectedContent(content)}
                  className={`flex items-center justify-between py-2 px-4 rounded-lg mb-1 cursor-pointer ${selectedContent && selectedContent._id === content._id ? 'bg-blue-100 dark:bg-blue-900' : ''} ${isCompleted ? 'bg-green-100 dark:bg-green-900' : isRequirement ? 'bg-gray-50 dark:bg-gray-800' : ''} ${isIndented ? 'pl-8' : 'pl-4'} ${isHeader ? 'border-t border-gray-200 dark:border-gray-700' : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}
                >
                  <div className="flex items-center">
                    {isRequirement && (
                      <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                    <span className="text-gray-800 dark:text-gray-200">{content.text}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteContent(content._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2v1h8V5a2 2 0 00-2-2z"></path>
                    </svg>
                  </button>
                </li>
              );
            })}
            {loadingContents && (
              <p className="text-gray-600 dark:text-gray-400 text-center py-2">
                Lade weitere Inhaltselemente...
              </p>
            )}
          </ul>
        )
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Wähle eine Regulatorie aus der Liste</p>
      )}
    </div>
  );
};

export default RegulatoryContent;