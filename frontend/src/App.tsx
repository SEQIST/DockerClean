// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import routes from './routes';
import { ScrollToTop } from './components/common/ScrollToTop';

const AppRoutes: React.FC = () => {
  const routeList = routes();
  return useRoutes(routeList);
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  );
};

export default App;