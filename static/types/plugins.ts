export type PluginConfig = {
  plugins: Plugin[];
};

export interface Plugin {
  uses: Uses[];
}

export interface Uses {
  plugin: string;
  with: Record<string, unknown>;
}

export interface ManifestPreDecode extends Manifest {
  actionUrl?: string;
  workerUrl?: string;
  error?: string;
  repoName?: string;
}

export type ManifestCache = Record<string, ManifestPreDecode>;

export type Manifest = {
  name: string;
  description: string;
  "ubiquity:listeners": string[];
  commands?: {
    [key: string]: {
      example: string;
      description: string;
    };
  };
  configuration: {
    type: string;
    default: Record<string, string | number | boolean>;
    items?: {
      type: string;
    };
    properties?: Record<string, Manifest["configuration"]>;
    required?: string[];
  };
  readme?: string;
};
