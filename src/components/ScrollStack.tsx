import React, { useLayoutEffect, useRef, useCallback, ReactNode } from 'react';
import Lenis from 'lenis';
import './ScrollStack.css';

export interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

export interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 16,
  itemScale = 0.03,
  itemStackDistance = 20,
  stackPosition = '15%',
  scaleEndPosition = '10%',
  baseScale = 0.88,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = true,
  onStackComplete,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef<
    Map<number, { translateY: number; scale: number; rotation: number; blur: number }>
  >(new Map());
  const isUpdatingRef = useRef<boolean>(false);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return typeof value === 'number' ? value : parseFloat(value);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement,
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller ? scroller.scrollTop : 0,
        containerHeight: scroller ? scroller.clientHeight : window.innerHeight,
        scrollContainer: scroller || document.documentElement,
      };
    }
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      let top = 0;
      let el: HTMLElement | null = element;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent as HTMLElement | null;
      }
      return top;
    },
    []
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const headerHeight = document.querySelector('header')?.offsetHeight || 70;
    const parsedStackPos = parsePercentage(stackPosition, containerHeight);
    const baseStackPos = parsedStackPos > 0 ? parsedStackPos : headerHeight + 14;

    const maxStackVisible = 4; // Max visible stacked header steps
    const stackGap = 46; // Gap in px to reveal the product name/header when stacked

    const endElement = useWindowScroll
      ? document.querySelector('.scroll-stack-end')
      : scrollerRef.current?.querySelector('.scroll-stack-end');

    const endElementTop = endElement ? getElementOffset(endElement as HTMLElement) : 0;
    const pinEnd = endElementTop - containerHeight / 2;

    const cards = cardsRef.current;
    const initialTops = cards.map((card) => (card ? getElementOffset(card) : 0));

    const pinStarts: number[] = cards.map((card, i) => {
      if (!card) return 0;
      const targetTop = baseStackPos + Math.min(i, maxStackVisible) * stackGap;
      const start = initialTops[i] - targetTop;
      return i === 0 ? Math.max(0, start) : start;
    });

    // Calculate smooth step progress (0 to 1) for each card pinning over previous
    const smoothP: number[] = [0]; // index 0 has no preceding card
    for (let k = 1; k < cards.length; k++) {
      const pStart = pinStarts[k - 1];
      const pEnd = pinStarts[k];
      const range = Math.max(1, pEnd - pStart);
      const rawProgress = Math.min(1, Math.max(0, (scrollTop - pStart) / range));
      const smooth = rawProgress * rawProgress * (3 - 2 * rawProgress);
      smoothP.push(smooth);
    }

    cards.forEach((card, i) => {
      if (!card) return;

      const pinStart = pinStarts[i];

      // Calculate upward push on card i when cards beyond maxStackVisible pin
      let pushUpAmount = 0;
      for (let k = Math.max(i + 1, maxStackVisible + 1); k < cards.length; k++) {
        pushUpAmount += smoothP[k] * stackGap;
      }

      const baseTargetTop = baseStackPos + Math.min(i, maxStackVisible) * stackGap;
      const currentTargetTop = baseTargetTop - pushUpAmount;

      let translateY = 0;
      let scale = 1;
      let rotation = 0;
      let blur = 0;
      let opacity = 1;

      if (scrollTop >= pinStart) {
        // Pinned card offset
        const pinDelta = scrollTop - pinStart - pushUpAmount;
        const maxTranslateY = pinEnd - pinStart - pushUpAmount;
        translateY = Math.min(pinDelta, Math.max(0, maxTranslateY));

        // Depth calculation for scaling from subsequent cards stacked on top
        let depth = 0;
        for (let k = i + 1; k < cards.length; k++) {
          depth += smoothP[k];
        }

        if (depth > 0) {
          const scaleFactor = itemScale || 0.035;
          const minScale = baseScale || 0.75;
          scale = Math.max(minScale, 1 - depth * scaleFactor);
          if (blurAmount) {
            blur = Math.min(6, depth * blurAmount);
          }
          if (rotationAmount) {
            rotation = i * rotationAmount * 0.5;
          }
        }

        // Smoothly fade out cards that push above baseStackPos
        if (currentTargetTop < baseStackPos) {
          const aboveAmount = baseStackPos - currentTargetTop;
          opacity = Math.max(0, 1 - aboveAmount / (stackGap * 0.8));
        }
      }

      card.style.zIndex = `${i + 1}`;
      card.style.transformOrigin = 'top center';

      const newTransform = {
        translateY: Math.round(translateY * 1000) / 1000,
        scale: Math.round(scale * 10000) / 10000,
        rotation: Math.round(rotation * 1000) / 1000,
        blur: Math.round(blur * 1000) / 1000,
        opacity: Math.round(opacity * 1000) / 1000,
      };

      const lastTransform = lastTransformsRef.current.get(i) as
        | { translateY: number; scale: number; rotation: number; blur: number; opacity?: number }
        | undefined;

      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.01 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.0001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.01 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.01 ||
        Math.abs((lastTransform.opacity ?? 1) - newTransform.opacity) > 0.005;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filterStr = [];
        if (newTransform.blur > 0) filterStr.push(`blur(${newTransform.blur}px)`);

        card.style.transform = transform;
        card.style.filter = filterStr.length > 0 ? filterStr.join(' ') : 'none';
        card.style.opacity = `${newTransform.opacity}`;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cards.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    stackPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    parsePercentage,
    getScrollData,
    getElementOffset,
  ]);

  const handleScroll = useCallback(() => {
    updateCardTransforms();
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: false,
      });

      lenis.on('scroll', handleScroll);

      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);

      lenisRef.current = lenis;
      return lenis;
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const lenis = new Lenis({
        wrapper: scroller,
        content: (scroller.querySelector('.scroll-stack-inner') as HTMLElement) || undefined,
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.15,
        syncTouch: false,
      });

      lenis.on('scroll', handleScroll);

      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);

      lenisRef.current = lenis;
      return lenis;
    }
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller && !useWindowScroll) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller
        ? scroller.querySelectorAll('.scroll-stack-card')
        : []
    ) as HTMLElement[];

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      } else {
        card.style.marginBottom = '0px';
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      (card.style as unknown as { webkitTransform?: string }).webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      (card.style as unknown as { webkitPerspective?: string }).webkitPerspective = '1000px';
    });

    setupLenis();

    if (useWindowScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else if (scroller) {
      scroller.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateCardTransforms();

    return () => {
      if (useWindowScroll) {
        window.removeEventListener('scroll', handleScroll);
      } else if (scroller) {
        scroller.removeEventListener('scroll', handleScroll);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    children,
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms,
  ]);

  return (
    <div
      className={`scroll-stack-scroller ${useWindowScroll ? 'use-window-scroll' : ''} ${className}`.trim()}
      ref={scrollerRef}
    >
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
