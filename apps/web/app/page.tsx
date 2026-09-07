import { Navigation, Footer, Hero } from '@starter/ui';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <Hero
          title="Next.js + WordPress Starter"
          subtitle="A production-ready monorepo with Docker, CI/CD, and headless WordPress. Clone it and ship."
          ctaLabel="View on GitHub"
          ctaHref="https://github.com/aras72h/nextjs-wordpress-starter"
          secondaryCtaLabel="Read the Blog"
          secondaryCtaHref="/blog"
        />
      </main>
      <Footer />
    </>
  );
}
