import { ApplicationsModel } from '@crowdin/crowdin-api-client';

export interface CrowdinUrlParams {
  appIdentifier: string;
  projectId?: number;
  moduleKey?: string;
}

export interface EnterpriseUrlParams extends CrowdinUrlParams {
  domain: string;
}

export interface Module {
  id: string;
  hasUI?: boolean;
  mayHaveUI?: boolean;
  crowdinUrl?: (params: CrowdinUrlParams) => string;
  enterpriseUrl?: (params: EnterpriseUrlParams) => string;
}

export type ModuleType = 'project' | 'editor' | 'organization' | 'profile' | 'mt' | 'ai' | 'ui' | 'fileProcessing' | 'other';

export interface ModuleGroup {
  type: ModuleType;
  modules: Module[];
}

export interface ApplicationModule {
  module: Module;
  type: string;
  key: string;
}

export type AppModule = ApplicationsModel.ApplicationModule;

export interface ModuleActionsProps {
  modules: ApplicationModule[];
  domain: string;
  appIdentifier: string;
  projects?: Project[];
}

export interface Project {
  data: {
    id: number;
    name: string;
  };
} 