import { Module, ModuleGroup, CrowdinUrlParams, EnterpriseUrlParams } from '../types/application';

const projectModules: Module[] = [
  {
    id: 'project-tools',
    hasUI: true,
    crowdinUrl: (params: CrowdinUrlParams): string => {
      return `https://crowdin.com/u/projects/${params.projectId}/tools/app/${params.appIdentifier}`;
    },
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/projects/${params.projectId}/tools/app/${params.appIdentifier}`;
    }
  },
  {
    id: 'project-integrations',
    hasUI: true,
    crowdinUrl: (params: CrowdinUrlParams): string => {
      return `https://crowdin.com/u/projects/${params.projectId}/tools/app/${params.appIdentifier}`;
    },
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/projects/${params.projectId}/integrations/custom/${params.appIdentifier}`;
    }
  },
  {
    id: 'project-reports',
    hasUI: true,
    crowdinUrl: (params: CrowdinUrlParams): string => {
      return `https://crowdin.com/u/projects/${params.projectId}/tools/app/${params.appIdentifier}`;
    },
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/projects/${params.projectId}/reports/app/${params.appIdentifier}`;
    }
  },
  {
    id: 'project-menu',
    hasUI: true,
    crowdinUrl: (params: CrowdinUrlParams): string => {
      return `https://crowdin.com/u/projects/${params.projectId}/tools/app/${params.appIdentifier}`;
    },
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/projects/${params.projectId}/extensions/${params.appIdentifier}`;
    }
  },
  {
    id: 'project-menu-crowdsource',
    hasUI: true,
  },
];

const editorModules: Module[] = [
  {
    id: 'editor-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/editor/extensions/${params.appIdentifier}`;
    }
  },
  {
    id: 'editor-menu-crowdsource',
    hasUI: true,
  },
];

const organizationModules: Module[] = [
  {
    id: 'organization-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/extensions/${params.appIdentifier}¦${params.moduleKey}`;
    }
  },
  {
    id: 'organization-menu-crowdsource',
    hasUI: true,
  },
  {
    id: 'organization-settings-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/system-settings/${params.appIdentifier}`;
    }
  },
];

const profileModules: Module[] = [
  {
    id: 'profile-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/profile/extensions/${params.appIdentifier}`;
    }
  },
  {
    id: 'profile-menu-crowdsource',
    hasUI: true,
  },
];

const mtModules: Module[] = [
  {
    id: 'mt-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/mt/extensions/${params.appIdentifier}`;
    }
  },
  {
    id: 'mt-menu-crowdsource',
    hasUI: true,
  },
];

const aiModules: Module[] = [
  {
    id: 'ai-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/ai/extensions/${params.appIdentifier}`;
    }
  },
  {
    id: 'ai-menu-crowdsource',
    hasUI: true,
  },
];

const uiModules: Module[] = [
  {
    id: 'ui-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/ui/extensions/${params.appIdentifier}`;
    }
  },
  {
    id: 'ui-menu-crowdsource',
    hasUI: true,
  },
];

const fileProcessingModules: Module[] = [
  {
    id: 'file-processing-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/file-processing/extensions/${params.appIdentifier}`;
    }
  },
  {
    id: 'file-processing-menu-crowdsource',
    hasUI: true,
  },
];

const otherNonUI: Module[] = [
  { id: 'ai-request-pre-compile', hasUI: false },
  { id: 'ai-request-post-compile', hasUI: false },
  { id: 'ai-request-pre-parse', hasUI: false },
  { id: 'ai-request-post-parse', hasUI: false },
  { id: 'api', hasUI: false },
  { id: 'webhook', hasUI: false },
];

const otherMayHaveUI: Module[] = [
  {
    id: 'custom-spellchecker',
    mayHaveUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/system-settings/spellcheckers`;
    }
  },
  {
    id: 'external-qa-check',
    mayHaveUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/system-settings/custom-qa-checks`;
    }
  },
  { id: 'workflow-step-type', mayHaveUI: true },
];

const otherModules: Module[] = [
  {
    id: 'other-menu',
    hasUI: true,
    enterpriseUrl: (params: EnterpriseUrlParams): string => {
      return `https://${params.domain}.crowdin.com/u/other/extensions/${params.appIdentifier}`;
    }
  },
  {
    id: 'other-menu-crowdsource',
    hasUI: true,
  },
];

export const getModulesWithUI = (): Module[] => {
  return [
    ...projectModules,
    ...editorModules,
    ...organizationModules,
    ...profileModules,
    ...aiModules,
    ...uiModules,
  ].filter(module => module.hasUI);
};

export const getModulesWithoutUI = (): Module[] => {
  return [
    ...mtModules,
    ...fileProcessingModules,
    ...otherNonUI,
  ].filter(module => !module.hasUI);
};

export const getModulesThatMayHaveUI = (): Module[] => {
  return otherMayHaveUI.filter(module => module.mayHaveUI);
};

export const moduleGroups: ModuleGroup[] = [
  { type: 'project', modules: projectModules },
  { type: 'editor', modules: editorModules },
  { type: 'organization', modules: organizationModules },
  { type: 'profile', modules: profileModules },
  { type: 'mt', modules: mtModules },
  { type: 'ai', modules: aiModules },
  { type: 'ui', modules: uiModules },
  { type: 'fileProcessing', modules: fileProcessingModules },
  { type: 'other', modules: otherModules },
];

export function getDefaultApplicationUrl(domain: string, appIdentifier: string): string {
  return `https://${domain}.crowdin.com/u/extensions/${appIdentifier}`;
}