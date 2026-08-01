import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const sans = Geist({
  subsets: ['latin'],
  variable: '--font-showcase-sans',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-showcase-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'React Native Showcase',
    template: '%s — React Native Showcase',
  },
  description:
    'Copyable React Native components, interactions, and visual showcases.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
