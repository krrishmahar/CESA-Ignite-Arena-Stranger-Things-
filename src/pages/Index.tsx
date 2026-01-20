import { useLayoutEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StrangerHero from '../components/StrangerHero';
import { CompetitionLayout } from '../components/competition/CompetitionLayout';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {

  // Reload fix: Always scroll to top and force manual restoration
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ReactLenis root>
      <main className="w-full bg-black min-h-screen relative">

        {/* SECTION 1: HERO */}
        {/* Pinned via GSAP. Explicit height set in component. */}
        <StrangerHero />

        {/* SECTION 2: CONTENT */}
        {/* Block Layout: Sits after the hero (due to pinSpacing) but with higher z-index to cover if needed */}
        <div className="relative w-full z-10 bg-black">
          <CompetitionLayout />
        </div>

      </main>
    </ReactLenis>
  );
};

export default Index;