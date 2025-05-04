import React from 'react';

interface ProjectBudgetOverviewProps {
  entity: { plannedBudget: number; calculatedCost: number };
}

const ProjectBudgetOverview: React.FC<ProjectBudgetOverviewProps> = ({ entity }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Budgetübersicht
      </h3>
      <p className="text-gray-700 dark:text-gray-300">
        Geplantes Budget:{' '}
        {entity.plannedBudget !== undefined && entity.plannedBudget !== null
          ? `${entity.plannedBudget.toFixed(2)} €`
          : 'Nicht angegeben'}
      </p>
      <p className={(entity.calculatedCost || 0) > (entity.plannedBudget || 0) ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}>
        Berechnete Kosten:{' '}
        {entity.calculatedCost !== undefined && entity.calculatedCost !== null
          ? `${entity.calculatedCost.toFixed(2)} €`
          : 'Nicht angegeben'}
        {(entity.calculatedCost || 0) > (entity.plannedBudget || 0) && (
          <span className="ml-1 inline-flex items-center">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="ml-1 text-sm text-red-500 dark:text-red-400">
              Budgetüberschreitung
            </span>
          </span>
        )}
      </p>
    </div>
  );
};

export default ProjectBudgetOverview;