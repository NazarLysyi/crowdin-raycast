import { Action, ActionPanel, Form, showToast, Toast } from '@raycast/api';
import { withAccessToken, getAccessToken } from '@raycast/utils';
import crowdin from '@crowdin/crowdin-api-client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';

import { oauth } from './services/crowdin';
import { FormValues, Project } from './types';

function Command({ initialProjectId = '' }: { initialProjectId?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formValues, setFormValues] = useState<FormValues>({ projectId: initialProjectId, file: [] });

  const { token } = getAccessToken();
  const { domain } = jwt.decode(token) as JwtPayload;

  useEffect(() => {
    if (
      initialProjectId &&
      projects.some((p) => p.data.id.toString() === initialProjectId)
    ) {
      setFormValues((prev) => ({ ...prev, projectId: initialProjectId }));
    }
  }, [initialProjectId, projects]);

  const fetchProjects = async () => {
    try {
      const { projectsGroupsApi } = new crowdin({
        token,
        organization: domain,
      });
      const response = await projectsGroupsApi.withFetchAll().listProjects();
      setProjects(response.data);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (values: FormValues) => {
    if (!values.projectId) {
      showToast({
        style: Toast.Style.Failure,
        title: 'No project selected',
        message: 'Please select a project to upload files to.',
      });
      return;
    }
    if (!values.file || values.file.length === 0) {
      showToast({
        style: Toast.Style.Failure,
        title: 'No file selected',
        message: 'Please select at least one file to upload',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { uploadStorageApi, sourceFilesApi } = new crowdin({
        token,
        organization: domain,
      });
      const projectId = parseInt(values.projectId);

      for (const filePath of values.file) {
        const fileBuffer = fs.readFileSync(filePath);
        const storageResponse = await uploadStorageApi.addStorage(path.basename(filePath), fileBuffer);
        await sourceFilesApi.createFile(projectId, {
          storageId: storageResponse.data.id,
          name: path.basename(filePath),
        });
      }

      showToast({
        style: Toast.Style.Success,
        title: 'File(s) uploaded successfully',
      });
      // Clear form after upload
      setFormValues({ projectId: '', file: [] });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Failed to upload file(s)',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title='Upload File(s)' onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id='projectId'
        title='Project'
        storeValue
        value={
          projects.some((p) => p.data.id.toString() === formValues.projectId)
            ? formValues.projectId
            : ''
        }
        onChange={(value) => setFormValues((prev) => ({ ...prev, projectId: value }))}
      >
        <Form.Dropdown.Item value='' title='Select project' />
        {projects.map((project) => (
          <Form.Dropdown.Item
            key={project.data.id}
            value={project.data.id.toString()}
            title={project.data.name}
          />
        ))}
      </Form.Dropdown>
      <Form.FilePicker
        id='file'
        title='File(s)'
        allowMultipleSelection={true}
        canChooseDirectories={false}
        value={formValues.file}
        onChange={(files) => setFormValues((prev) => ({ ...prev, file: files }))}
      />
    </Form>
  );
}

const WrappedUploadFileCommand = withAccessToken(oauth)(Command);
export default WrappedUploadFileCommand;
export { WrappedUploadFileCommand as UploadFileCommand };
