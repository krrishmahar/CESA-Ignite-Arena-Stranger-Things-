import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function StrangerHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const strangerChars = useRef<HTMLSpanElement[]>([]);
  const thingsChars = useRef<HTMLSpanElement[]>([]);

  // Text Updated
  const textTop = "STRANGER";
  const textBottom = "TECH"; // User updated text

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=2500", // Thoda jaldi khatam kiya taaki bore na ho
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    // 1. Background Animation
    tl.to(bgRef.current, { scale: 1.5, opacity: 0, ease: "power1.in", duration: 1 }, 0);

    // 2. Main Wrapper Zoom
    tl.to(wrapperRef.current, { scale: 15, opacity: 0, ease: "power2.inOut", duration: 1 }, 0);

    // 3. BAR Logic
    tl.to(barRef.current, { scaleX: 5, opacity: 0, ease: "power2.in", duration: 0.8 }, 0);

    // 4. Letter Physics (STRANGER)
    tl.to(strangerChars.current, {
      y: "-120vh", // Thoda aur upar bheja
      x: (i) => {
        const center = (textTop.length - 1) / 2;
        return (i - center) * 400; // Separation badhaya
      },
      scale: 8, 
      rotate: (i) => (i - 3.5) * 15,
      ease: "power2.inOut",
      duration: 1
    }, 0);

    // 5. Letter Physics (TECH)
    tl.to(thingsChars.current, {
      y: "120vh", 
      x: (i) => {
        const center = (textBottom.length - 1) / 2;
        return (i - center) * 400;
      },
      scale: 8,
      rotate: (i) => (i - 1.5) * -15,
      ease: "power2.inOut",
      duration: 1
    }, 0);

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative w-full overflow-hidden bg-black flex items-center justify-center perspective-[1000px]"
      style={{ height: "100vh" }}
    >
      
      {/* BACKGROUND */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=2560&auto=format&fit=crop" 
          alt="Forest"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]" />
      </div>

      {/* CONTENT WRAPPER */}
      <div 
        ref={wrapperRef}
        className="relative z-20 flex flex-col items-center justify-center will-change-transform"
      >
        
        {/* TOP WORD: STRANGER */}
        <h1 className="flex justify-center overflow-visible">
          {textTop.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => { if (el) strangerChars.current[i] = el; }}
              // Added tracking-tighter to pull letters closer like the logo
              className="font-st st-glow font-black select-none leading-none inline-block origin-center will-change-transform tracking-tighter mx-[-2px]"
              style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* GLOWING BAR */}
        <div 
          ref={barRef}
          className="st-bar-glow w-[100%] h-[4px] md:h-[6px] my-4 rounded-full shadow-[0_0_20px_#ff1f1f]"
        />

        {/* BOTTOM WORD: TECH */}
        <h1 className="flex justify-center overflow-visible">
          {textBottom.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => { if (el) thingsChars.current[i] = el; }}
              className="font-st st-glow font-black select-none leading-none inline-block origin-center will-change-transform tracking-tighter mx-[-2px]"
              style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
            >
              {char}
            </span>
          ))}
        </h1>

      </div>
    </section>
  );
}