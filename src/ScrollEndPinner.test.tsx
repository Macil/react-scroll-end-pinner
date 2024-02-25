import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import ScrollEndPinner from "./ScrollEndPinner.js";

const mockResizeObservers: MockResizeObserver[] = [];

afterEach(() => {
  mockResizeObservers.length = 0;
});

class MockResizeObserver {
  _observedElements = new Map<Element, ResizeObserverOptions | undefined>();
  _callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this._callback = callback;
    mockResizeObservers.push(this);
  }

  observe(target: Element, options?: ResizeObserverOptions): void {
    this._observedElements.set(target, options);
  }
  unobserve(target: Element): void {
    this._observedElements.delete(target);
  }
  disconnect(): void {
    this._observedElements.clear();
  }
}

(globalThis.ResizeObserver as any) = MockResizeObserver;

test("mounts", async () => {
  render(
    <ScrollEndPinner>
      <div data-testid="content">A</div>
    </ScrollEndPinner>,
  );

  await screen.findByTestId("content");

  expect(screen.getByTestId("content")).toHaveTextContent("A");

  // TODO test the behavior of the component
});
