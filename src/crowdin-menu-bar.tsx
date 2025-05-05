import { LaunchType, MenuBarExtra, launchCommand } from "@raycast/api";

export default function Command() {
  return (
    <MenuBarExtra icon="logo.png" tooltip="Crowdin">
      <MenuBarExtra.Item
        title="List Projects"
        onAction={() => launchCommand({ name: "projects", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item
        title="Upload File"
        onAction={() => launchCommand({ name: "upload-file", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item
        title="Build Project Translation"
        onAction={() => launchCommand({ name: "build-project-translation", type: LaunchType.UserInitiated })}
      />
    </MenuBarExtra>
  );
} 