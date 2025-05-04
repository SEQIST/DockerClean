import React from 'react';
import { Link } from 'react-router-dom';

interface BreadCrumbProps {
  title: string;
  pageTitle: string;
}

const BreadCrumb: React.FC<BreadCrumbProps> = ({ title, pageTitle }) => {
  return (
    <div className="page-title-box d-sm-flex align-items-center justify-content-between mb-4">
      <h4 className="mb-sm-0 text-gray-800 dark:text-white">{title}</h4>
      <div className="page-title-right">
        <ol className="breadcrumb m-0">
          <li className="breadcrumb-item">
            <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              {pageTitle}
            </Link>
          </li>
          <li className="breadcrumb-item active text-gray-700 dark:text-gray-300">{title}</li>
        </ol>
      </div>
    </div>
  );
};

export default BreadCrumb;