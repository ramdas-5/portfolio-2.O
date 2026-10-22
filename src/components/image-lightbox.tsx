"use client";

// The picture flies out of the box it was clicked in, holds centre stage over
// a blurred scrim, and flies back into it on the way out — the click-to-enlarge
// feature of DomeGallery, cut down to the popup (the dome, the drag and the
// inertia stay where they were).
//
// The final frame is derived from the image's own pixel size rather than
// measured off the DOM, so it never letterboxes and never jumps when a slow
// image lands: from box, fitted box, and one FLIP transform between them.

import * as React from "react";
import { createPortal } from "react-dom";

export interface ImageLightboxBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ImageLightboxProps {
  src: string;
  alt: string;
  /** Viewport box the picture flies from and back to, in client coordinates —
      the bounding rect of whatever was clicked. */
  from: ImageLightboxBox;
  /** Full-size original offered under the picture (a hosted résumé, say).
      Omit when the image is the whole story. */
  href?: string;
  /** Called once the close flight has finished. */
  onClose: () => void;
}

/** Open and close travel, in ms. */
const FLY = 320;
/** Viewport room reserved under the picture for the "open full size" link. */
const LINK_H = 56;

/** Largest `w x h` that fits the viewport, centred, with `under` held below. */
function fit(w: number, h: number, under: number): ImageLightboxBox {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = Math.max(20, Math.min(vw, vh) * 0.08);
  const scale = Math.min((vw - pad * 2) / w, (vh - pad * 2 - under) / h);
  const width = w * scale;
  const height = h * scale;
  return {
    left: (vw - width) / 2,
    top: (vh - under - height) / 2,
    width,
    height,
  };
}

/** The transform that puts a frame laid out at `to` back onto `from`.
    Origin is the top-left (set in the box style), so translate then scale
    lands it exactly on the card — non-uniformly, which is what foreshortens
    the picture back into a card seen at an angle. */
function onto(to: ImageLightboxBox, from: ImageLightboxBox) {
  return (
    `translate(${from.left - to.left}px, ${from.top - to.top}px)` +
    ` scale(${from.width / to.width}, ${from.height / to.height})`
  );
}

export function ImageLightbox({
  src,
  alt,
  from,
  href,
  onClose,
}: ImageLightboxProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const scrimRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  /** Flies once. A later resize re-places the frame, it does not fly again. */
  const flown = React.useRef(false);
  const closing = React.useRef(false);
  const timer = React.useRef(0);

  const [to, setTo] = React.useState<ImageLightboxBox | null>(null);
  const frame = to ?? from;

  const measure = React.useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    setTo(fit(img.naturalWidth, img.naturalHeight, href ? LINK_H : 0));
  }, [href]);

  // A picture already in the cache is complete before React attaches a load
  // listener, and the card on screen guarantees it is in the cache — so measure
  // on mount as well as on load, or the flight would never start.
  React.useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      measure();
      return;
    }
    img.addEventListener("load", measure);
    return () => img.removeEventListener("load", measure);
  }, [measure]);

  // Fly the frame out of the card: lay the start transform down and flush it,
  // then release it on the next frame. That one painted frame sits exactly on
  // the card, so all the reader sees is the scrim coming up.
  React.useLayoutEffect(() => {
    const box = boxRef.current;
    if (!to || !box || flown.current) return;
    box.style.transition = "none";
    box.style.transform = onto(to, from);
    void box.offsetWidth; // flush — the flight starts from here
    const id = requestAnimationFrame(() => {
      const el = boxRef.current;
      if (!el) return;
      flown.current = true;
      el.style.transition = `transform ${FLY}ms cubic-bezier(.22,.61,.36,1)`;
      el.style.transform = "none";
    });
    return () => cancelAnimationFrame(id);
  }, [to, from]);

  React.useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    const id = requestAnimationFrame(() => {
      if (scrimRef.current) scrimRef.current.style.opacity = "1";
    });
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const close = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer.current);
      onClose();
    };

    if (scrimRef.current) scrimRef.current.style.opacity = "0";

    const box = boxRef.current;
    if (box && to) {
      box.style.transition = `transform ${FLY}ms cubic-bezier(.4,0,.65,.2)`;
      box.style.transform = onto(to, from);
      // transitionend is the happy path; the timer covers the cases where it
      // never comes — reduced motion, or a transition cut short by another
      // style change. `finish` is idempotent, so both can fire.
      box.addEventListener("transitionend", finish, { once: true });
      timer.current = window.setTimeout(finish, FLY + 80);
    } else {
      // Nothing to fly back to — the picture never got a size.
      timer.current = window.setTimeout(finish, 200);
    }
  }, [from, to, onClose]);

  // Escape, focus, and the scroll lock. The wheel behind the viewer has to stay
  // exactly where it is: the close flight aims at the card's stored rect.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    rootRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prev;
    };
  }, [close]);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      tabIndex={-1}
      data-lenis-prevent
      className="fixed inset-0 z-[60] outline-none"
    >
      <div
        ref={scrimRef}
        onClick={close}
        className="absolute inset-0 cursor-zoom-out transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          opacity: 0,
        }}
      />
      <div
        ref={boxRef}
        className="absolute overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]"
        style={{
          left: frame.left,
          top: frame.top,
          width: frame.width,
          height: frame.height,
          transformOrigin: "top left",
          borderRadius: 30,
          willChange: "transform",
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          onError={onClose}
          className="h-full w-full select-none object-cover"
        />
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-[13px] font-medium tracking-tight text-[#f1efea] no-underline backdrop-blur-sm transition-colors hover:bg-black/80"
        >
          Open full size
          <span aria-hidden="true" className="ml-1">
            ↗
          </span>
        </a>
      ) : null}
    </div>,
    document.body,
  );
}

export default ImageLightbox;
