import { describe, expect, it } from "vitest";
import { Button } from "../src/components/button.js";

interface ElementProps {
  readonly className?: string;
  readonly children?: unknown;
}

interface TestElement {
  readonly type: unknown;
  readonly props: ElementProps;
}

function getElementProps(element: unknown): TestElement {
  return element as TestElement;
}

describe("Button", () => {
  it("renders a button by default", () => {
    const element = getElementProps(Button({ children: "Click" }));

    expect(element.type).toBe("button");
    expect(element.props.children).toBe("Click");
    expect(element.props.className).toContain("bg-primary");
    expect(element.props.className).toContain("h-9");
  });

  it("applies the destructive variant and large size", () => {
    const element = getElementProps(
      Button({
        variant: "destructive",
        size: "lg",
        children: "Delete",
      })
    );

    expect(element.type).toBe("button");
    expect(element.props.className).toContain("bg-destructive");
    expect(element.props.className).toContain("h-10");
  });

  it("applies the outline variant and small size", () => {
    const element = getElementProps(
      Button({
        variant: "outline",
        size: "sm",
        children: "Cancel",
      })
    );

    expect(element.props.className).toContain("border");
    expect(element.props.className).toContain("h-8");
    expect(element.props.className).toContain("text-xs");
  });

  it("supports custom class names", () => {
    const element = getElementProps(
      Button({
        className: "custom-class",
        children: "Custom",
      })
    );

    expect(element.props.className).toContain("custom-class");
  });

  it("renders through Slot when asChild is true", () => {
    const element = getElementProps(
      Button({
        asChild: true,
        children: "Link",
      })
    );

    expect(element.type).toBeDefined();
    expect(element.props.children).toBe("Link");
  });
});
