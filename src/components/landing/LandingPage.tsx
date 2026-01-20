import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Brain, GitBranch, Code2, Zap, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=2000",
        scrub: 1,
        pin: false,
      },
    });

    gsap.from(".story-text", {
      scrollTrigger: {
        trigger: ".story-section",
        start: "top center",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      y: 50,
      duration: 1
    });

    gsap.from(".round-card", {
      scrollTrigger: {
        trigger: ".rounds-section",
        start: "top center+=100",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      y: 100,
      stagger: 0.2,
      duration: 0.8
    });
  }, { scope: containerRef });

  const handleEnterLab = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setShowFullscreen(true);
        setTimeout(() => {
          navigate('/competition');
        }, 1000);
      }).catch(() => {
        navigate('/competition');
      });
    } else {
      navigate('/competition');
    }
  };

  const rounds = [
    {
      number: 'I',
      title: 'APTITUDE',
      subtitle: 'Logic & Reasoning',
      description: 'Solve critical scenarios under pressure. Power generators, signal frequencies, and system diagnostics await.',
      icon: Brain,
      color: 'from-red-600 to-red-800',
      glowColor: 'shadow-[0_0_40px_rgba(239,68,68,0.6)]'
    },
    {
      number: 'II',
      title: 'DESIGN',
      subtitle: 'Flowchart Engineering',
      description: 'Map the logic pathways. Design algorithmic solutions to contain the breach.',
      icon: GitBranch,
      color: 'from-orange-600 to-red-700',
      glowColor: 'shadow-[0_0_40px_rgba(249,115,22,0.6)]'
    },
    {
      number: 'III',
      title: 'CODING',
      subtitle: 'DSA Challenge',
      description: 'Implement your solution. Write code that seals the gate. Performance matters.',
      icon: Code2,
      color: 'from-red-700 to-red-900',
      glowColor: 'shadow-[0_0_40px_rgba(220,38,38,0.6)]'
    }
  ];

  return (
    <div ref={containerRef} className="relative bg-black min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_70%)]" />
      <div className="fixed inset-0 grid-bg opacity-20" />
      <div className="fixed inset-0 particles opacity-30" />

      {/* Fullscreen Transition Overlay */}
      {showFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <Shield className="w-20 h-20 mx-auto mb-4 text-primary animate-pulse" />
            <h2 className="font-display text-3xl gradient-text">INITIATING PROTOCOL...</h2>
          </motion.div>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative h-screen flex flex-col items-center justify-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center space-y-6 max-w-4xl"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(239, 68, 68, 0.3)',
                  '0 0 60px rgba(239, 68, 68, 0.6)',
                  '0 0 20px rgba(239, 68, 68, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 blur-2xl"
            />
            <h1 className="font-st st-glow relative z-10" style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}>
              THE GATEKEEPER'S
            </h1>
            <div className="st-bar-glow w-full h-[3px] my-4" />
            <h1 className="font-st st-glow relative z-10" style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}>
              PROTOCOL
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xl md:text-2xl text-red-200 font-light tracking-wide"
          >
            Protect the Hawkins Lab. Prove your logic. Seal the gate.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap gap-4 justify-center pt-8"
          >
            <Button
              onClick={handleEnterLab}
              size="lg"
              className="stranger-btn bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 py-6 text-lg font-display tracking-wider neon-border"
            >
              <Shield className="w-5 h-5 mr-2" />
              ENTER THE LAB
            </Button>
            <Button
              onClick={handleEnterLab}
              size="lg"
              variant="outline"
              className="stranger-btn border-2 border-red-600 text-red-500 hover:bg-red-600/10 px-8 py-6 text-lg font-display tracking-wider"
            >
              <Lock className="w-5 h-5 mr-2" />
              INITIATE PROTOCOL
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="pt-12"
          >
            <p className="text-sm text-muted-foreground animate-pulse">SCROLL TO LEARN MORE</p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-2"
            >
              <Zap className="w-6 h-6 mx-auto text-primary" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Story Section */}
      <section className="story-section relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl space-y-12">
          <div className="story-text space-y-6 glass-strong p-8 md:p-12 rounded-2xl neon-border">
            <div className="flex items-center gap-4 mb-6">
              <AlertTriangle className="w-8 h-8 text-primary animate-pulse" />
              <h2 className="font-display text-3xl md:text-4xl gradient-text">THE THREAT</h2>
            </div>

            <p className="text-lg leading-relaxed text-red-100">
              The gate to the <span className="text-primary font-bold">Upside Down</span> has been breached.
              Energy readings are critical. The dimensional barrier is collapsing.
            </p>

            <p className="text-lg leading-relaxed text-red-100">
              We need <span className="text-primary font-bold">problem solvers</span>. Engineers who can think under pressure.
              Coders who can implement solutions in minutes, not hours.
            </p>

            <div className="border-l-4 border-primary pl-6 my-8 bg-primary/5 py-4 rounded-r">
              <p className="text-xl font-display text-primary tracking-wide">
                "The gate won't hold much longer. We need the best minds. Now."
              </p>
              <p className="text-sm text-muted-foreground mt-2">— Dr. Martin Brenner, Hawkins Lab</p>
            </div>

            <p className="text-lg leading-relaxed text-red-100">
              You must pass through <span className="text-primary font-bold">three levels of assessment</span>.
              Only those who demonstrate exceptional logic, design thinking, and coding prowess can join the Gatekeeper team.
            </p>
          </div>
        </div>
      </section>

      {/* Rounds Section */}
      <section className="rounds-section relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl gradient-text mb-4">
              THE THREE TRIALS
            </h2>
            <p className="text-lg text-red-200">
              Each round brings you closer to sealing the gate
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {rounds.map((round, index) => (
              <motion.div
                key={round.number}
                className="round-card group"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className={`relative glass-strong rounded-2xl p-8 h-full border-2 border-transparent hover:border-primary/50 transition-all duration-500 ${round.glowColor} hover:scale-105`}>
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${round.color} rounded-t-2xl`} />

                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${round.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <round.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="font-display text-5xl text-primary/30 group-hover:text-primary transition-colors">
                      {round.number}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl mb-2 gradient-text group-hover:text-glow-primary transition-all">
                    ROUND {round.number}: {round.title}
                  </h3>

                  <p className="text-sm text-primary/80 mb-4 font-semibold">
                    {round.subtitle}
                  </p>

                  <p className="text-sm text-red-200/80 leading-relaxed">
                    {round.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-primary/20">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>MISSION CRITICAL</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button
              onClick={handleEnterLab}
              size="lg"
              className="stranger-btn bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-12 py-6 text-xl font-display tracking-wider neon-border glow-primary"
            >
              <Shield className="w-6 h-6 mr-2" />
              BEGIN ASSESSMENT
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer Warning */}
      <section className="relative py-12 px-4 border-t border-primary/20">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-6 border border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-display text-lg text-destructive mb-2">SECURITY PROTOCOL ACTIVE</h4>
                <p className="text-sm text-red-200/70 leading-relaxed">
                  Full-screen mode required. Tab switching monitored. Copy/paste disabled.
                  Any breach of protocol will result in immediate disqualification.
                  The integrity of Hawkins Lab depends on your compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
