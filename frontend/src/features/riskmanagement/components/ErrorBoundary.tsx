// src/features/riskmanagement/components/ErrorBoundary.jsx
import React from 'react';
import { Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Fehler abgefangen:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Typography color="error">Etwas ist schiefgelaufen.</Typography>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;