import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const Ecommerce = () => {
  return (
    <>
      <PageMeta
        title="Dashboard | SEQ.IST - Project Management Solution"
        description="Dashboard of SEQ.IST Project Management Solution"
      />
      <PageBreadcrumb pageTitle="Dashboard" />
      <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
        <div className="w-full max-w-[1800px] min-w-[1200px]">
          {/* Willkommensbereich */}
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-semibold">Willkommen in SEQ.IST</h1>
            <p className="mt-2">Hallo Johnny! Sie haben aktuell 5 offene Aufgaben.</p>
          </div>

          {/* 4 Bereiche */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bereich 1: Tasks */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <img
                src="/images/task-illustration.svg"
                alt="Tasks Illustration"
                className="w-32 h-32 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Offene Aufgaben
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dieser Bereich wird aktuell noch bearbeitet und steht bald zur Verfügung.
              </p>
            </div>

            {/* Bereich 2: Leer */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <img
                src="/images/task-illustration.svg"
                alt="Placeholder Illustration"
                className="w-32 h-32 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Platzhalter
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dieser Bereich wird aktuell noch bearbeitet und steht bald zur Verfügung.
              </p>
            </div>

            {/* Bereich 3: Leer */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <img
                src="/images/task-illustration.svg"
                alt="Placeholder Illustration"
                className="w-32 h-32 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Platzhalter
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dieser Bereich wird aktuell noch bearbeitet und steht bald zur Verfügung.
              </p>
            </div>

            {/* Bereich 4: Leer */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <img
                src="/images/task-illustration.svg"
                alt="Placeholder Illustration"
                className="w-32 h-32 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Platzhalter
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dieser Bereich wird aktuell noch bearbeitet und steht bald zur Verfügung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Ecommerce;