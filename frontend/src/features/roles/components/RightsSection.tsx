import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface Role {
  _id: string;
  name: string;
  abbreviation?: string;
  department?: { _id: string; name: string } | string;
  supervisorRole?: { _id: string; name: string } | string;
  subordinateRoles?: (Role | string)[];
  company?: string;
  subsidiary?: { _id: string } | string;
  availableDailyHours?: number;
  workHoursDayMaxLoad?: number;
  paymentType: string;
  paymentValue: number;
  numberOfHolders: number;
  rights?: string;
  tasks?: any[];
}

interface RightsSectionProps {
  editRole: Role | null;
  onChange: (field: string, value: any) => void;
}

const RightsSection: React.FC<RightsSectionProps> = ({
  editRole,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rechte</label>
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg">
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          value={editRole?.rights || ''}
          onEditorChange={(content: string) => onChange('rights', content)}
          init={{
            height: 200,
            menubar: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'preview',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | removeformat | code | help',
          }}
        />
      </div>
    </div>
  );
};

export default RightsSection;