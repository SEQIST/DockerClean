// src/features/products/components/QueryResults.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { stripHtml } from '../utils/helpers.ts';

const QueryResults = ({ results, selectedFields, dependencyHierarchy, dependencyFields }) => {
  // Rekursive Funktion, um Abhängigkeiten anzuzeigen
  const renderDependencies = (deps, item, level = 1) => {
    if (!deps || !Array.isArray(deps) || deps.length === 0) return null;

    // Begrenze die Rekursionstiefe, um unendliche Schleifen zu vermeiden
    if (level > 3) return null;

    return deps.map(dep => (
      <Box key={dep} sx={{ mt: 1, ml: level * 2 }}>
        <Typography variant="subtitle2">{dep}</Typography>
        {(Array.isArray(item[dep]) ? item[dep] : [item[dep]]).map((depItem, depIndex) => (
          depItem && (
            <Box key={depIndex}>
              <Typography sx={{ ml: 2 }}>
                - {(dependencyFields[dep] || []).map(field => {
                  if (field === 'trigger' && dep === 'Aktivitäten') {
                    // Spezielle Behandlung für Trigger
                    const trigger = depItem[field];
                    if (trigger && Array.isArray(trigger.workProducts)) {
                      return `Trigger: ${trigger.workProducts.map(wp => wp.name || wp._id || 'N/A').join(', ')}`;
                    }
                    return 'Trigger: N/A';
                  }
                  return `${field}: ${stripHtml(depItem[field] || 'N/A')}`;
                }).join(', ')}
              </Typography>
              {Object.keys(depItem || {})
                .filter(key => Array.isArray(depItem[key])) // Nur Arrays rekursiv rendern
                .map(subDep => (
                  <div key={subDep}>
                    {renderDependencies([subDep], depItem, level + 1)}
                  </div>
                ))}
            </Box>
          )
        ))}
      </Box>
    ));
  };

  console.log('QueryResults Props:', { results, selectedFields, dependencyHierarchy, dependencyFields });

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Rollenbeschreibung
      </Typography>
      {(results || []).map((result, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '5px' }}>
          <Typography variant="h6">{stripHtml(result.name || 'N/A')}</Typography>
          <Typography>{stripHtml(result.description || 'N/A')}</Typography>
          {result.activities && Array.isArray(result.activities) && result.activities.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Verantwortlich für:
              </Typography>
              {result.activities.map((activity, actIndex) => (
                <Box key={actIndex} sx={{ ml: 2 }}>
                  <Typography>{stripHtml(activity.name || 'N/A')}</Typography>
                  <Typography sx={{ ml: 2 }}>{stripHtml(activity.description || 'N/A')}</Typography>
                  {activity.trigger && Array.isArray(activity.trigger.workProducts) && activity.trigger.workProducts.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ ml: 2, mt: 1 }}>
                        Dazu erhält er:
                      </Typography>
                      {activity.trigger.workProducts.map((wp, wpIndex) => (
                        <Typography key={wpIndex} sx={{ ml: 4 }}>
                          - {wp.name ? stripHtml(wp.name) : wp._id || 'N/A'}
                        </Typography>
                      ))}
                    </>
                  )}
                  {activity.resultWorkProduct && (
                    <>
                      <Typography variant="subtitle2" sx={{ ml: 2, mt: 1 }}>
                        Und liefert als Ergebnis:
                      </Typography>
                      <Typography sx={{ ml: 4 }}>
                        - {stripHtml(activity.resultWorkProduct.name || 'N/A')}
                      </Typography>
                      <Typography sx={{ ml: 4 }}>
                        {stripHtml(activity.resultWorkProduct.description || 'N/A')}
                      </Typography>
                    </>
                  )}
                </Box>
              ))}
            </>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default QueryResults;