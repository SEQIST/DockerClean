import React from 'react';
import { useParams } from 'react-router-dom';

const Settings: React.FC = () => {
  const { section } = useParams<{ section?: string }>();

  let content = <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Settings Overview</h4>;
  if (section === 'company') {
    content = <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Company Settings</h4>;
  } else if (section === 'user-management') {
    content = <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">User Management</h4>;
  } else if (section === 'system-configuration') {
    content = <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">System Configuration</h4>;
  }

  return (
    <div>
      {content}
    </div>
  );
};

export default Settings;