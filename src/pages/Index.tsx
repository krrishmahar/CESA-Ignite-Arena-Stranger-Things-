import { useLayoutEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StrangerHero from '../components/StrangerHero';
import HomePage from '../components/HomePage'; 

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  
  // Reload fix: Always scroll to top
  useLayoutEffect(() => {
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }, []);

  return (
    <ReactLenis root>
      <main className="w-full bg-black min-h-screen">
        
        {/* SECTION 1: HERO (Pinned Animation) */}
        <StrangerHero />

        {/* SECTION 2: NEW HOME PAGE WITH TABS */}
        {/* Scroll khatam hote hi ye upar aayega */}
        <div className="relative w-full z-10 bg-black">
           <HomePage />
        </div>

      </main>
    </ReactLenis>
  );
};

export default Index;