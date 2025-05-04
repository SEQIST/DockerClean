import React from 'react';
import { NavLink } from 'react-router-dom';

interface MenuItem {
  to: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  subItems?: MenuItem[];
}

interface SidebarSectionProps {
  title: string;
  items: MenuItem[];
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, items }) => {
  return (
    <div>
      <p className="mb-2 px-3 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <ul className="mb-4">
        {items.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
            {item.subItems && (
              <ul className="ml-4">
                {item.subItems.map((subItem, subIndex) => (
                  <li key={subIndex}>
                    <NavLink
                      to={subItem.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900'
                        }`
                      }
                    >
                      <subItem.icon className="h-5 w-5" />
                      <span>{subItem.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarSection;