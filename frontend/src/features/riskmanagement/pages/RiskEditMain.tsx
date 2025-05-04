import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import RiskEditForm from './RiskEditForm';
import RiskEditActions from './RiskEditActions';

const RiskEditMain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [risk, setRisk] = useState(null);
  const [categories, setCategories] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [workProducts, setWorkProducts] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    status: '',
    title: '',
    submitter: '',
    description: '',
    mitigation: '',
    likelihoodBefore: 1,
    severityBeforeEstimated: 1,
    severityBeforeCalculated: 1,
    likelihoodAfter: 1,
    severityAfterEstimated: 1,
    severityAfterCalculated: 1,
    strategy: '',
    workProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchRisk(),
          fetchCategories(),
          fetchStrategies(),
          fetchWorkProducts(),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchRisk = async () => {
    const response = await fetch(`http://localhost:5001/api/riskmatrix/risks/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Risiko nicht gefunden');
      }
      throw new Error(`Fehler beim Laden des Risikos: ${response.statusText}`);
    }
    const data = await response.json();
    setRisk(data);
    setFormData({
      ...data,
      category: data.category?._id || '',
      strategy: data.strategy?._id || '',
      workProducts: data.workProducts || [],
    });
  };

  const fetchCategories = async () => {
    const response = await fetch('http://localhost:5001/api/riskcategories');
    if (!response.ok) throw new Error('Fehler beim Laden der Kategorien');
    const data = await response.json();
    setCategories(data || []);
  };

  const fetchStrategies = async () => {
    const response = await fetch('http://localhost:5001/api/riskstrategies');
    if (!response.ok) throw new Error('Fehler beim Laden der Strategien');
    const data = await response.json();
    setStrategies(data || []);
  };

  const fetchWorkProducts = async () => {
    const response = await fetch('http://localhost:5001/api/workproducts');
    if (!response.ok) throw new Error('Fehler beim Laden der Work Products');
    const data = await response.json();
    setWorkProducts(data || []);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.100',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 20,
          px: { xs: 2, sm: 6, lg: 8 },
        }}
      >
        <Box sx={{ maxWidth: 900, width: '100%', minWidth: '1600px', bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.100',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 20,
          px: { xs: 2, sm: 6, lg: 8 },
        }}
      >
        <Box sx={{ maxWidth: 900, width: '100%', minWidth: '1600px', bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Risiko bearbeiten
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography color="error" sx={{ fontSize: '1rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
            Fehler: {error}
          </Typography>
          <RiskEditActions navigate={navigate} isError />
        </Box>
      </Box>
    );
  }

  if (!risk) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.100',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 20,
          px: { xs: 2, sm: 6, lg: 8 },
        }}
      >
        <Box sx={{ maxWidth: 900, width: '100%', minWidth: '1600px', bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Risiko bearbeiten
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography sx={{ fontSize: '1rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
            Risiko nicht gefunden
          </Typography>
          <RiskEditActions navigate={navigate} isError />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.100',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 20,
        px: { xs: 2, sm: 6, lg: 8 },
      }}
    >
      <Box sx={{ maxWidth: 900, width: '100%', minWidth: '1600px', bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Risiko bearbeiten
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <RiskEditForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          strategies={strategies}
          workProducts={workProducts}
          handleSubmit={() => RiskEditActions.handleSubmit(id, formData, navigate, setError)}
        />
      </Box>
    </Box>
  );
};

export default RiskEditMain;