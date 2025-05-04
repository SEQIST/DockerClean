import React from 'react';

// Schnittstelle für die data-Prop
interface WorkProductNodeData {
  workProduct?: string;
  activity?: string;
  role?: string;
}

// Props-Schnittstelle für die Komponente
interface WorkProductNodeProps {
  data: WorkProductNodeData;
}

const WorkProductNode: React.FC<WorkProductNodeProps> = ({ data }) => {
  console.log('WorkProductNode data:', data);

  return (
    <div className="w-[200px] h-[120px] border border-gray-700 rounded-lg bg-white flex flex-col justify-between p-2 relative">
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-500 rounded-full" />
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-500 rounded-full" />
      <h3 className="text-center font-bold text-sm">
        Work Product: {data.workProduct || 'Unbekannt'}
      </h3>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xs">Aktivität: {data.activity || 'Keine'}</span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center">
          <span className="text-xs">Rollen: {data.role || 'Keine'}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkProductNode;