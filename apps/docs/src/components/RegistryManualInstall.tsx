import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from 'fumadocs-ui/components/codeblock';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

type RegistryItemName = 'button';

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
    <CodeBlockTabs defaultValue={files[0].name}>
      <CodeBlockTabsList>
        {files.map((file) => (
          <CodeBlockTabsTrigger key={file.name} value={file.name}>
            {file.name}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {files.map((file) => (
        <CodeBlockTab key={file.name} value={file.name}>
          <DynamicCodeBlock
            code={file.code}
            codeblock={{
              allowCopy: true,
              title: `components/ui/${file.name}`,
            }}
            lang={file.name.endsWith('.tsx') ? 'tsx' : 'ts'}
          />
        </CodeBlockTab>
      ))}
    </CodeBlockTabs>
  );
}
