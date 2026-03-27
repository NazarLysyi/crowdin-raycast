import { Action, ActionPanel, Form, showToast, Toast } from '@raycast/api';
import { withAccessToken, FormValidation, useForm } from '@raycast/utils';
import fs from 'fs/promises';
import path from 'path';

import { oauth } from './services/crowdin';
import { useCrowdinClient } from './hooks/useCrowdinClient';
import { useProjects } from './hooks/useProjects';

interface UploadFormValues {
  projectId: string;
  file: string[];
}

export function UploadFileCommand({ initialProjectId = '' }: { initialProjectId?: string }) {
  const client = useCrowdinClient();
  const { data: projects, isLoading } = useProjects();

  const { handleSubmit, itemProps } = useForm<UploadFormValues>({
    async onSubmit(values) {
      const toast = await showToast({ style: Toast.Style.Animated, title: 'Uploading files...' });
      try {
        const projectId = parseInt(values.projectId);
        for (const filePath of values.file) {
          const fileBuffer = await fs.readFile(filePath);
          const storageResponse = await client.uploadStorageApi.addStorage(path.basename(filePath), fileBuffer);
          await client.sourceFilesApi.createFile(projectId, {
            storageId: storageResponse.data.id,
            name: path.basename(filePath),
          });
        }
        toast.style = Toast.Style.Success;
        toast.title = 'File(s) uploaded successfully';
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = 'Failed to upload file(s)';
        toast.message = error instanceof Error ? error.message : 'Unknown error';
      }
    },
    initialValues: { projectId: initialProjectId, file: [] },
    validation: {
      projectId: FormValidation.Required,
      file: (value) => {
        if (!value || value.length === 0) return 'Please select at least one file';
      },
    },
  });

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Upload File(s)" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown {...itemProps.projectId} title="Project" storeValue>
        <Form.Dropdown.Item value="" title="Select project" />
        {(projects ?? []).map((project) => (
          <Form.Dropdown.Item key={project.data.id} value={project.data.id.toString()} title={project.data.name} />
        ))}
      </Form.Dropdown>
      <Form.FilePicker {...itemProps.file} title="File(s)" allowMultipleSelection canChooseDirectories={false} />
    </Form>
  );
}

export default withAccessToken(oauth)(UploadFileCommand);
