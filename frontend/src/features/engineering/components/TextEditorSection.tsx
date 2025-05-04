// features/engineering/components/TextEditorSection.jsx
import React from 'react';
import { Typography } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';

const TextEditorSection = ({ editorContent, handleEditorChange }) => {
  const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY;

  return (
    <div>
      <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Text bearbeiten
      </Typography>
      <Editor
        apiKey={tinymceApiKey}
        value={editorContent}
        onEditorChange={handleEditorChange}
        init={{
          height: 300,
          menubar: true,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        }}
      />
    </div>
  );
};

export default TextEditorSection;