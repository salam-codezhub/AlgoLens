import { describe, expect, it } from "vitest";
import { Input } from "../src/components/input.js";

interface ElementProps {
  readonly className?: string;
  readonly type?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

interface TestElement {
  readonly type: unknown;
  readonly props: ElementProps;
}

function getElementProps(element: unknown): TestElement {
  return element as TestElement;
}

describe("Input", () => {
  it("renders an input with default classes", () => {
    const element = getElementProps(Input({}));

    expect(element.type).toBe("input");
    expect(element.props.className).toContain("border-input");
    expect(element.props.className).toContain("bg-background");
    expect(element.props.className).toContain("h-9");
    expect(element.props.className).toContain("w-full");
    expect(element.props.className).toContain("rounded-md");
  });

  it("applies the supplied input type", () => {
    const element = getElementProps(
      Input({
        type: "password",
      })
    );

    expect(element.props.type).toBe("password");
  });

  it("merges a custom class name", () => {
    const element = getElementProps(
      Input({
        className: "custom-input",
      })
    );

    expect(element.props.className).toContain("custom-input");
  });

  it("passes through standard HTML input props", () => {
    const element = getElementProps(
      Input({
        placeholder: "Enter your code",
        disabled: true,
      })
    );

    expect(element.props.placeholder).toBe("Enter your code");
    expect(element.props.disabled).toBe(true);
  });
});
