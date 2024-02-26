import "./DOMRectReadOnlyPolyfill";

export function waitForResizeObserverCallbacks(): Promise<void> {
  return Promise.resolve();
}

const resizeObserversAndOptionsByElement = new WeakMap<
  Element,
  Map<MockResizeObserver, ResizeObserverOptions | undefined>
>();

class MockResizeObserver {
  _callback: ResizeObserverCallback;
  #observedElements = new Set<Element>();

  constructor(callback: ResizeObserverCallback) {
    this._callback = callback;
  }

  observe(target: Element, options?: ResizeObserverOptions): void {
    let resizeObservers = resizeObserversAndOptionsByElement.get(target);
    if (!resizeObservers) {
      resizeObservers = new Map();
      resizeObserversAndOptionsByElement.set(target, resizeObservers);
    }
    resizeObservers.set(this, options);
    this.#observedElements.add(target);
  }
  unobserve(target: Element): void {
    const resizeObservers = resizeObserversAndOptionsByElement.get(target);
    if (resizeObservers) {
      resizeObservers.delete(this);
    }
    this.#observedElements.delete(target);
  }
  disconnect(): void {
    for (const element of this.#observedElements) {
      this.unobserve(element);
    }
  }
}

(globalThis.ResizeObserver as any) = MockResizeObserver;

const scrollHeights = new WeakMap<Element, number>();

export function setScrollHeight(element: Element, val: number) {
  scrollHeights.set(element, val);
}

Object.defineProperty(Element.prototype, "scrollHeight", {
  configurable: true,
  get() {
    return scrollHeights.get(this) ?? 0;
  },
});

const clientHeights = new WeakMap<Element, number>();

let scheduledResizeObserverElements = new Set<Element>();

export function setClientHeight(element: Element, val: number) {
  clientHeights.set(element, val);

  // Trigger the ResizeObserver callbacks
  if (!scheduledResizeObserverElements.has(element)) {
    const wasEmpty = scheduledResizeObserverElements.size === 0;
    scheduledResizeObserverElements.add(element);
    if (wasEmpty) {
      Promise.resolve().then(() => {
        const batchToProcess = scheduledResizeObserverElements;
        scheduledResizeObserverElements = new Set();

        const resizeObserversToCall = new Map<
          MockResizeObserver,
          ResizeObserverEntry[]
        >();

        for (const element of batchToProcess) {
          const resizeObservers =
            resizeObserversAndOptionsByElement.get(element);
          if (resizeObservers) {
            for (const [resizeObserver, _options] of resizeObservers) {
              let resizeObserverEntries =
                resizeObserversToCall.get(resizeObserver);
              if (!resizeObserverEntries) {
                resizeObserverEntries = [];
                resizeObserversToCall.set(
                  resizeObserver,
                  resizeObserverEntries,
                );
              }
              const { clientHeight, clientWidth } = element;
              resizeObserverEntries.push({
                devicePixelContentBoxSize: [],
                contentBoxSize: [
                  { blockSize: clientHeight, inlineSize: clientWidth },
                ],
                borderBoxSize: [
                  { blockSize: clientHeight, inlineSize: clientWidth },
                ],
                contentRect: DOMRectReadOnly.fromRect({
                  height: clientHeight,
                  width: clientWidth,
                }),
                target: element,
              });
            }
          }
        }

        for (const [resizeObserver, entries] of resizeObserversToCall) {
          resizeObserver._callback(entries, resizeObserver);
        }
      });
    }
  }
}

Object.defineProperty(Element.prototype, "clientHeight", {
  configurable: true,
  get() {
    return clientHeights.get(this) ?? 0;
  },
});

// Mock scrollTo implementation
Element.prototype.scrollTo = function (
  ...args: [number, number] | [ScrollToOptions?]
) {
  if (args.length === 2) {
    const [left, top] = args;
    this.scrollLeft = left;
    this.scrollTop = top;
  } else {
    const options = args[0];
    if (options) {
      if (options.behavior === "smooth") {
        throw new Error("smooth scroll not implemented in test");
      }
      if (options.left !== undefined) {
        this.scrollLeft = options.left;
      }
      if (options.top !== undefined) {
        this.scrollTop = options.top;
      }
    }
  }
};
