"use client";

// A portfolio index built as a wheel you turn.
//
// The wheel rests on its drum, not on a ring: the first thing the reader sees is
// one full-size card at the front. Scrolling turns the next piece round to the
// front, one per notch, with the neighbours rotated away into hard perspective
// and run off the top and bottom of the frame.
//
// The whole thing is one number - `turn` - read by a single rAF pass that writes
// transforms straight to the DOM. 1 is the drum with item 0 at the front, and
// every whole number after that is one more item turned past. (0 is the ring
// that existed before; the wheel now opens already past that notch.)
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { ImageLightbox } from "./image-lightbox";

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art. Any src an <img> takes. */
  image: string;
  /** Where the card links to. Omit for a wheel that only browses. Absolute
      URLs open in a new tab; in-page anchors do not. */
  href?: string;
  /** How the cover art fills the card face. The frame is landscape, so a
      portrait document cropped with `cover` shows only a band across its
      middle — `"contain"` letterboxes the whole page onto the card instead.
      @default "cover" */
  fit?: "cover" | "contain";
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. @default undefined */
  label?: string;
  /** Label on the card's hover affordance. Omit to drop it. @default undefined */
  action?: string;
}

/* Geometry. The card is measured against the stage; everything else is measured
   against the card, so a narrow stage - where the card is capped by width, not
   height - scales the whole wheel down with it instead of leaving a small card
   swinging on a huge drum. The three that matter are tuned together: STEP
   against DRUM sets how hard the neighbours rotate away, and DRUM against LENS
   decides whether they land inside the frame or run off it. */
const CARD_H = 0.52; // front card height, of the stage
const CARD_MAX_W = 0.48; // ... but never wider than this much of the stage
const CARD_RATIO = 1.45; // card width / height
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
const RING_PAD = 0.1; // card heights of air kept inside the frame edges
/* The drum alone hangs the work on a plumb line. It isn't one: the strip curves
   away round an arc whose centre sits off to the LEFT, so the piece at the front
   is at the arc's near point - dead centre - and its neighbours have already
   swung back left as well as up and down. BOW is that arc's radius; nothing else
   makes the difference between a stack of cards and a wheel seen side on. */
const BOW = 1.82;
const TITLE = 0.124; // ring label and front-card title
const INDEX = 0.04; // the index down the right-hand side

/** The drum's first notch. The wheel opens here, so the first look is item 0
    full size instead of every card fanned round the ring. */
const START = 1;

/** How much of a wheel-notch or a dragged pixel counts as one item. */
// One mouse notch is ~100px, so a unit of 100 makes each notch turn one item.
// At 900 a slow notch settled back to where it started while the range check
// kept cancelling the page scroll — freezing the reader at both ends on real
// wheel hardware.
const WHEEL_UNITS = 100;
const DRAG_UNITS = 420;
/** Quiet time after the last wheel event before the wheel settles on an item. */
const SETTLE = 140;
/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the
    front. Zero at the front, so the piece being read stays centred. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** Both states in one chain: the ring terms fall away as `m` reaches the drum,
    and the drum terms are still zero while the ring is up. The bow is applied
    first, in the wheel's own plane, so it slides the card sideways rather than
    turning with it - and perspective still shrinks it with distance. */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "Works '26",
  action = "View",
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  // The click-to-enlarge viewer. `opened` is the card index plus the viewport
  // box it flies from - and while it is up the wheel is frozen, so the close
  // flight lands on a card that has not moved underneath it.
  const [opened, setOpened] = React.useState<{
    index: number;
    from: { left: number; top: number; width: number; height: number };
  } | null>(null);
  const openedRef = React.useRef(false);
  /** Where the current gesture began, so a tap can be told from a drag. */
  const tapAt = React.useRef<{ x: number; y: number } | null>(null);
  const dragged = React.useRef(false);
  /** Swallows the click that follows the opening tap, so a card that happens
      to be an <a> does not both enlarge and navigate. */
  const suppressClick = React.useRef(false);

  // The wheel's position, and where it is heading. Only `active` is state -
  // everything else is written to the DOM, so turning the wheel is not a render.
  const turn = React.useRef(START);
  const target = React.useRef(START);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Read after mount, not during render: the server has no matchMedia, and
  // branching on it inline is a hydration mismatch. Reduced motion drops the
  // easing, so the wheel lands where it is put instead of gliding there.
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    // Shrink the ring's cards until the circle reads as a closed loop rather
    // than beads on a wire, however many pieces the wheel is given.
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;
    // Measure the ring as it is really drawn - a card at every angle, each one
    // turned to face along the circle, so the corners of the tilted ones reach
    // further out than the card itself - and take the box that sweep lands in.
    // A radius measured off the card alone makes the ring taller than the stage
    // and slices the cards at the top and bottom: the first thing the reader
    // sees on the way in. `ringZoom` is the wheel scaled down until that box
    // fits the frame, and it eases back to 1 as the drum opens, so the ring
    // reads as blowing up to full size rather than being a small ring that
    // jumps. Untouched in the drum, where running off the edge is the point.
    let ringX = 0;
    let ringY = 0;
    const hw = (cardW * ringScale) / 2;
    const hh = (cardH * ringScale) / 2;
    for (let i = 0; i < count; i++) {
      const a = rad(i * (360 / count));
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      for (const cx of [-hw, hw]) {
        for (const cy of [-hh, hh]) {
          // The ring placement is rotateZ(a) translateY(-ringR): moved up the
          // circle first, then carried round to its seat.
          const x = cx;
          const y = cy - ringR;
          ringX = Math.max(ringX, Math.abs(x * cos - y * sin));
          ringY = Math.max(ringY, Math.abs(x * sin + y * cos));
        }
      }
    }
    const pad = cardH * RING_PAD;
    const ringZoom = clamp(
      Math.min((w / 2 - pad) / (ringX || 1), (h / 2 - pad) / (ringY || 1)),
      0,
      1,
    );
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      ringZoom,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: cardH * TITLE,
      index: cardH * INDEX,
    };
  }, [stage, count]);

  // One pass per frame: ease toward the target, then write every transform.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, ringZoom, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      // The drum is pulled back so its front face lands on the picture plane.
      // That set-back has to arrive with the drum, or the ring would sit at the
      // far side of the perspective and render at half its size. The 2D scale
      // rides in front of it, so it shrinks the ring into the frame without
      // touching the depth the drum turns through - and the front card stays on
      // the picture plane at every step, because scale() leaves z alone.
      if (wheelRef.current) {
        wheelRef.current.style.transform =
          `translateZ(${-m * drumR}px) scale(${lerp(ringZoom, 1, m)})`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          // One card at a time: fade a card out as it turns away from the
          // front, so the wheel never rests with neighbours peeking into the
          // frame (they did on narrow stages, where the cards are small).
          const fade = clamp(1 - (Math.abs(d) - 0.3) / 0.45, 0, 1);
          card.style.opacity = String(fade);
          card.style.pointerEvents = fade > 0.05 ? "" : "none";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      // The ring label rides the same zoom, so it stays in proportion with the
      // ring it sits inside instead of outgrowing the hole.
      if (labelRef.current) {
        labelRef.current.style.opacity = String(1 - m);
        labelRef.current.style.transform = `scale(${lerp(ringZoom, 1, m)})`;
      }
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  const to = React.useCallback(
    (next: number) => {
      if (openedRef.current) return; // the wheel does not turn behind the viewer
      target.current = clamp(next, START, last + START);
    },
    [last],
  );

  const openCard = React.useCallback((index: number) => {
    if (openedRef.current) return;
    const card = cardRefs.current[index];
    if (!card) return;
    const r = card.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    openedRef.current = true;
    target.current = turn.current; // freeze here: the close flight aims at `r`
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 400);
    setOpened({
      index,
      from: { left: r.left, top: r.top, width: r.width, height: r.height },
    });
  }, []);

  const closeCard = React.useCallback(() => {
    openedRef.current = false;
    setOpened(null);
  }, []);

  const openAtPoint = React.useCallback(
    (x: number, y: number) => {
      // The stage keeps pointer capture for the whole gesture, so pointer
      // events land on it and `event.target` is no help - hit-testing is the
      // only way to find the card the tap came down on.
      const under = document.elementFromPoint(x, y);
      const card = under?.closest("[data-wheel-card]");
      if (!(card instanceof HTMLElement)) return;
      const index = Number(card.dataset.wheelCard);
      if (!Number.isInteger(index)) return;
      openCard(index);
    },
    [openCard],
  );

  // Native listener, because the wheel has to be cancellable - and it only
  // cancels while it still has somewhere to go, so the page scrolls on at
  // either end instead of trapping the reader.
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const next = target.current + event.deltaY / WHEEL_UNITS;
      // Only hold the page while there is another card to turn to. Scrolling
      // up from the first card (and down past the last) scrolls the page.
      if (next > START && next < last + START) event.preventDefault();
      to(next);
      // A wheel gesture arrives as a burst of events with no end of its own, so
      // the rest position is whatever notch it happened to stop on. Left there
      // the drum sits between two cards - nothing at the front, and the pair
      // either side of the gap both turned half away. Settle onto an item.
      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(
        () => to(Math.round(target.current)),
        SETTLE,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [to, last]);

  const drag = React.useRef<number | null>(null);
  const settling = React.useRef(0);

  return (
    <section
      aria-label={label}
      className={cn(
        "bg-background text-foreground relative h-full min-h-[24rem] w-full overflow-hidden select-none",
        className,
      )}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`works-wheel-${active}`}
        className="focus-visible:outline-foreground absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        data-lenis-prevent-wheel
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          drag.current = event.clientY;
          tapAt.current = { x: event.clientX, y: event.clientY };
          dragged.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current === null) return;
          const start = tapAt.current;
          if (
            start &&
            (Math.abs(event.clientX - start.x) > 6 ||
              Math.abs(event.clientY - start.y) > 6)
          ) {
            dragged.current = true; // travelled: a drag, not a tap
          }
          to(target.current + (drag.current - event.clientY) / DRAG_UNITS);
          drag.current = event.clientY;
        }}
        onPointerUp={(event) => {
          // Land on an item rather than between two.
          const startedHere = tapAt.current !== null;
          const wasTap = startedHere && !dragged.current;
          tapAt.current = null;
          drag.current = null;
          if (target.current > START) to(Math.round(target.current));
          // A tap that never travelled opens the card it came down on - the
          // click-to-enlarge of DomeGallery, keyed off pointer events because
          // the stage holds capture and would otherwise swallow the click.
          if (wasTap) openAtPoint(event.clientX, event.clientY);
        }}
        onPointerCancel={() => {
          tapAt.current = null;
          drag.current = null;
        }}
        onClick={(event) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          event.preventDefault();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") to(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") to(Math.round(target.current) - 1);
          else if (event.key === "Enter" || event.key === " ") openCard(active);
          else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {items.map((item, i) => {
            const Tag = (item.href ? "a" : "div") as "a";
            // A card that points off the site (a hosted résumé, say) should not
            // navigate the reader away from the portfolio.
            const external = Boolean(
              item.href && /^(?:https?:)?\/\//.test(item.href),
            );
            return (
              <React.Fragment key={item.title}>
                <Tag
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={item.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  data-wheel-card={i}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  className="group absolute [backface-visibility:hidden]"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <span className="bg-muted shadow-foreground/12 relative block size-full overflow-hidden rounded-lg shadow-[0_18px_40px_-18px_var(--tw-shadow-color)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      className={cn(
                        "size-full",
                        item.fit === "contain"
                          ? "object-contain"
                          : "object-cover",
                      )}
                    />
                    {/* Every card opens the viewer now, so every card gets the
                        affordance — not just the ones carrying a link. */}
                    {action ? (
                      <span className="bg-background/80 text-foreground pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] opacity-0 backdrop-blur-sm transition group-hover:translate-y-0 group-hover:opacity-100">
                        <svg
                          viewBox="0 0 12 12"
                          className="size-2.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 9 9 3M4 3h5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {action}
                      </span>
                    ) : null}
                  </span>
                </Tag>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Ring title and front-card title trade places across the transition.
          Type is sized off the measured stage, not vh, so the wheel keeps its
          proportions inside a card as well as at full bleed. */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-items-center tracking-tight"
        style={{ fontSize: metrics.title }}
      >
        {label}
      </div>
      <div
        ref={titleRef}
        className="pointer-events-none absolute top-[7%] left-[8%] max-w-[76%] tracking-tight opacity-0"
        style={{ fontSize: metrics.title }}
      >
        {items[active]?.title}
      </div>

      <ol
        className="text-muted-foreground absolute top-[7.5%] right-[2.5%] text-right leading-[1.75]"
        style={{ fontSize: metrics.index }}
      >
        {items.map((item, i) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => to(i + START)}
              className={cn(
                "focus-visible:outline-foreground cursor-pointer transition-colors outline-none focus-visible:outline-1",
                i === active && "text-foreground font-medium",
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>

      {/* Click-to-enlarge. Portalled to <body> rather than rendered here: the
          section is `overflow-hidden`, and a fixed overlay inside it could be
          clipped or re-contained by any transformed ancestor above. */}
      {opened
        ? createPortal(
            <ImageLightbox
              src={items[opened.index].image}
              alt={items[opened.index].title}
              from={opened.from}
              href={items[opened.index].href}
              onClose={closeCard}
            />,
            document.body,
          )
        : null}
    </section>
  );
}

export default WorksWheel;
