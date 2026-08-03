import Link from 'next/link';

const sections = [
  {
    index: '01',
    title: 'Components',
    description: 'Small, reusable interface foundations.',
    count: '10',
    href: '/docs/components',
  },
  {
    index: '02',
    title: 'Interactions',
    description: 'Focused motion patterns with real behavior.',
    count: '01',
    href: '/docs/interactions',
  },
  {
    index: '03',
    title: 'Recipes',
    description: 'Larger copyable examples that combine the pieces.',
    count: '00',
    href: '/docs/recipes',
  },
] as const;

export default function HomePage() {
  return (
    <main className="showcase-landing">
      <section className="showcase-hero">
        <div className="showcase-hero-copy">
          <p className="showcase-kicker">
            <span>React Native</span>
            Source-first motion library
          </p>
          <h1>
            Native motion,
            <br />
            <em>ready to borrow.</em>
          </h1>
          <p className="showcase-hero-description">
            A growing collection of components, interactions, and visual
            experiments. Copy the source, study the details, and make each piece
            your own.
          </p>
          <div className="showcase-hero-actions">
            <Link className="showcase-primary-link" href="/docs">
              Browse the library
              <span aria-hidden>↗</span>
            </Link>
            <Link
              className="showcase-secondary-link"
              href="https://github.com/OrekuD/react-native-showcase"
            >
              View on GitHub
            </Link>
          </div>
        </div>

        <div className="showcase-index" aria-label="Library index">
          <div className="showcase-index-heading">
            <span>Library index</span>
            <span>v0.1</span>
          </div>
          {sections.map((section) => (
            <Link className="showcase-index-row" href={section.href} key={section.title}>
              <span className="showcase-index-number">{section.index}</span>
              <span className="showcase-index-copy">
                <strong>{section.title}</strong>
                <small>{section.description}</small>
              </span>
              <span className="showcase-index-count">{section.count}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="showcase-principles" aria-label="Library principles">
        <article>
          <span>01 / Own the source</span>
          <h2>Copy it. Change it.</h2>
          <p>No black box between your product and its motion.</p>
        </article>
        <article>
          <span>02 / Learn by taking apart</span>
          <h2>Built to be studied.</h2>
          <p>Each entry explains its dependencies and moving pieces.</p>
        </article>
        <article>
          <span>03 / Native by default</span>
          <h2>Made for React Native.</h2>
          <p>Platform-aware details without disguising the implementation.</p>
        </article>
      </section>
    </main>
  );
}
