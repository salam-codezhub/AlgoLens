import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/components/tabs.js";

interface ElementProps {
  readonly className?: string;
  readonly children?: unknown;
  readonly value?: string;
}

interface TestElement {
  readonly type: unknown;
  readonly props: ElementProps;
}

function getElementProps(element: unknown): TestElement {
  return element as TestElement;
}

describe("Tabs components", () => {
  it("exports the Radix Tabs root", () => {
    expect(Tabs).toBeDefined();
  });

  it("renders TabsList with default classes", () => {
    const element = getElementProps(TabsList({ children: "List" }));

    expect(element.type).toBeDefined();
    expect(element.props.className).toContain("bg-secondary");
    expect(element.props.className).toContain("inline-flex");
    expect(element.props.className).toContain("h-9");
    expect(element.props.className).toContain("rounded-lg");
    expect(element.props.children).toBe("List");
  });

  it("renders TabsTrigger with default classes", () => {
    const element = getElementProps(
      TabsTrigger({
        value: "overview",
        children: "Overview",
      })
    );

    expect(element.type).toBeDefined();
    expect(element.props.value).toBe("overview");
    expect(element.props.className).toContain("inline-flex");
    expect(element.props.className).toContain("rounded-md");
    expect(element.props.className).toContain("font-medium");
    expect(element.props.children).toBe("Overview");
  });

  it("renders TabsContent with default spacing", () => {
    const element = getElementProps(
      TabsContent({
        value: "overview",
        children: "Content",
      })
    );

    expect(element.type).toBeDefined();
    expect(element.props.value).toBe("overview");
    expect(element.props.className).toContain("mt-2");
    expect(element.props.children).toBe("Content");
  });

  it("merges custom classes into all tab components", () => {
    const list = getElementProps(TabsList({ className: "list-custom" }));
    const trigger = getElementProps(
      TabsTrigger({ className: "trigger-custom", value: "custom-trigger" })
    );
    const content = getElementProps(
      TabsContent({ className: "content-custom", value: "custom-content" })
    );

    expect(list.props.className).toContain("list-custom");
    expect(trigger.props.className).toContain("trigger-custom");
    expect(content.props.className).toContain("content-custom");
  });
});
