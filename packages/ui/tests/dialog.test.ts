import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "../src/components/dialog.js";

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

describe("Dialog components", () => {
  it("exports the Radix dialog primitives", () => {
    expect(Dialog).toBeDefined();
    expect(DialogTrigger).toBeDefined();
    expect(DialogClose).toBeDefined();
  });

  it("renders DialogOverlay with default classes", () => {
    const element = getElementProps(DialogOverlay({}));

    expect(element.props.className).toContain("fixed");
    expect(element.props.className).toContain("inset-0");
    expect(element.props.className).toContain("z-50");
    expect(element.props.className).toContain("bg-black/60");
  });

  it("merges custom class into DialogOverlay", () => {
    const element = getElementProps(DialogOverlay({ className: "custom-overlay" }));

    expect(element.props.className).toContain("custom-overlay");
  });

  it("renders DialogHeader with layout classes", () => {
    const element = getElementProps(DialogHeader({ children: "Header" }));

    expect(element.props.className).toContain("flex");
    expect(element.props.className).toContain("flex-col");
    expect(element.props.className).toContain("text-center");
    expect(element.props.children).toBe("Header");
  });

  it("renders DialogFooter with responsive layout classes", () => {
    const element = getElementProps(DialogFooter({ children: "Footer" }));

    expect(element.props.className).toContain("flex");
    expect(element.props.className).toContain("flex-col-reverse");
    expect(element.props.className).toContain("sm:flex-row");
    expect(element.props.children).toBe("Footer");
  });

  it("renders DialogTitle with typography classes", () => {
    const element = getElementProps(DialogTitle({ children: "Title" }));

    expect(element.props.className).toContain("text-lg");
    expect(element.props.className).toContain("font-semibold");
    expect(element.props.children).toBe("Title");
  });

  it("renders DialogDescription with muted text classes", () => {
    const element = getElementProps(DialogDescription({ children: "Description" }));

    expect(element.props.className).toContain("text-muted-foreground");
    expect(element.props.className).toContain("text-sm");
    expect(element.props.children).toBe("Description");
  });

  it("merges custom classes into dialog wrappers", () => {
    const header = getElementProps(DialogHeader({ className: "header-custom" }));
    const footer = getElementProps(DialogFooter({ className: "footer-custom" }));
    const title = getElementProps(DialogTitle({ className: "title-custom" }));
    const description = getElementProps(DialogDescription({ className: "description-custom" }));

    expect(header.props.className).toContain("header-custom");
    expect(footer.props.className).toContain("footer-custom");
    expect(title.props.className).toContain("title-custom");
    expect(description.props.className).toContain("description-custom");
  });

  it("renders DialogContent with supplied children inside the portal", () => {
    const element = getElementProps(DialogContent({ children: "Dialog body" }));

    const children = element.props.children;

    expect(Array.isArray(children)).toBe(true);

    if (Array.isArray(children)) {
      expect(children).toHaveLength(2);

      const content = getElementProps(children[1]);
      expect(content.props.children).toBeDefined();

      const contentChildren = content.props.children;

      expect(Array.isArray(contentChildren)).toBe(true);

      if (Array.isArray(contentChildren)) {
        expect(contentChildren[0]).toBe("Dialog body");
      }
    }
  });
});
