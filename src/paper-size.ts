import {Vec2, vmul} from "./vec";

function vround(v: Vec2, digits: number = 2): Vec2 {
  return { x: Number(v.x.toFixed(digits)), y: Number(v.y.toFixed(digits)) };
}

export class PaperSize {

  public get landscape(): PaperSize {
    return new PaperSize({
      x: Math.max(this.size.x, this.size.y),
      y: Math.min(this.size.x, this.size.y),
    });
  }

  public get portrait(): PaperSize {
    return new PaperSize({
      x: Math.min(this.size.x, this.size.y),
      y: Math.max(this.size.x, this.size.y),
    });
  }

  public get isLandscape(): boolean {
    return this.size.x === Math.max(this.size.x, this.size.y);
  }

  public static standard: {[name: string]: PaperSize} = {
    "USLetter": new PaperSize(vround(vmul({x: 8.5, y: 11}, 25.4))),
    "USLegal": new PaperSize(vround(vmul({x: 8.5, y: 14}, 25.4))),
    "ArchA": new PaperSize(vround(vmul({x: 9, y: 12}, 25.4))),
    "A3": new PaperSize({x: 297, y: 420}),
    "A4": new PaperSize({x: 210, y: 297}),
    "A5": new PaperSize({x: 148, y: 210}),
    "A6": new PaperSize({x: 105, y: 148}),
    "Eggshell Classic": new PaperSize({x: 100, y: 60}),
    "Eggshell Holo": new PaperSize({x: 100, y: 70}),
    "3x2": new PaperSize(vround(vmul({x: 3, y: 2}, 25.4))),
    "3x3": new PaperSize(vround(vmul({x: 3, y: 3}, 25.4))),
    "3x5": new PaperSize(vround(vmul({x: 3, y: 5}, 25.4))),
    "4x4": new PaperSize(vround(vmul({x: 4, y: 4}, 25.4))),
    "4x6": new PaperSize(vround(vmul({x: 4, y: 6}, 25.4))),
    "6x6": new PaperSize(vround(vmul({x: 6, y: 6}, 25.4))),
    "6x8": new PaperSize(vround(vmul({x: 6, y: 8}, 25.4))),
    "8x8": new PaperSize(vround(vmul({x: 8, y: 8}, 25.4))),
    "5x7": new PaperSize(vround(vmul({x: 5, y: 7}, 25.4))),
    "12x6": new PaperSize(vround(vmul({x: 12, y: 6}, 25.4))),
    "12x9": new PaperSize(vround(vmul({x: 12, y: 9}, 25.4))),
    "12x12": new PaperSize(vround(vmul({x: 12, y: 12}, 25.4))),
    "12x16": new PaperSize(vround(vmul({x: 12, y: 16}, 25.4))),
    "14x11": new PaperSize(vround(vmul({x: 14, y: 11}, 25.4))),
    "17x11": new PaperSize(vround(vmul({x: 17, y: 11}, 25.4))),
    "18x14": new PaperSize(vround(vmul({x: 18, y: 14}, 25.4))),
    "19x12.5": new PaperSize(vround(vmul({x: 19, y: 12.5}, 25.4))),
    
  };
  public size: Vec2;
  public constructor(size: Vec2) {
    this.size = size;
  }
}
