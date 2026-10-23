"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";

// Cross-panel links (spec §7): hovering or focusing a terminal row drives the left visual. Touch: tap = focus.
export type Hot = { group: "project" | "photo" | "skill" | "cert"; id: string };
type Ctx = { hot: Hot | null; setHot: (h: Hot | null) => void; qr: boolean[][] };

const VisualCtx = createContext<Ctx>({ hot: null, setHot: () => {}, qr: [] });
export const useVisual = () => useContext(VisualCtx);

export function VisualProvider({ children, qr }: { children: ReactNode; qr: boolean[][] }) {
  const [hot, setHot] = useState<Hot | null>(null);
  const value = useMemo(() => ({ hot, setHot, qr }), [hot, qr]);
  return <VisualCtx.Provider value={value}>{children}</VisualCtx.Provider>;
}

/** Wraps a terminal row/item so pointer enter and keyboard focus both light up its visual. */
export function HotTarget({
  as: Tag = "div",
  hot,
  className,
  tabIndex,
  children,
}: {
  as?: ElementType;
  hot?: Hot;
  className?: string;
  tabIndex?: number;
  children: ReactNode;
}) {
  const { setHot } = useVisual();
  if (!hot) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      tabIndex={tabIndex}
      onPointerEnter={() => setHot(hot)}
      onPointerLeave={() => setHot(null)}
      onFocus={() => setHot(hot)}
      onBlur={() => setHot(null)}
    >
      {children}
    </Tag>
  );
}
