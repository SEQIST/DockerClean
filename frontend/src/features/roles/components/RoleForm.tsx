import React from 'react';

const RoleForm = ({ onOpenAddModal }: { onOpenAddModal: () => void }) => {
  return (
    <div>
      <button
        onClick={onOpenAddModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Neue Rolle
      </button>
    </div>
  );
};

export default RoleForm;