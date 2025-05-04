import React from 'react';

interface TableIconProps {
  className?: string;
}

const TableIcon: React.FC<TableIconProps> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 3H21C22.1 3 23 3.9 23 5V19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V5C1 3.9 1.9 3 3 3ZM3 5V19H21V5H3ZM5 7H19V9H5V7ZM5 11H19V13H5V11ZM5 15H19V17H5V15Z"
      fill="currentColor"
    />
  </svg>
);

export default TableIcon;