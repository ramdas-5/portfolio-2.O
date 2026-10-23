"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Keypad, SpeakerGrid, Trackpad } from "./macbook-scroll";

/**
 * Professional-Experience stage.
 *
 * The Macbook (same shell as macbook-scroll.tsx — dark lid, silver keyboard
 * deck with speakers/keypad/trackpad reused from that file) is FIXED: it
 * never animates. The lid is held at a permanent lean-back tilt (rotateX
 * about the hinge + perspective on the wrapper), so the screen reads as a
 * real open laptop instead of a flat monitor.
 *
 * Only the card moves:
 *   1. it starts EXACTLY on the screen — same box, same tilt (it is a child
 *      of the display, so it inherits the lid's angle and matches it 1:1),
 *   2. scrolling counter-rotates it by exactly the lid tilt (world-straight)
 *      while zooming it in (1 → 1.2× the screen),
 *   3. it holds there, upright and zoomed, floating in front of the laptop.
 *
 * Stage scale is computed from the viewport on mount/resize (cap 1.4×) with
 * headroom for the card's zoomed footprint, so neither the macbook nor the
 * card ever clips at any window size.
 */

// Fixed lid lean-back angle. The card counter-rotates by exactly this to
// become world-straight — change one, change the other.
const LID_TILT = 20;

// Unscaled geometry in px — keep in sync with the markup below:
// lid w-[40rem] h-[27rem] (640×432) + base h-[27.5rem] (440) → 640×872 total.
// The card's zoomed footprint: display 624px wide × 1.2 final scale = 749px;
// when upright its top edge overshoots the lid by ~58px (872 + 58 = 930).
const CARD_END_W = 749;
const MB_H_ZOOMED = 930;

const stageScaleFor = (width: number, height: number) =>
  Math.min(1.4, (width - 32) / CARD_END_W, (height - 40) / MB_H_ZOOMED);

export const MacbookExperience = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [stageScale, setStageScale] = useState(0.85);
  useEffect(() => {
    const compute = () =>
      setStageScale(stageScaleFor(window.innerWidth, window.innerHeight));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Start: scale 1, rotateX 0 → the card IS the tilted screen.
  // End: rotateX -LID_TILT cancels the lid tilt (world-upright) + zoom 1.2.
  const cardScale = useTransform(
    scrollYProgress,
    [0, 0.06, 0.68, 1],
    [1, 1, 1.2, 1.2],
  );
  const cardRotateX = useTransform(
    scrollYProgress,
    [0, 0.06, 0.68, 1],
    [0, 0, -LID_TILT, -LID_TILT],
  );

  return (
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          className="relative flex flex-col items-center [perspective:1200px]"
          style={{ transform: `scale(${stageScale})` }}
        >
          {/* Lid — horizontal 16:11 screen, FIXED at the lean-back tilt
              (transform-origin = bottom edge = the hinge) */}
          <div
            className="relative h-[27rem] w-[40rem] rounded-2xl bg-[#010101] p-2"
            style={{
              transform: `rotateX(${LID_TILT}deg)`,
              transformOrigin: "bottom",
            }}
          >
            <div
              style={{ boxShadow: "0px 2px 0px 2px #171717 inset" }}
              className="relative h-full w-full rounded-lg bg-[#272729] [perspective:900px]"
            >
              {/* Card layer — starts as the screen itself (same box, inherits
                  the lid tilt), straightens + zooms out of it on scroll */}
              <motion.div
                style={{
                  scale: cardScale,
                  rotateX: cardRotateX,
                }}
                className="absolute inset-0 z-20 origin-center overflow-hidden rounded-lg will-change-transform"
              >
                {children}
              </motion.div>
            </div>
          </div>
          {/* Base — macbook-scroll's keyboard deck, uniformly enlarged 1.25×
              (origin-top-left) so it stays proportional under the wider lid */}
          <div className="relative -z-10 h-[27.5rem] w-[40rem] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#272729]">
            <div className="absolute left-0 top-0 h-[22rem] w-[32rem] origin-top-left scale-[1.25]">
              {/* above keyboard bar */}
              <div className="relative h-10 w-full">
                <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
              </div>
              <div className="relative flex">
                <div className="mx-auto h-full w-[10%] overflow-hidden">
                  <SpeakerGrid />
                </div>
                <div className="mx-auto h-full w-[80%]">
                  <Keypad />
                </div>
                <div className="mx-auto h-full w-[10%] overflow-hidden">
                  <SpeakerGrid />
                </div>
              </div>
              <Trackpad />
              <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
