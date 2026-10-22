'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/* Project card with ChromaGrid's spotlight reveal: the whole card renders in
   black & white, and a soft circle around the pointer brings it back to color.
   A duplicated, masked color copy floats above the grayscale interactive copy;
   a small rAF loop lerps the pointer position and a power value (fade in/out)
   into CSS variables consumed by the mask. Each card tracks the pointer
   locally, so no root-level offset bookkeeping is needed. */

export interface SpotlightLink {
  label: string;
  href: string;
}

export interface SpotlightCardItem {
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  links?: SpotlightLink[];
  /** Accent color for the reveal glow, wash and icon. */
  accent?: string;
  image?: string;
  imageFit?: 'cover' | 'contain';
  alt?: string;
  /** Decorative glyph shown in the media area when there is no image. */
  icon?: ReactNode;
}

export interface SpotlightCardProps {
  item: SpotlightCardItem;
  /** Spotlight radius in px. */
  radius?: number;
  className?: string;
  style?: CSSProperties;
}

const TILE = 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)';
const CARD_SHADOW =
  '0 0 0 1px rgba(255, 255, 255, 0.07), 0 -12px 40px -16px rgba(0, 0, 0, 0.35), 0 24px 48px -24px rgba(0, 0, 0, 0.4)';
const SPOT_MASK =
  'radial-gradient(circle var(--spot-r, 300px) at var(--spot-x, -999px) var(--spot-y, -999px), #000 0%, #000 22%, rgba(0, 0, 0, 0.55) 56%, transparent 78%)';
const WASH = 'radial-gradient(130% 70% at 50% 100%, var(--spot-accent, #ffffff), transparent 72%)';
const GLOW_RIM =
  'inset 0 0 0 1px var(--spot-accent, #ffffff), inset 0 0 18px -8px var(--spot-accent, #ffffff)';
const MEDIA_RIM = 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)';
const CHIP_STYLE: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.07)',
  color: 'rgba(241, 239, 234, 0.6)',
  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)'
};
const PILL_STYLE: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.08)',
  color: '#f1efea',
  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
};

/* Identical geometry in both copies — padding lives here (not on the card
   root) so the absolutely-positioned overlay copy lines up exactly. */
const CardContent = ({ item, decorative = false }: { item: SpotlightCardItem; decorative?: boolean }) => {
  const accent = item.accent ?? '#ffffff';
  const contain = Boolean(item.image) && item.imageFit === 'contain';
  const baseBg = `linear-gradient(145deg, color-mix(in srgb, ${accent} 30%, #322e3d) 0%, #211e2a 74%)`;
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6 sm:flex-row sm:items-stretch sm:gap-6 sm:p-8">
      <div
        className="relative h-36 shrink-0 overflow-hidden rounded-[16px] sm:h-auto sm:min-h-[200px] sm:w-[36%]"
        style={{ background: contain ? baseBg : 'rgba(255, 255, 255, 0.06)' }}
      >
        {item.image ? (
          <img
            className={`absolute inset-0 block h-full w-full select-none [-webkit-user-drag:none] ${contain ? 'p-[7%]' : ''}`}
            style={{ objectFit: item.imageFit ?? 'cover' }}
            src={item.image}
            alt={decorative ? '' : (item.alt ?? item.title)}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ color: accent }}
          >
            {item.icon ?? (
              <span className="text-6xl font-bold tracking-tight opacity-90">{item.title.slice(0, 2)}</span>
            )}
          </span>
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ boxShadow: MEDIA_RIM }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <span className="text-[22px] leading-tight font-semibold tracking-[-0.01em] sm:text-[26px]">
          {item.title}
        </span>
        {item.subtitle && (
          <span className="text-[14px] leading-snug sm:text-[15px]" style={{ color: 'rgba(241, 239, 234, 0.65)' }}>
            {item.subtitle}
          </span>
        )}
        {item.description && (
          <p className="mt-1 text-[13px] leading-relaxed sm:text-[14px]" style={{ color: 'rgba(241, 239, 234, 0.55)' }}>
            {item.description}
          </p>
        )}
        {item.tags?.length ? (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-[3px] text-[11px] font-medium tracking-wide"
                style={CHIP_STYLE}
              >
                {tag}
              </span>
            ))}
          </span>
        ) : null}
        {item.links?.length ? (
          <span className="mt-2.5 flex flex-wrap gap-2">
            {item.links.map(link =>
              decorative ? (
                <span
                  key={link.href}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={PILL_STYLE}
                >
                  {link.label}
                  <span aria-hidden="true" className="text-[10px] opacity-70">
                    ↗
                  </span>
                </span>
              ) : (
                <a
                  key={link.href}
                  className="cursor-target inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold no-underline transition-[filter] duration-200 hover:brightness-125"
                  style={PILL_STYLE}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-[10px] opacity-70">
                    ↗
                  </span>
                </a>
              )
            )}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export const SpotlightCard = ({ item, radius = 300, className = '', style }: SpotlightCardProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0, primed: false };
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const follow = reduce ? 1 : 1 - Math.exp(-dt / 0.14);
      state.x += (state.tx - state.x) * follow;
      state.y += (state.ty - state.y) * follow;
      const span = state.target > state.power ? 0.1 : 0.2;
      state.power += (state.target - state.power) * (reduce ? 1 : 1 - Math.exp(-dt / span));
      root.style.setProperty('--spot-x', `${state.x.toFixed(2)}px`);
      root.style.setProperty('--spot-y', `${state.y.toFixed(2)}px`);
      root.style.setProperty('--spot-power', state.power.toFixed(4));
      const settled =
        Math.abs(state.tx - state.x) < 0.1 &&
        Math.abs(state.ty - state.y) < 0.1 &&
        Math.abs(state.target - state.power) < 0.002;
      if (settled) {
        state.power = state.target;
        root.style.setProperty('--spot-power', state.power.toFixed(4));
        last = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      state.tx = event.clientX - box.left;
      state.ty = event.clientY - box.top;
      if (!state.primed || state.power < 0.02) {
        state.x = state.tx;
        state.y = state.ty;
        state.primed = true;
      }
      state.target = 1;
      wake();
    };

    const onLeave = () => {
      state.target = 0;
      wake();
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointercancel', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointercancel', onLeave);
    };
  }, []);

  const accent = item.accent ?? '#ffffff';
  const rootStyle = {
    '--spot-accent': accent,
    '--spot-r': `${Math.max(60, radius)}px`,
    background: TILE,
    boxShadow: CARD_SHADOW,
    color: '#f1efea'
  } as CSSProperties;
  const masked = {
    WebkitMaskImage: SPOT_MASK,
    maskImage: SPOT_MASK
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`cursor-target relative isolate h-full w-full overflow-hidden rounded-[28px] ${className}`.trim()}
      style={{ ...rootStyle, ...style }}
    >
      {/* Accent wash — only visible inside the spotlight circle. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: WASH,
          opacity: 'calc(0.45 * var(--spot-power, 0))',
          ...masked
        }}
      />
      {/* Interactive copy, permanently in black & white. */}
      <div className="relative z-[1]" style={{ filter: 'grayscale(1)' }}>
        <CardContent item={item} />
      </div>
      {/* Color copy, revealed through the pointer spotlight. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ opacity: 'var(--spot-power, 0)', ...masked }}
      >
        <CardContent item={item} decorative />
      </div>
      {/* Accent rim glow inside the spotlight. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] rounded-[inherit]"
        style={{
          boxShadow: GLOW_RIM,
          opacity: 'var(--spot-power, 0)',
          ...masked
        }}
      />
    </div>
  );
};

export default SpotlightCard;
