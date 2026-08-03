import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from 'fumadocs-ui/components/codeblock';
import { ExpandableCodeBlock } from './ExpandableCodeBlock';

type RegistryItemName =
  | 'button'
  | 'confirmation-dialog'
  | 'input'
  | 'menu'
  | 'otp-input';

type RegistryManifest = {
  files: Array<{
    source: string;
    target: string;
  }>;
};

const registryDirectory = resolve(
  process.cwd(),
  '../../packages/registry/items',
);

function readRegistryFiles(name: RegistryItemName) {
  const manifestPath = join(registryDirectory, name, 'registry.json');
  const manifest = JSON.parse(
    readFileSync(manifestPath, 'utf8'),
  ) as RegistryManifest;

  return manifest.files.map((file) => ({
    code: readFileSync(resolve(dirname(manifestPath), file.source), 'utf8'),
    name: file.target,
  }));
}

export function RegistryManualInstall({ name }: { name: RegistryItemName }) {
  const files = readRegistryFiles(name);

  return (
    <CodeBlockTabs
      className="showcase-registry-tabs"
      defaultValue={files[0].name}
    >
      <CodeBlockTabsList className="showcase-registry-tabs-list">
        {files.map((file) => (
          <CodeBlockTabsTrigger key={file.name} value={file.name}>
            {file.name}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {files.map((file) => (
        <CodeBlockTab key={file.name} value={file.name}>
          <ExpandableCodeBlock
            code={file.code}
            lang={file.name.endsWith('.tsx') ? 'tsx' : 'ts'}
            title={`components/ui/${file.name}`}
          />
        </CodeBlockTab>
      ))}
    </CodeBlockTabs>
  );
}
