// src/features/products/pages/Rollenhandbuch.jsx
import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { stripHtml } from '../utils/helpers.ts';
import useQueryData from '../hooks/useQueryData';

const Rollenhandbuch = () => {
  const { results, handleQuery } = useQueryData();

  useEffect(() => {
    handleQuery(); // Standardabfrage ausführen
  }, [handleQuery]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Rollenhandbuch
      </Typography>
      {(results || []).map((result, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '5px' }}>
          <Typography variant="h6">{stripHtml(result.name)}</Typography>
          <Typography>{stripHtml(result.description)}</Typography>
          {result.activities && result.activities.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Verantwortlich für:
              </Typography>
              {result.activities.map((activity, actIndex) => (
                <Box key={actIndex} sx={{ ml: 2 }}>
                  <Typography>{stripHtml(activity.name)}</Typography>
                  <Typography sx={{ ml: 2 }}>{stripHtml(activity.description)}</Typography>
                  {activity.trigger && activity.trigger.workProducts && (
                    <>
                      <Typography variant="subtitle2" sx={{ ml: 2, mt: 1 }}>
                        Dazu erhält er:
                      </Typography>
                      {activity.trigger.workProducts.map((wp, wpIndex) => (
                        <Typography key={wpIndex} sx={{ ml: 4 }}>
                          - {wp._id || 'N/A'}
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
                        - {stripHtml(activity.resultWorkProduct.name)}
                      </Typography>
                      <Typography sx={{ ml: 4 }}>
                        {stripHtml(activity.resultWorkProduct.description)}
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

export default Rollenhandbuch;