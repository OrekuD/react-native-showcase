'use client';

import { useState } from 'react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

type ExpandableCodeBlockProps = {
  code: string;
  lang: string;
  title: string;
};

export function ExpandableCodeBlock({
  code,
  lang,
  title,
}: ExpandableCodeBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const fileType = lang === 'tsx' ? 'TSX' : 'TS';

  return (
    <div
      className="showcase-expandable-code"
      data-expanded={expanded ? 'true' : 'false'}
    >
      <DynamicCodeBlock
        code={code}
        codeblock={{
          allowCopy: true,
          className: 'showcase-copy-code',
          icon: <span className="showcase-code-file-icon">{fileType}</span>,
          title,
          viewportProps: {
            className: 'showcase-copy-code-viewport',
          },
        }}
        lang={lang}
      />
      <button
        aria-expanded={expanded}
        className="showcase-code-expand-button"
        onClick={() => setExpanded((value) => !value)}
        type="button"
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  );
}
