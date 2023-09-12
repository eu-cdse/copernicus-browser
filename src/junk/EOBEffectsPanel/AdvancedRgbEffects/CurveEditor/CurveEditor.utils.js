import paper from 'paper';

import { NUMBER_OF_RGB_VALUES, CURVE_EDITOR_CANVAS_SIZE, MAX_COLOR_VALUE } from '../AdvancedRgbEffects';

export function capToRange(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function transformCurvePoints(points, canvasSize, maxColorValue) {
  const curvePoints = points.map((p) => {
    let x = capToRange(p.position.x, 0, canvasSize);
    x = (x * maxColorValue) / canvasSize;

    let y = capToRange(p.position.y, 0, canvasSize);
    y = ((canvasSize - y) * maxColorValue) / canvasSize;

    return { x, y };
  });

  return curvePoints;
}

export function computeIntersections(values, originalPath, canvasSize, maxColorValue) {
  const filledValues = values.map((v, i) => {
    if (v !== null && v !== undefined) {
      return v;
    }

    const xPosition = (i * canvasSize) / (values.length - 1);
    const pathMinX = originalPath.getPointAt(0).x;
    const pathMaxX = originalPath.getPointAt(originalPath.length).x;
    if (!(pathMinX <= xPosition && xPosition <= pathMaxX)) {
      return v;
    }

    const buffer = 100;
    const top = new paper.Point(xPosition, 0 - buffer);
    const bottom = new paper.Point(xPosition, canvasSize + buffer);
    const path = new paper.Path.Line(top, bottom);

    let intersections = originalPath.getIntersections(path);
    if (intersections.length === 0) {
      return v;
    }
    const yPosition = capToRange(intersections[0].point.y, 0, canvasSize);

    const xValue = (xPosition * maxColorValue) / canvasSize;
    const yValue = ((canvasSize - yPosition) * maxColorValue) / canvasSize;

    return { x: xValue, y: yValue };
  });

  return filledValues;
}

export function computeNewValuesFromPaths(paths, canvasSize, maxColorValue) {
  const { startPath, innerPath, endPath } = paths;
  // assumption that images are PNG or JPG: length = 256 (includes all possible R / G / B values)
  // should be improved in the future to allow for other formats
  let newValues = new Array(NUMBER_OF_RGB_VALUES).fill(null);
  if (startPath.length > 0) {
    newValues = computeIntersections(newValues, startPath, canvasSize, maxColorValue);
  }
  if (innerPath.length > 0) {
    newValues = computeIntersections(newValues, innerPath, canvasSize, maxColorValue);
  }
  if (endPath.length > 0) {
    newValues = computeIntersections(newValues, endPath, canvasSize, maxColorValue);
  }

  return newValues;
}

export function computeNewValuesFromPoints(points) {
  const canvas = document.createElement('canvas');
  const scope = new paper.PaperScope();
  scope.setup(canvas);

  const transformedPoints = points.map((p) => {
    const x = (p.x * CURVE_EDITOR_CANVAS_SIZE) / MAX_COLOR_VALUE;
    const y = CURVE_EDITOR_CANVAS_SIZE - (p.y * CURVE_EDITOR_CANVAS_SIZE) / MAX_COLOR_VALUE;
    return { x, y };
  });

  const startPoint = transformedPoints[0];
  const endPoint = transformedPoints[transformedPoints.length - 1];
  const innerPoints = transformedPoints.filter((p) => p !== startPoint && p !== endPoint);

  let startPath = new paper.Path();
  startPath.add(new paper.Point(-1, startPoint.y), new paper.Point(startPoint));

  let endPath = new paper.Path();
  endPath.add(new paper.Point(endPoint), new paper.Point(CURVE_EDITOR_CANVAS_SIZE + 1, endPoint.y));

  let innerPath = new paper.Path();
  innerPath.add(new paper.Point(startPoint), new paper.Point(endPoint));
  innerPoints.forEach((p) => {
    let index = innerPath.segments.findIndex((s) => s.point.x > p.x);
    innerPath.insert(index, new paper.Point(p));
  });
  innerPath.smooth({ type: 'catmull-rom', factor: 0.5 }); // 0.5 = no self-intersections

  const paths = { startPath, innerPath, endPath };
  const values = computeNewValuesFromPaths(paths, CURVE_EDITOR_CANVAS_SIZE, MAX_COLOR_VALUE);

  scope.project.clear();
  canvas.remove();
  return values;
}
