// src/features/products/hooks/useWorkProductsData.js
import { useState, useEffect } from 'react';

const useWorkProductsData = () => {
  const [workProducts, setWorkProducts] = useState([]);
  const [workProductsMap, setWorkProductsMap] = useState(new Map());
  const [roles, setRoles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Work Products laden
        console.log('Sende Anfrage an /api/workproducts...');
        const workProductsResponse = await fetch('/api/workproducts', {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!workProductsResponse.ok) {
          const responseText = await workProductsResponse.text();
          console.error('Antwort-Inhalt (Work Products):', responseText);
          throw new Error(`Fehler beim Laden der Work Products: ${workProductsResponse.status} ${workProductsResponse.statusText}`);
        }

        const workProductsData = await workProductsResponse.json();
        console.log('Geladene Work Products:', workProductsData);
        setWorkProducts(workProductsData);

        // Erstelle eine Map für schnellen Zugriff auf Work Product Namen
        const wpMap = new Map();
        workProductsData.forEach((wp) => {
          console.log(`Work Product hinzufügen: ID=${wp._id}, Name=${wp.name}`);
          wpMap.set(wp._id.toString(), wp); // toString() für ObjectId
        });
        console.log('Work Products Map:', Array.from(wpMap.entries()));
        setWorkProductsMap(wpMap);

        // Aktivitäten laden
        console.log('Sende Anfrage an /api/activities...');
        const activitiesResponse = await fetch('/api/activities', {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!activitiesResponse.ok) {
          const responseText = await activitiesResponse.text();
          console.error('Antwort-Inhalt (Activities):', responseText);
          throw new Error(`Fehler beim Laden der Aktivitäten: ${activitiesResponse.status} ${activitiesResponse.statusText}`);
        }

        const activitiesData = await activitiesResponse.json();
        console.log('Geladene Aktivitäten:', activitiesData);
        activitiesData.forEach((activity) => {
          console.log(`Aktivität: Name=${activity.name}, Result=${activity.result}`);
        });
        setActivities(activitiesData);

        // Simulierte Daten für Rollen
        setRoles([
          { _id: 'role1', name: 'Geschäftsführung' },
          { _id: 'role2', name: 'Operations' },
          { _id: 'role3', name: 'andere Rolle2' },
        ]);

        setLoading(false);
      } catch (err) {
        console.error('Fehler in fetchData:', err);
        setError(err.message);

        // Fallback auf simulierte Daten
        console.log('Verwende simulierte Daten als Fallback...');
        const fallbackWorkProducts = [
          {
            _id: 'wp1',
            name: '001_Ergebnis_1',
            activities: ['act1', 'act2', 'act3'],
            children: [],
          },
          {
            _id: 'wp2',
            name: '001_Ergebnis_2',
          },
          {
            _id: 'wp3',
            name: '001_Ergebnis_3',
          },
          {
            _id: 'wp4',
            name: '001_Ergebnis_4',
          },
        ];
        setWorkProducts(fallbackWorkProducts);

        const wpMap = new Map();
        fallbackWorkProducts.forEach((wp) => {
          console.log(`Fallback Work Product hinzufügen: ID=${wp._id}, Name=${wp.name}`);
          wpMap.set(wp._id.toString(), wp);
        });
        console.log('Fallback Work Products Map:', Array.from(wpMap.entries()));
        setWorkProductsMap(wpMap);

        setActivities([
          {
            _id: 'act1',
            name: 'Testaktivität start 2 GF',
            roles: ['role1'],
            result: 'wp2', // Verknüpft mit Ergebnis_2
            description: 'Beschreibung 1',
          },
          {
            _id: 'act2',
            name: 'Aktivität 2 andere rolle2',
            roles: ['role3'],
            result: 'wp3', // Verknüpft mit Ergebnis_3
            description: 'Beschreibung 2',
          },
          {
            _id: 'act3',
            name: 'Testaktivität start 3 GF',
            roles: ['role1'],
            result: 'wp4', // Verknüpft mit Ergebnis_4
            description: 'Beschreibung 3',
          },
        ]);
        setRoles([
          { _id: 'role1', name: 'Geschäftsführung' },
          { _id: 'role2', name: 'Operations' },
          { _id: 'role3', name: 'andere Rolle2' },
        ]);

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { workProducts, workProductsMap, roles, activities, loading, error };
};

export default useWorkProductsData;