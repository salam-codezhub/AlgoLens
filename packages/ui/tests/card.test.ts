import { describe, expect, it } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/components/card.js";

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

describe("Card components", () => {
  it("renders Card with default classes and children", () => {
    const element = getElementProps(Card({ children: "Content" }));

    expect(element.type).toBe("div");
    expect(element.props.children).toBe("Content");
    expect(element.props.className).toContain("bg-card");
    expect(element.props.className).toContain("rounded-xl");
    expect(element.props.className).toContain("border");
  });

  it("merges a custom class name into Card", () => {
    const element = getElementProps(Card({ className: "custom-card", children: "Content" }));

    expect(element.props.className).toContain("custom-card");
  });

  it("renders CardHeader with layout classes", () => {
    const element = getElementProps(CardHeader({ children: "Header" }));

    expect(element.props.className).toContain("flex");
    expect(element.props.className).toContain("p-6");
    expect(element.props.children).toBe("Header");
  });

  it("renders CardTitle with title classes", () => {
    const element = getElementProps(CardTitle({ children: "Title" }));

    expect(element.props.className).toContain("leading-none");
    expect(element.props.className).toContain("font-semibold");
    expect(element.props.children).toBe("Title");
  });

  it("renders CardDescription with muted text classes", () => {
    const element = getElementProps(CardDescription({ children: "Description" }));

    expect(element.props.className).toContain("text-muted-foreground");
    expect(element.props.className).toContain("text-sm");
    expect(element.props.children).toBe("Description");
  });

  it("renders CardContent with padding classes", () => {
    const element = getElementProps(CardContent({ children: "Body" }));

    expect(element.props.className).toContain("p-6");
    expect(element.props.className).toContain("pt-0");
    expect(element.props.children).toBe("Body");
  });

  it("renders CardFooter with alignment classes", () => {
    const element = getElementProps(CardFooter({ children: "Footer" }));

    expect(element.props.className).toContain("flex");
    expect(element.props.className).toContain("items-center");
    expect(element.props.className).toContain("pt-0");
    expect(element.props.children).toBe("Footer");
  });

  it("merges custom classes for subcomponents", () => {
    const header = getElementProps(CardHeader({ className: "header-custom" }));
    const title = getElementProps(CardTitle({ className: "title-custom" }));
    const description = getElementProps(CardDescription({ className: "description-custom" }));
    const content = getElementProps(CardContent({ className: "content-custom" }));
    const footer = getElementProps(CardFooter({ className: "footer-custom" }));

    expect(header.props.className).toContain("header-custom");
    expect(title.props.className).toContain("title-custom");
    expect(description.props.className).toContain("description-custom");
    expect(content.props.className).toContain("content-custom");
    expect(footer.props.className).toContain("footer-custom");
  });
});
