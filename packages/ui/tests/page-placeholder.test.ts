import { describe, expect, it } from "vitest";
import { PagePlaceholder } from "../src/page-placeholder.js";

interface ElementProps {
  readonly ["aria-labelledby"]?: string;
  readonly id?: string;
  readonly children?: unknown;
}

interface TestElement {
  readonly type: unknown;
  readonly props: ElementProps;
}

function getElementProps(element: unknown): TestElement {
  return element as TestElement;
}

describe("PagePlaceholder", () => {
  it("creates a section with the supplied title and description", () => {
    const element = getElementProps(
      PagePlaceholder({
        title: "Dashboard",
        description: "Dashboard content will appear here.",
      })
    );

    expect(element.type).toBe("section");
    expect(element.props["aria-labelledby"]).toBe("page-placeholder-title");

    const children = element.props.children;
    expect(Array.isArray(children)).toBe(true);

    if (Array.isArray(children)) {
      expect(children).toHaveLength(2);
    }
  });

  it("renders the title and description values", () => {
    const element = getElementProps(
      PagePlaceholder({
        title: "Security",
        description: "Security analysis results.",
      })
    );

    const children = element.props.children;

    expect(Array.isArray(children)).toBe(true);

    if (Array.isArray(children)) {
      const heading = getElementProps(children[0]);
      const paragraph = getElementProps(children[1]);

      expect(heading.type).toBe("h1");
      expect(heading.props.id).toBe("page-placeholder-title");
      expect(heading.props.children).toBe("Security");

      expect(paragraph.type).toBe("p");
      expect(paragraph.props.children).toBe("Security analysis results.");
    }
  });
});
