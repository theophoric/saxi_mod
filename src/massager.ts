import * as Optimization from "optimize-paths";
import * as Planning from "./planning";
import {Device, Plan, PlanOptions, defaultPlanOptions} from "./planning";
import {dedupPoints, scaleToPaper, cropToMargins} from "./util";
import {Vec2, vmul, vrot} from "./vec";

// CSS, and thus SVG, defines 1px = 1/96th of 1in
// https://www.w3.org/TR/css-values-4/#absolute-lengths
const svgUnitsPerInch = 96
const mmPerInch = 25.4
const mmPerSvgUnit = mmPerInch / svgUnitsPerInch

export function replan(inPaths: Vec2[][], planOptions: PlanOptions): Plan {
  let paths = inPaths;

  // Rotate drawing around center of paper to handle plotting portrait drawings
  // along y-axis of plotter
  // Rotate around the center of the page, but in SvgUnits (not mm)
  if (planOptions.rotateDrawing !== 0) {
    console.time("rotating paths");
    paths = paths.map((pl) => pl.map((p) => vrot(p,
      vmul({x:planOptions.paperSize.size.x/2, y: planOptions.paperSize.size.y/2}, 1/mmPerSvgUnit),
      planOptions.rotateDrawing)
    ));
    console.timeEnd("rotating paths");
  }

  // Compute scaling using _all_ the paths, so it's the same no matter what
  // layers are selected.
  if (planOptions.fitPage) {
    paths = scaleToPaper(paths, planOptions.paperSize, planOptions.marginMm);
  } else {
    paths = paths.map(ps => ps.map(p => vmul(p, mmPerSvgUnit)))
    if (planOptions.cropToMargins) {
      paths = cropToMargins(paths, planOptions.paperSize, planOptions.marginMm)
    }
  }

  // Rescaling loses the stroke info, so refer back to the original paths to
  // filter based on the stroke. Rescaling doesn't change the number or order
  // of the paths.
  if (planOptions.layerMode === 'group') {
    paths = paths.filter((path, i) => planOptions.selectedGroupLayers.has((inPaths[i] as any).groupId));
  } else if (planOptions.layerMode === 'stroke') {
    paths = paths.filter((path, i) => planOptions.selectedStrokeLayers.has((inPaths[i] as any).stroke));
  }

  if (planOptions.pointJoinRadius > 0) {
    paths = paths.map((p) => dedupPoints(p, planOptions.pointJoinRadius));
  }

  if (planOptions.sortPaths) {
    console.time("sorting paths");
    paths = Optimization.reorder(paths);
    console.timeEnd("sorting paths");
  }

  if (planOptions.minimumPathLength > 0) {
    console.time("eliding short paths");
    paths = Optimization.elideShorterThan(paths, planOptions.minimumPathLength);
    console.timeEnd("eliding short paths");
  }
  
  if (planOptions.maximumPathLength < defaultPlanOptions.maximumPathLength) {
    console.time("eliding long paths");
    paths = Optimization.elideShorterThan(paths, planOptions.maximumPathLength);
    console.timeEnd("eliding long paths");
  }

  if (planOptions.pathJoinRadius > 0) {
    console.time("joining nearby paths");
    paths = Optimization.merge(
      paths,
      planOptions.pathJoinRadius
    );
    console.timeEnd("joining nearby paths");
  }

  // Convert the paths to units of "steps".
  paths = paths.map((ps) => ps.map((p) => vmul(p, Device.Axidraw.stepsPerMm)));

  // And finally, motion planning.
  console.time("planning pen motions");
  const plan = Planning.plan(paths, {
    penUpPos: Device.Axidraw.penPctToPos(planOptions.penUpHeight),
    penDownPos: Device.Axidraw.penPctToPos(planOptions.penDownHeight),
    penDownProfile: {
      acceleration: planOptions.penDownAcceleration * Device.Axidraw.stepsPerMm,
      maximumVelocity: planOptions.penDownMaxVelocity * Device.Axidraw.stepsPerMm,
      corneringFactor: planOptions.penDownCorneringFactor * Device.Axidraw.stepsPerMm,
    },
    penUpProfile: {
      acceleration: planOptions.penUpAcceleration * Device.Axidraw.stepsPerMm,
      maximumVelocity: planOptions.penUpMaxVelocity * Device.Axidraw.stepsPerMm,
      corneringFactor: 0,
    },
    penDropDuration: planOptions.penDropDuration,
    penLiftDuration: planOptions.penLiftDuration,
  });
  console.timeEnd("planning pen motions");

  return plan;
}
