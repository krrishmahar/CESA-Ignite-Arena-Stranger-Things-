import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StrangerHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const strangerChars = useRef<HTMLSpanElement[]>([]);
  const thingsChars = useRef<HTMLSpanElement[]>([]);

  const textTop = "STRANGER";
  const textBottom = "THINGS";

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=2000", // Optimized duration as requested
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      },
    });

    // 1. Background Animation
    tl.to(bgRef.current, {
      scale: 1.5,
      opacity: 0,
      ease: "power1.in",
      duration: 1
    }, 0);

    // 2. Zoom Effect
    tl.to(wrapperRef.current, {
      scale: 5,
      opacity: 0,
      ease: "power2.inOut",
      duration: 1
    }, 0);

    // 3. Bar Effect
    tl.to(barRef.current, {
      scaleX: 5,
      opacity: 0,
      ease: "power2.in",
      duration: 0.8
    }, 0);

    // 4. Letter Physics (Top)
    tl.to(strangerChars.current, {
      y: "-100vh",
      x: (i) => {
        const center = (textTop.length - 1) / 2;
        return (i - center) * 350;
      },
      scale: 10,
      rotate: (i) => (i - 3.5) * 15,
      ease: "power2.inOut",
      duration: 1
    }, 0);

    // 5. Letter Physics (Bottom)
    tl.to(thingsChars.current, {
      y: "100vh",
      x: (i) => {
        const center = (textBottom.length - 1) / 2;
        return (i - center) * 350;
      },
      scale: 10,
      rotate: (i) => (i - 2.5) * -15,
      ease: "power2.inOut",
      duration: 1
    }, 0);

  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black flex items-center justify-center perspective-[1000px]"
      style={{ height: '100vh' }}
    >
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=2560&auto=format&fit=crop"
          alt="Forest"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_85%)]" />
      </div>

      {/* Wrapper */}
      <div ref={wrapperRef} className="relative z-20 flex flex-col items-center justify-center will-change-transform">

        {/* STRANGER */}
        <h1 className="flex justify-center overflow-visible">
          {textTop.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => { if (el) strangerChars.current[i] = el; }}
              className="font-st st-glow font-black select-none leading-none inline-block origin-center will-change-transform"
              style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Bar */}
        <div ref={barRef} className="st-bar-glow w-[100%] h-[3px] md:h-[5px] my-4 md:my-8 rounded-full" />

        {/* THINGS */}
        <h1 className="flex justify-center overflow-visible">
          {textBottom.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => { if (el) thingsChars.current[i] = el; }}
              className="font-st st-glow font-black select-none leading-none inline-block origin-center will-change-transform"
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