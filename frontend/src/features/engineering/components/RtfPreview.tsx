// features/engineering/components/RtfPreview.jsx
import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';

const RtfPreview = ({ rteContent }) => {
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key';

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        RTF-Vorschau
      </Typography>
      <Editor
        apiKey={apiKey}
        value={rteContent}
        init={{
          height: 300,
          menubar: false,
          plugins: ['lists'],
          toolbar: '',
          readonly: true,
        }}
        disabled={true}
      />
    </>
  );
};

export default RtfPreview;