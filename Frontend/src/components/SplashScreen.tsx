import { useEffect } from "react";
import { motion, useAnimationControls, AnimatePresence } from "framer-motion";

/* ── Ripple ring ─────────────────────────────────────── */
const RippleRing = ({ delay = 0 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: 170,
      height: 170,
      border: "1px solid rgba(34,197,94,0.30)",
    }}
    initial={{ scale: 0.55, opacity: 0.7 }}
    animate={{ scale: 2.3, opacity: 0 }}
    transition={{
      duration: 2.6,
      ease: "easeOut",
      delay,
      repeat: Infinity,
      repeatDelay: 0,
    }}
  />
);

/* ── Floating leaf ───────────────────────────────────── */
const Leaf = ({
  style,
  delay = 0,
  dur = 3.5,
}: {
  style: React.CSSProperties;
  delay?: number;
  dur?: number;
}) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      width: 7,
      height: 12,
      borderRadius: "50% 50% 50% 10% / 60% 60% 40% 40%",
      background:
        "linear-gradient(135deg, rgba(34,197,94,0.5), rgba(22,163,74,0.18))",
      ...style,
    }}
    initial={{ opacity: 0, y: 0 }}
    animate={{
      opacity: [0, 0.7, 0.45, 0.7, 0],
      y: [0, -26, -13, -26, 0],
      rotate: [0, 16, 0, -10, 0],
    }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* ── Letter-by-letter reveal ─────────────────────────── */
const SplitReveal = ({
  text,
  className,
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) => (
  <span className={className} aria-label={text}>
    {text.split("").map((ch, i) => (
      <motion.span
        key={i}
        style={{ display: "inline-block", whiteSpace: "pre" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: delay + i * stagger,
          duration: 0.42,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {ch}
      </motion.span>
    ))}
  </span>
);

/* ── Main splash ─────────────────────────────────────── */
const SplashScreen = () => {
  const logoControls = useAnimationControls();

  useEffect(() => {
    const run = async () => {
      await logoControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
      });
      await logoControls.start({
        scale: [1, 1.08, 0.97, 1.03, 1],
        transition: { duration: 0.65, ease: "easeInOut" },
      });
    };
    run();
  }, [logoControls]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.65, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(175deg, #0a1a0a 0%, #0f2010 40%, #091508 100%)",
      }}
    >
      {/* Dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Top glow bloom */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(34,197,94,0.28) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Bottom glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 200,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(22,163,74,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Corner arcs */}
      {[
        { size: 180, pos: "-top-14 -left-14", delay: 0 },
        { size: 120, pos: "-top-8 -left-8", delay: 0.1 },
        { size: 150, pos: "-bottom-11 -right-11", delay: 0.15 },
      ].map(({ size, pos, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full pointer-events-none ${pos}`}
          style={{
            width: size,
            height: size,
            border: "1px solid rgba(34,197,94,0.10)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay }}
        />
      ))}

      {/* Leaf particles */}
      {[
        { style: { top: "9%", left: "9%" }, delay: 0.3, dur: 3.3 },
        { style: { top: "13%", right: "8%" }, delay: 0.8, dur: 4.1 },
        { style: { top: "36%", left: "5%" }, delay: 1.2, dur: 3.7 },
        { style: { top: "54%", right: "5%" }, delay: 0.5, dur: 3.1 },
        { style: { top: "71%", left: "13%" }, delay: 0.9, dur: 4.3 },
        { style: { top: "77%", right: "11%" }, delay: 0.2, dur: 3.6 },
        { style: { top: "84%", left: "44%" }, delay: 1.5, dur: 3.9 },
      ].map((p, i) => (
        <Leaf key={i} {...p} />
      ))}

      {/* ── Logo + ripples ── */}
      <div className="relative flex items-center justify-center mb-7">
        <RippleRing delay={0} />
        <RippleRing delay={0.9} />
        <RippleRing delay={1.8} />

        <motion.div
          className="relative z-10"
          animate={logoControls}
          initial={{ opacity: 0, scale: 0.5 }}
        >
          {/* Pulsing border ring */}
          <motion.div
            className="absolute rounded-[26px] pointer-events-none"
            style={{ inset: -6, border: "1.5px solid rgba(34,197,94,0.4)" }}
            animate={{ opacity: [0.8, 0], scale: [1, 1.18] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            }}
          />

          <img
            src="/pwa-192x192.png"
            alt="Poshan Sathi Logo"
            className="w-32 h-32 rounded-[26px] block"
            style={{
              border: "2px solid rgba(34,197,94,0.35)",
              boxShadow:
                "0 0 40px rgba(34,197,94,0.25), 0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          />
        </motion.div>
      </div>

      {/* ── Text block ── */}
      <div className="relative z-10 text-center">
        {/* POSHAN — bright green */}
        <h1
          className="text-[52px] font-black leading-none tracking-tight"
          style={{
            color: "#4ade80",
            textShadow:
              "0 0 40px rgba(74,222,128,0.4), 0 2px 0 rgba(0,0,0,0.4)",
          }}
        >
          <SplitReveal text="POSHAN" delay={0.35} stagger={0.06} />
        </h1>

        {/* SATHI — white */}
        <h1
          className="text-[52px] font-black leading-none tracking-tight"
          style={{ color: "#ffffff", textShadow: "0 2px 0 rgba(0,0,0,0.35)" }}
        >
          <SplitReveal text="SATHI" delay={0.55} stagger={0.06} />
        </h1>

        {/* Divider */}
        <motion.div
          className="flex items-center justify-center gap-2 my-2"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
        >
          <div
            className="w-7 h-px rounded-full"
            style={{ background: "rgba(74,222,128,0.25)" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "rgba(74,222,128,0.5)" }}
          />
          <div
            className="w-7 h-px rounded-full"
            style={{ background: "rgba(74,222,128,0.25)" }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "rgba(255,255,255,0.38)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
        >
          Your Health. Your Budget.
        </motion.p>
      </div>

      {/* ── Progress bar ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: "rgba(255,255,255,0.06)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #16a34a, #4ade80)" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>

      {/* Footer */}
      <motion.p
        className="absolute bottom-[14px] text-[9.5px] font-bold uppercase tracking-[0.18em]"
        style={{ color: "rgba(255,255,255,0.22)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.5 }}
      >
        Powered by NutriHealth Initiative
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
