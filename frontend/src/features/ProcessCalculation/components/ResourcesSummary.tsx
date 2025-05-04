interface ResourceSummary {
  name: string;
  hours: number;
}

const ResourcesSummary = ({ resourcesSummary }: { resourcesSummary: ResourceSummary[] }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Resources Summary
      </h3>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Rolle</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Gesamtstunden</th>
            </tr>
          </thead>
          <tbody>
            {resourcesSummary.map((role, index) => (
              <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{role.name}</td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{role.hours.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourcesSummary;