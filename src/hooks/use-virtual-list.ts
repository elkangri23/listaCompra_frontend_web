import { MutableRefObject, useEffect, useMemo, useState } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

interface UseVirtualListOptions {
  itemCount: number;
  itemHeight: number;
  scrollRef: MutableRefObject<HTMLElement | null>;
  overscan?: number;
  initialViewportHeight?: number;
}

interface UseVirtualListResult {
  virtualItems: VirtualItem[];
  paddingTop: number;
  paddingBottom: number;
  totalSize: number;
}

/**
 * Hook ligero de virtualización pensado para tablas largas.
 * Calcula los elementos visibles según el scroll actual y
 * devuelve los items virtuales junto con el padding necesario
 * para mantener el alto total de la lista.
 */
export function useVirtualList({
  itemCount,
  itemHeight,
  overscan = 4,
  scrollRef,
  initialViewportHeight = 480,
}: UseVirtualListOptions): UseVirtualListResult {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(initialViewportHeight);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      setScrollOffset(element.scrollTop);
    };

    const handleResize = () => {
      setViewportHeight(element.clientHeight || initialViewportHeight);
    };

    handleResize();

    element.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(element);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      element.removeEventListener('scroll', handleScroll);

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [scrollRef, initialViewportHeight]);

  const totalSize = itemCount * itemHeight;

  const { startIndex, endIndex } = useMemo(() => {
    if (itemCount === 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    const rawStartIndex = Math.max(Math.floor(scrollOffset / itemHeight) - overscan, 0);
    const rawEndIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollOffset + viewportHeight) / itemHeight) + overscan
    );

    return {
      startIndex: rawStartIndex,
      endIndex: rawEndIndex,
    };
  }, [itemCount, scrollOffset, viewportHeight, itemHeight, overscan]);

  const virtualItems = useMemo(() => {
    if (endIndex < startIndex) {
      return [] as VirtualItem[];
    }

    const items: VirtualItem[] = [];

    for (let index = startIndex; index <= endIndex; index += 1) {
      const start = index * itemHeight;
      items.push({
        index,
        start,
        size: itemHeight,
        end: start + itemHeight,
      });
    }

    return items;
  }, [endIndex, startIndex, itemHeight]);

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0;

  return {
    virtualItems,
    paddingTop,
    paddingBottom,
    totalSize,
  };
}
