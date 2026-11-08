"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Desktop affordances on top of a native horizontal scroller:
 *  - mouse/pen drag with inertia (touch keeps native momentum scrolling)
 *  - vertical wheel → smooth horizontal scroll
 *  - click suppression after a drag so garments aren't opened accidentally
 * Native scrolling stays the source of truth, so keyboard, touch, trackpads
 * and assistive tech all keep working.
 */
export function useRackScroll(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let wheelTarget: number | null = null;
    let dragging = false;
    let pointerDown = false;
    let suppressClick = false;
    let startX = 0;
    let startScroll = 0;
    let pointerId = -1;
    let samples: { t: number; x: number }[] = [];

    const max = () => el.scrollWidth - el.clientWidth;
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wheelTarget = null;
    };

    const glide = (velocity: number) => {
      // velocity in px/ms (content movement). Exponential decay.
      let v = velocity;
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(32, now - last);
        last = now;
        el.scrollLeft -= v * dt;
        v *= Math.pow(0.94, dt / 16);
        const atEdge = el.scrollLeft <= 0 || el.scrollLeft >= max();
        if (Math.abs(v) > 0.02 && !atEdge) raf = requestAnimationFrame(step);
        else raf = 0;
      };
      raf = requestAnimationFrame(step);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!enabledRef.current || e.pointerType === "touch" || e.button !== 0) return;
      stop();
      pointerDown = true;
      dragging = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      pointerId = e.pointerId;
      samples = [{ t: e.timeStamp, x: e.clientX }];
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 6) {
        dragging = true;
        el.setPointerCapture(pointerId);
        el.dataset.dragging = "true";
      }
      if (!dragging) return;
      e.preventDefault();
      el.scrollLeft = startScroll - dx;
      samples.push({ t: e.timeStamp, x: e.clientX });
      if (samples.length > 6) samples.shift();
    };

    const endDrag = (e: PointerEvent) => {
      if (!pointerDown || e.pointerId !== pointerId) return;
      pointerDown = false;
      if (!dragging) return;
      dragging = false;
      suppressClick = true;
      delete el.dataset.dragging;
      if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = last.t - first.t;
      if (dt > 0 && e.timeStamp - last.t < 80) glide((last.x - first.x) / dt);
      // The click (if any) fires right after pointerup; clear afterwards.
      setTimeout(() => (suppressClick = false), 0);
    };

    const onClickCapture = (e: MouseEvent) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!enabledRef.current || e.ctrlKey) return;
      // Let trackpads' native horizontal scrolling through untouched.
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
        stop();
        return;
      }
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? el.clientWidth : 1;
      if (raf && wheelTarget === null) stop();
      wheelTarget = Math.max(0, Math.min(max(), (wheelTarget ?? el.scrollLeft) + e.deltaY * unit));
      if (!raf) {
        const step = () => {
          if (wheelTarget === null) return;
          const diff = wheelTarget - el.scrollLeft;
          if (Math.abs(diff) < 0.5) {
            el.scrollLeft = wheelTarget;
            stop();
            return;
          }
          el.scrollLeft += diff * 0.18;
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
    };

    const onTouchStart = () => stop();

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      stop();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
    };
  }, [ref]);
}
