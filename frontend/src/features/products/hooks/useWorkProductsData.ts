// src/features/products/hooks/useWorkProductsData.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useWorkProductsData = () => {
  const [workProducts, setWorkProducts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [workProductsResponse, rolesResponse, activitiesResponse] = await Promise.all([
          axios.get('http://localhost:5001/api/workproducts'),
          axios.get('http://localhost:5001/api/roles'),
          axios.get('http://localhost:5001/api/activities'),
        ]);

        setWorkProducts(workProductsResponse.data || []);
        setRoles(rolesResponse.data || []);
        setActivities(activitiesResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { workProducts, roles, activities, loading, error };
};

export default useWorkProductsData;