import { Kind } from "./model";
export interface Sh { k: Kind; n: string }
const S = (k: Kind, n: string): Sh => ({ k, n });
export const STENCILS: Record<string, Sh[]> = {
  "Quick Shapes": [S("rect", "Rectangle"), S("round", "Rounded Rectangle"), S("ellipse", "Ellipse"), S("diamond", "Diamond"), S("terminator", "Start/End"), S("parallelogram", "Data"), S("document", "Document"), S("cylinder", "Database"), S("arrow", "Arrow"), S("text", "Text"), S("todo", "To-do Box")],
  "Basic Shapes": [S("rect", "Rectangle"), S("square", "Square"), S("circle", "Circle"), S("ellipse", "Ellipse"), S("rtriangle", "Right Triangle"), S("triangle", "Triangle"), S("rotri", "Rotated Triangle"), S("pentagon", "Pentagon"), S("hexagon", "Hexagon"), S("heptagon", "Heptagon"), S("octagon", "Octagon"), S("decagon", "Decagon"), S("cylinder", "Can"), S("parallelogram", "Parallelogram"), S("trapezoid", "Trapezoid"), S("diamond", "Diamond"), S("cross", "Cross"), S("chevron", "Chevron"), S("cube", "Cube"), S("drop", "Drop"), S("semicircle", "Semi Circle"), S("semiellipse", "Semi Ellipse"), S("cone", "Cone"), S("invcone", "Inverted Cone"), S("pyramid", "Pyramid"), S("pointedoval", "Pointed Oval"), S("funnel", "Funnel"), S("gear", "Gear"), S("star4", "4-Point Star"), S("star", "5-Point Star")],
  "Flowchart": [S("terminator", "Start/End"), S("rect", "Process"), S("diamond", "Decision"), S("parallelogram", "Data"), S("document", "Document"), S("cylinder", "Database"), S("round", "Alternate Process"), S("hexagon", "Preparation")],
  "Arrows": [S("arrow", "Right Arrow"), S("larrow", "Left Arrow"), S("uarrow", "Up Arrow"), S("darrow", "Down Arrow"), S("dblarrow", "Double Arrow"), S("chevron", "Chevron")],
  "Callouts & Notes": [S("callout", "Callout"), S("cloud", "Cloud"), S("notepad", "Notepad"), S("note", "Sticky Note"), S("todo", "To-do Box"), S("text", "Text")],
};
export const MORE = ["Flowchart", "Arrows", "Callouts & Notes"];
