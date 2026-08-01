import Image from 'next/image';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="showcase-brand">
          <Image
            alt=""
            aria-hidden
            className="showcase-brand-mark"
            height={25}
            src="/brand/react-native-showcase-logo.png"
            width={25}
          />
          <span>{appName}</span>
          <span className="showcase-brand-label">Docs</span>
        </span>
      ),
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
      },
      {
        text: 'Components',
        url: '/docs/components',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
