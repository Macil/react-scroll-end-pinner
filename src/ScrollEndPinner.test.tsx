import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { createRef } from "react";
import {
  setClientHeight,
  setScrollHeight,
  waitForResizeObserverCallbacks,
} from "./test/elementMocks";
import { ScrollEndPinner } from "./ScrollEndPinner";

class TestHelper {
  public readonly extraOuterEl: Element;
  public readonly outerEl: Element;
  public readonly innerEl: Element;

  constructor(public readonly containerElement: Element) {
    this.extraOuterEl = containerElement.firstElementChild!;
    this.outerEl = this.extraOuterEl.firstElementChild!;
    this.innerEl = this.outerEl.firstElementChild!;
  }

  setHeight(outerHeight: number, scrollHeight: number): Promise<void> {
    setClientHeight(this.extraOuterEl, outerHeight);

    setClientHeight(this.outerEl, outerHeight);
    setScrollHeight(this.outerEl, scrollHeight);

    setClientHeight(this.innerEl, scrollHeight);

    return waitForResizeObserverCallbacks();
  }

  getScrollTop(): number {
    return this.outerEl.scrollTop;
  }

  setScrollTop(val: number): void {
    this.outerEl.scrollTop = val;
  }
}

test("works", async () => {
  const containerRef = createRef<HTMLDivElement>();

  render(
    <div ref={containerRef}>
      <ScrollEndPinner>
        <div>content</div>
      </ScrollEndPinner>
    </div>,
  );

  const helper = new TestHelper(containerRef.current!);

  expect(helper.getScrollTop()).toBe(0);

  // expand the scroll height and check we stay pinned to bottom
  await helper.setHeight(100, 200);
  expect(helper.getScrollTop()).toBe(100);

  // expand the scroll height again and check we stay pinned to bottom
  await helper.setHeight(100, 250);
  expect(helper.getScrollTop()).toBe(150);

  // scroll up a bit
  helper.setScrollTop(120);

  // expand the scroll height again and check we are *not* pinned
  await helper.setHeight(100, 300);
  expect(helper.getScrollTop()).toBe(120);
});
