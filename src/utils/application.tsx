import { Action, ActionPanel } from '@raycast/api';
import { moduleGroups, getDefaultApplicationUrl } from './modules';
import { Module } from '../types/application';
import { ApplicationModule, AppModule, ModuleActionsProps } from '../types/application';
import React from 'react';

export function getApplicationModules(appModules: AppModule[]): ApplicationModule[] {
  const modules: ApplicationModule[] = [];
  
  for (const group of moduleGroups) {
    const matchingModules = group.modules.filter(m => 
      appModules.some(appModule => appModule.type === m.id)
    );
    modules.push(...matchingModules.map(module => {
      const appModule = appModules.find(appModule => appModule.type === module.id);
      return { 
        module, 
        type: group.type,
        key: appModule?.key || module.id 
      };
    }));
  }
  
  return modules;
}

export function getUIEnabledModules(modules: ApplicationModule[]): ApplicationModule[] {
  return modules.filter(({ module }) => module.hasUI || module.mayHaveUI);
}

export function requiresProjectId(module: Module): boolean {
  return module.crowdinUrl !== undefined || 
         (module.enterpriseUrl !== undefined && module.enterpriseUrl.toString().includes('projectId'));
}

export function getModuleUrl(module: Module, domain: string, appIdentifier: string, projectId?: number): string {
  if (module.enterpriseUrl) {
    return module.enterpriseUrl({ domain, appIdentifier, projectId });
  }
  if (module.crowdinUrl) {
    return module.crowdinUrl({ appIdentifier, projectId });
  }
  return getDefaultApplicationUrl(domain, appIdentifier);
}

export function createModuleActions({
  modules,
  domain,
  appIdentifier,
  projects
}: ModuleActionsProps): React.ReactElement | undefined {
  const uiModules = getUIEnabledModules(modules);
  
  if (uiModules.length === 0) {
    return undefined;
  }

  if (uiModules.length === 1) {
    const module = uiModules[0].module;
    const key = uiModules[0].key;

    if (requiresProjectId(module) && projects) {
      return (
        <ActionPanel>
          {projects.map(project => {
            const url = domain && module.enterpriseUrl 
              ? module.enterpriseUrl({ domain, appIdentifier, projectId: project.data.id, moduleKey: key })
              : module.crowdinUrl 
                ? module.crowdinUrl({ appIdentifier, projectId: project.data.id })
                : null;
            
            if (!url) return null;

            return (
              <Action.OpenInBrowser
                key={project.data.id}
                title={`Open in ${project.data.name}`}
                url={url}
              />
            );
          })}
        </ActionPanel>
      );
    }

    const url = domain && module.enterpriseUrl 
      ? module.enterpriseUrl({ domain, appIdentifier, moduleKey: key })
      : module.crowdinUrl 
        ? module.crowdinUrl({ appIdentifier })
        : null;

    if (!url) return undefined;

    return (
      <ActionPanel>
        <Action.OpenInBrowser
          title={`Open ${uiModules[0].type} Module`}
          url={url}
        />
      </ActionPanel>
    );
  }

  return (
    <ActionPanel>
      {uiModules.map(({ module, type, key }) => {
        const url = domain && module.enterpriseUrl 
          ? module.enterpriseUrl({ domain, appIdentifier, moduleKey: key })
          : module.crowdinUrl 
            ? module.crowdinUrl({ appIdentifier })
            : null;
        
        if (!url) return null;

        return (
          <Action.OpenInBrowser
            key={type}
            title={`Open ${type} Module`}
            url={url}
          />
        );
      })}
    </ActionPanel>
  );
} 