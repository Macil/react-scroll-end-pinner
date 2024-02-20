"use client";

import { ReactNode, useRef } from "react";
import useIsomorphicLayoutEffect from "react-use/lib/useIsomorphicLayoutEffect";

export interface Props {
  children?: ReactNode;
  /**
   * Controls whether the scroll to end is smooth or instant.
   * Recommended values are "instant" or "smooth".
   * @default "instant"
   */
  scrollBehavior?: ScrollBehavior | "instant";
  // /**
  //  * TODO implement
  //  * @default "vertical"
  //  */
  // direction?: "vertical" | "horizontal" | "both";
  /**
   * The number of pixels from the end of the scrollable area that the scroll
   * position must be within to be considered "at the end".
   * Must be set to at least 1 in order to work dependably in mobile Chrome.
   * @default 5
   */
  endThreshold?: number;
  scrollToEndOnMount?: boolean;
  className?: string;
  style?: React.CSSProperties;
  // TODO `disabled` prop to let pinning be temporarily disabled
}

const autoScrollMaxTime = 5_000;

/**
 * This component starts scrolled to the end and then stays scrolled to the end
 * as new elements are added unless the user scrolls up.
 *
 * This component handles keeping the scroll locked to the end in the following cases:
 * - The contents grow taller (including the case where the window/ScrollEndPinner is resized to be
 *   thinner and the word-wrapping makes the contents taller).
 * - The ScrollEndPinner grows taller (such as when the window is resized to be taller).
 */
export default function ScrollEndPinner(props: Props) {
  const scrollToEndOnMount = props.scrollToEndOnMount ?? true;
  const scrollBehavior = props.scrollBehavior ?? "instant";
  const endThreshold = props.endThreshold ?? 5;

  const extraOuterRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  /**
   * Used when a smooth autoscroll animation is happening.
   * This is used so we can know to treat it as if the user has scroll locked
   * to the end during the animation before the scroll position reaches the
   * end.
   */
  const activeAutoScrollToEnd = useRef<{
    fromHeight: number;
    timestamp: number;
  } | null>(null);

  function isAutoScrollToEndHappening(): boolean {
    if (activeAutoScrollToEnd.current) {
      return (
        outerRef.current!.scrollTop >=
          activeAutoScrollToEnd.current.fromHeight &&
        activeAutoScrollToEnd.current.timestamp > Date.now() - autoScrollMaxTime
      );
    }
    return false;
  }

  useIsomorphicLayoutEffect(() => {
    if (scrollToEndOnMount) {
      outerRef.current!.scrollHeight - outerRef.current!.clientHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIsomorphicLayoutEffect(
    () => {
      if (!globalThis.ResizeObserver) {
        console.warn(
          "Browser does not support ResizeObserver. Scroll will not stay pinned to the end as contents resize.",
        );
        return;
      }

      let lastMaxScrollTop =
        outerRef.current!.scrollHeight - outerRef.current!.clientHeight;

      const ro = new ResizeObserver(() => {
        const newMaxScrollTop =
          outerRef.current!.scrollHeight - outerRef.current!.clientHeight;

        const wasScrolledToBottom =
          isAutoScrollToEndHappening() ||
          outerRef.current!.scrollTop + endThreshold >= lastMaxScrollTop;

        if (wasScrolledToBottom) {
          // Use instant scroll if smoothScroll prop is off or if the page is hidden, as a workaround for
          // Firefox issue where smooth scrolling doesn't work when the tab is hidden.
          if (
            scrollBehavior === "instant" ||
            document.visibilityState === "hidden"
          ) {
            activeAutoScrollToEnd.current = null;
            outerRef.current!.scrollTop = newMaxScrollTop;
          } else {
            activeAutoScrollToEnd.current = {
              fromHeight: outerRef.current!.scrollTop,
              timestamp: Date.now(),
            };
            outerRef.current!.scrollTo({
              top: newMaxScrollTop,
              behavior: scrollBehavior,
            });
          }
        }

        lastMaxScrollTop = newMaxScrollTop;
      });
      // Observe the inner div so we know when it gets taller.
      ro.observe(innerRef.current!);
      // Observer the outer div so we know when it gets shorter (e.g. when the window is resized).
      // Firefox has an issue where ResizeObserver doesn't work right with scrollable elements,
      // so we observe an extra wrapper div instead.
      ro.observe(extraOuterRef.current!);

      // Workaround for Firefox issue where smooth scrolling doesn't work when the tab is hidden.
      // We immediately apply any on-going autoscroll's position when the tab is hidden
      // (and above, any autoscrolls while hidden are made instant instead of smooth).
      function onVisibilityChange() {
        if (document.visibilityState === "hidden") {
          if (isAutoScrollToEndHappening()) {
            activeAutoScrollToEnd.current = null;
            outerRef.current!.scrollTop =
              outerRef.current!.scrollHeight - outerRef.current!.clientHeight;
          }
        }
      }
      document.addEventListener("visibilitychange", onVisibilityChange);
      return () => {
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    },
    // TODO use useEffectEvent for scrolling so this useEffect block doesn't need to
    // depend on scrollBehavior or endThreshold props here.
    [scrollBehavior, endThreshold],
  );

  // This event handler is only used when scrollBehavior !== "instant".
  function scrollContainerOnScroll() {
    // General note: we need to be careful about putting much logic here in
    // this scroll handler, because both scroll events and resize observer events
    // are separately delivered asynchronously with possible delays by the browser
    // (especially when the page is hidden), and it's possible to mistakenly rely on
    // false assumptions about the ordering of these event handlers.

    // Update or clear the activeAutoScrollToBottom value.
    // This is expected to get hit frequently while the autoscroll to bottom is happening,
    // because the browser's autoscrolling will trigger this handler many times during the
    // animation.
    if (activeAutoScrollToEnd.current) {
      if (
        activeAutoScrollToEnd.current.timestamp <
        Date.now() - autoScrollMaxTime
      ) {
        // The lastAutoScroll is outdated.
        // Clear it while we're looking here just to save us some effort later.
        activeAutoScrollToEnd.current = null;
      } else {
        const outerDivScrollTop = outerRef.current!.scrollTop;
        if (outerDivScrollTop < activeAutoScrollToEnd.current.fromHeight) {
          // If we scroll up above where the autoscroll started, the user must have interrupted it.
          activeAutoScrollToEnd.current = null;
        } else {
          // Otherwise, ratchet forward the last known autoscroll position, so we can detect if
          // the user scrolls up above this new point.
          activeAutoScrollToEnd.current.fromHeight = outerDivScrollTop;
        }
      }
    }
  }

  return (
    // This outermost div exists because Firefox has a bug where ResizeObservers don't work right
    // on scrollable elements.
    <div
      ref={extraOuterRef}
      style={{ display: "flex", minHeight: 0, ...props.style }}
      className={props.className}
    >
      <div
        ref={outerRef}
        style={{
          flex: 1,
          overflow: "hidden auto",
          // TODO should this be a prop? Do we need it?
          // Can we move it to the outer element so it can be overridden?
          padding: "4px",
        }}
        onScroll={
          scrollBehavior === "instant" ? undefined : scrollContainerOnScroll
        }
      >
        <div ref={innerRef}>{props.children}</div>
      </div>
    </div>
  );
}
