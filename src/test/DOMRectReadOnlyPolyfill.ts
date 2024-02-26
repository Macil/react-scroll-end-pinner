if (!globalThis.DOMRectReadOnly) {
  class MockDomRectReadOnly {
    readonly top: number;
    readonly bottom: number;
    readonly left: number;
    readonly right: number;

    constructor(
      public readonly x: number,
      public readonly y: number,
      public readonly width: number,
      public readonly height: number,
    ) {
      this.top = y;
      this.bottom = y + height;
      this.left = x;
      this.right = x + width;
    }

    static fromRect(other?: DOMRectInit) {
      return new MockDomRectReadOnly(
        other?.x ?? 0,
        other?.y ?? 0,
        other?.width ?? 0,
        other?.height ?? 0,
      );
    }
  }

  (globalThis.DOMRectReadOnly as any) = MockDomRectReadOnly;
}
