// features/engineering/components/CommentSection.jsx
import React from 'react';
import { TextField, Typography } from '@mui/material';

const CommentSection = ({ comment, handleCommentChange }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Kommentar
      </Typography>
      <TextField
        label="Kommentar"
        value={comment || ''}
        onChange={handleCommentChange}
        multiline
        rows={4}
        fullWidth
        variant="outlined"
      />
    </div>
  );
};

export default CommentSection;