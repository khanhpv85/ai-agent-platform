/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVICE_URL: string
  readonly VITE_COMPANY_SERVICE_URL: string
  readonly VITE_AI_SERVICE_URL: string
  readonly VITE_APP_TITLE: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __DEV__: boolean;

// JSX type definitions for HTML and SVG elements
declare namespace JSX {
  interface IntrinsicElements {
    // HTML elements
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    strong: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    
    // SVG elements
    svg: React.SVGProps<SVGSVGElement>;
    g: React.SVGProps<SVGGElement>;
    path: React.SVGProps<SVGPathElement>;
    circle: React.SVGProps<SVGCircleElement>;
    rect: React.SVGProps<SVGRectElement>;
    defs: React.SVGProps<SVGDefsElement>;
    pattern: React.SVGProps<SVGPatternElement>;
    foreignObject: React.SVGProps<SVGForeignObjectElement>;
    text: React.SVGProps<SVGTextElement>;
  }
}
