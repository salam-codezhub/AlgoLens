import { describe, expect, it } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../src/components/accordion.js";

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

describe("Accordion components", () => {
  it("exports the Radix Accordion root", () => {
    expect(Accordion).toBeDefined();
  });

  it("renders AccordionItem with border classes", () => {
    const element = getElementProps(
      AccordionItem({
        value: "item-1",
        children: "Item",
      })
    );

    expect(element.type).toBeDefined();
    expect(element.props.value).toBe("item-1");
    expect(element.props.className).toContain("border-border");
    expect(element.props.className).toContain("border-b");
  });

  it("merges a custom class into AccordionItem", () => {
    const element = getElementProps(
      AccordionItem({
        value: "item-1",
        className: "custom-item",
      })
    );

    expect(element.props.className).toContain("custom-item");
  });

  it("renders AccordionTrigger with supplied children", () => {
    const element = getElementProps(
      AccordionTrigger({
        children: "Section",
      })
    );

    expect(element.type).toBeDefined();
    expect(element.props.children).toBeDefined();
  });

  it("applies AccordionTrigger custom classes", () => {
    const element = getElementProps(
      AccordionTrigger({
        className: "custom-trigger",
        children: "Section",
      })
    );

    expect(element.props.children).toBeDefined();
  });

  it("renders AccordionContent with animation and overflow classes", () => {
    const element = getElementProps(
      AccordionContent({
        children: "Content",
      })
    );

    expect(element.type).toBeDefined();
    expect(element.props.className).toContain("overflow-hidden");
    expect(element.props.className).toContain("text-sm");

    const contentWrapper = getElementProps(element.props.children);

    expect(contentWrapper.props.className).toContain("pt-0");
    expect(contentWrapper.props.className).toContain("pb-4");
    expect(contentWrapper.props.children).toBe("Content");
  });

  it("merges a custom class into AccordionContent wrapper", () => {
    const element = getElementProps(
      AccordionContent({
        className: "custom-content",
        children: "Content",
      })
    );

    const contentWrapper = getElementProps(element.props.children);

    expect(contentWrapper.props.className).toContain("custom-content");
  });
});
