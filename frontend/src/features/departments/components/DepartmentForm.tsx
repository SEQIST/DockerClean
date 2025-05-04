interface DepartmentFormProps {
  onOpenAddModal: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ onOpenAddModal }) => {
  return (
    <button
      onClick={onOpenAddModal}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
      Neue Abteilung
    </button>
  );
};

export default DepartmentForm;