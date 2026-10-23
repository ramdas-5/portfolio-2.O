"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Keypad, SpeakerGrid, Trackpad } from "./macbook-scroll";

/**
 * Professional-Experience stage.
 *
 * The Macbook is a TRUE-3D construction seen FROM ABOVE (camera ~70°, real
 * top view: deck nearly faces the viewer, screen at the far edge tilted
 * away), normally open (deck↔lid = 110°).
 *
 * Scroll timeline (section progress 0..1):
 *   1. 0 → 0.06    hold — the card sits ON the screen: same box, posed by
 *                  the same projection math as the display, so it matches
 *                  the tilted screen 1:1. The macbook does NOT move yet.
 *   2. 0.06 → 0.68 ONE shared window: the card rotates from the screen's
 *                  tilt (GROUP_TILT + LID_TILT) to world-straight while
 *                  zooming 1 → 1.25×, AND the Macbook rises up and out of
 *                  the viewport at the same time — its scroll stops
 *                  (fully gone) exactly when the card becomes straight,
 *   3. 0.68 → 1    hold — the card alone: straight forward, zoomed in,
 *                  until the sticky releases and the page continues.
 *
 * 3D structure (all rotations share the X axis):
 *   outer [perspective:PERSP] + 2D fit transform
 *     ├ exit layer  translateY(exitY) + preserve-3d   ← the laptop's rise
 *     │   └ group   rotateX(GROUP_TILT) + preserve-3d (camera pitch, fixed)
 *     │       ├ lid    rotateX(+LID_TILT) about the hinge + preserve-3d
 *     │       │   └ display (screen bg only — no card inside)
 *     │       └ base   rotateX(+90°) about its top edge (= the hinge):
 *     │                the keyboard deck lies flat toward the viewer
 *     └ card layer  absolute at the display center's projected position,
 *                    translateZ + rotateX + scale — its OWN direct child of
 *                    the perspective wrapper, so nothing flattens it (a
 *                    card nested inside the display would end up squashed)
 *                    and nothing occludes it (separate subtree, later in
 *                    DOM = painted on top).
 *
 * CENTER_OFFSET / CONTENT_* come from the projection model below (verified
 * against a standalone script) — change an angle or a size and the fit
 * re-derives itself.
 */

// --- geometry (px) — keep in sync with the markup below -------------------
const BOX_W = 640; // w-[40rem]
const LID_H = 432; // h-[27rem]
const BASE_H = 440; // h-[27.5rem]
const DOC_H = LID_H + BASE_H; // 872 — the macbook layout box height
const HINGE = LID_H; // doc y where lid meets base
const PAD = 8; // lid p-2
const DISPLAY_W = BOX_W - PAD * 2; // 624
const DISPLAY_H = LID_H - PAD * 2; // 416
const DISPLAY_CY = PAD + DISPLAY_H / 2; // 216 — display center, doc y

// --- 3D constants ---------------------------------------------------------
const LID_TILT = 20; // lid lean-back from vertical (110° deck↔lid = normally open)
const GROUP_TILT = -70; // camera-above pitch; negative = deck's top surface faces us
const PERSP = 3000; // perspective (outer + card layer share this value)
const CARD_END_SCALE = 1.25; // card zoom
// Card orientation: starts matching the screen (GROUP+LID), ends world-straight.
const CARD_THETA_START = GROUP_TILT + LID_TILT; // -50°
const CARD_THETA_END = 0;

// --- scroll phases (section progress 0..1) --------------------------------
// The card's tilt-to-straight and the laptop's rise share ONE window, so
// the macbook scrolls exactly while the card tilts, and its scroll STOPS
// (fully gone) the moment the card reaches the straight position. Before
// the window opens, nothing moves — the entry pose is static.
const MOTION_START = 0.06;
const MOTION_END = 0.68; // card straight + zoomed = laptop gone, same tick
// Pre-projection px the laptop rises. The deck's front edge is its lowest
// point; clearing it past the viewport top needs ~1340px at the smallest
// stage scale (320px phone) — 1400 leaves margin everywhere.
const EXIT_UP = -1400;

// --- projection model -----------------------------------------------------
const cosd = (d: number) => Math.cos((d * Math.PI) / 180);
const sind = (d: number) => Math.sin((d * Math.PI) / 180);

type Pt = { y: number; z: number }; // doc y (down), z toward viewer

/** Deck point after the base's +90° rotation about the hinge (lies flat). */
const basePt = (yDoc: number): Pt => ({ y: HINGE, z: yDoc - HINGE });

/** Lid point after its lean-back rotation about the hinge. */
const lidPt = (yDoc: number): Pt => {
  const dy = yDoc - HINGE;
  return { y: HINGE + dy * cosd(LID_TILT), z: dy * sind(LID_TILT) };
};

/** Group pitch, applied to a pre-group point → outer-space (y2, z2). */
const groupPt = (pt: Pt) => {
  const dy = pt.y - DOC_H;
  return {
    y2: DOC_H + dy * cosd(GROUP_TILT) - pt.z * sind(GROUP_TILT),
    z2: dy * sind(GROUP_TILT) + pt.z * cosd(GROUP_TILT),
  };
};

/** Perspective only (outer-space point → projected Y relative to box center). */
const projectOuter = (y: number, z: number) => {
  const f = PERSP / (PERSP - z);
  return { Y: (y - DOC_H / 2) * f, f };
};

/** Pre-group point → projected Y (macbook parts). */
const project = (pt: Pt) => {
  const g = groupPt(pt);
  return projectOuter(g.y2, g.z2);
};

// Display center in outer space — the card layer is laid out here.
const CARD_CENTER = groupPt(lidPt(DISPLAY_CY)); // { y2, z2 }

/**
 * Card corner in outer space: the card rotates about its own center
 * (CARD_CENTER) by theta, scaled by s. (Equivalent to the old chain of
 * rotate-in-display → lid → group — verified numerically.)
 */
const cardCornerOuter = (dy: number, theta: number, s: number) => ({
  y: CARD_CENTER.y2 + dy * s * cosd(theta),
  z: CARD_CENTER.z2 + dy * s * sind(theta),
});
const cardCorner = (dy: number, theta: number, s: number) => {
  const c = cardCornerOuter(dy, theta, s);
  return projectOuter(c.y, c.z);
};

const CARD_HALF_H = DISPLAY_H / 2; // 208

// Projected bounds of everything that can stick out.
const ys = [
  project(basePt(DOC_H)).Y, // deck front edge — nearest, most magnified
  project(basePt(HINGE)).Y, // hinge
  project(lidPt(0)).Y, // lid top
  cardCorner(-CARD_HALF_H, CARD_THETA_END, CARD_END_SCALE).Y, // card top
  cardCorner(CARD_HALF_H, CARD_THETA_END, CARD_END_SCALE).Y, // card bottom
];
const minY = Math.min(...ys);
const maxY = Math.max(...ys);
/** Content center offset from the doc-box center (unscaled px, + = below). */
const CENTER_OFFSET = (minY + maxY) / 2;
const CONTENT_H = maxY - minY;
const CONTENT_HALF_W = Math.max(
  (BOX_W / 2) * project(basePt(DOC_H)).f, // deck front edge
  (BOX_W / 2) * project(lidPt(0)).f, // lid top
  (DISPLAY_W / 2) * CARD_END_SCALE *
    cardCorner(0, CARD_THETA_END, CARD_END_SCALE).f, // card at rest
);

const stageScaleFor = (width: number, height: number) =>
  Math.min(
    1.4,
    (width - 48) / (2 * CONTENT_HALF_W),
    (height - 48) / CONTENT_H,
  );

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

  // Card: starts on the screen's tilt, ends world-straight + zoomed.
  const cardScale = useTransform(
    scrollYProgress,
    [0, MOTION_START, MOTION_END, 1],
    [1, 1, CARD_END_SCALE, CARD_END_SCALE],
  );
  const cardRotateX = useTransform(
    scrollYProgress,
    [0, MOTION_START, MOTION_END, 1],
    [CARD_THETA_START, CARD_THETA_START, CARD_THETA_END, CARD_THETA_END],
  );
  // The laptop rises over the SAME window as the card's tilt-to-straight:
  // it scrolls while the card tilts, and stops (fully gone) the moment the
  // card is straight. Static before the window opens.
  const exitY = useTransform(
    scrollYProgress,
    [MOTION_START, MOTION_END],
    [0, EXIT_UP],
  );

  return (
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* 2D fit layer: perspective lives here; scale + shift center the
            projected image inside the viewport. */}
        <div
          className="relative [perspective:3000px]"
          style={{
            transform: `scale(${stageScale}) translateY(${-CENTER_OFFSET}px)`,
          }}
        >
          {/* Exit layer — the whole laptop rises up and out over the SAME
              window the card tilts straight (stops when the card is
              straight). preserve-3d keeps the chain intact through it. */}
          <motion.div style={{ y: exitY, transformStyle: "preserve-3d" }}>
            {/* Group — the camera-above pitch. FIXED: only translated, never
                tilted or repositioned by any animation. */}
            <div
              className="flex flex-col"
              style={{
                transform: `rotateX(${GROUP_TILT}deg)`,
                transformOrigin: "bottom",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Lid — horizontal 16:11 screen, leaning back about the hinge */}
              <div
                className="relative h-[27rem] w-[40rem] rounded-2xl bg-[#010101] p-2"
                style={{
                  transform: `rotateX(${LID_TILT}deg)`,
                  transformOrigin: "bottom",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  style={{ boxShadow: "0px 2px 0px 2px #171717 inset" }}
                  className="relative h-full w-full rounded-lg bg-[#272729]"
                />
              </div>
              {/* Base — rotated flat about its top edge (= the hinge): the
                  keyboard deck lies horizontal, extending toward the viewer */}
              <div
                className="relative h-[27.5rem] w-[40rem] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#272729]"
                style={{ transform: "rotateX(90deg)", transformOrigin: "top" }}
              >
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
          </motion.div>

          {/* Card layer — laid out at the display center's projected spot
              (left/top), pushed to its depth (z) and posed by the same
              projection the screen uses, so at rest it matches the tilted
              screen 1:1. It sits OUTSIDE the exit layer, so the laptop's
              rise leaves it behind: straight forward, zoomed in. */}
          <motion.div
            style={{
              left: PAD,
              top: CARD_CENTER.y2 - DISPLAY_H / 2,
              width: DISPLAY_W,
              height: DISPLAY_H,
              z: CARD_CENTER.z2,
              scale: cardScale,
              rotateX: cardRotateX,
            }}
            className="absolute z-10 origin-center overflow-hidden rounded-lg will-change-transform"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
