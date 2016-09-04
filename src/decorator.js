/**
 * Generates svg cloud for polygon
 *
 * @param  {Polygon} polygon
 *
 * @return {SVG Path}
 */

const X = 0;
const Y = 1;
const FLOAT_PRECISE = 0.000001;


const lineLength = (line) => {
  const pointA = line[0];
  const pointB = line[1];

  return Math.sqrt(Math.pow((pointB[X] - pointA[X]), 2) +
    Math.pow((pointB[Y] - pointA[Y]), 2));
};


const getIntersection = (line, length) => {
  let pointC = null;
  const pointA = line[0];
  const pointB = line[1];
  let delta;
  let xPoint;
  let yPoint;
  const fullLen = lineLength(line);

  if (Math.abs(fullLen - length) < FLOAT_PRECISE) {
    pointC = pointB;
  } else if (fullLen > length) {
    delta = length / (fullLen - length);
    xPoint = (pointA[X] + delta * pointB[X]) / (1 + delta);
    yPoint = (pointA[Y] + delta * pointB[Y]) / (1 + delta);
    pointC = [xPoint, yPoint];
  }

  return pointC;
};


const cloudALine = (line, radius, inward, swapping) => {
  let point = getIntersection(line, radius * 2);
  let remainingLine = line;
  let arc;
  const cloud = [`M${line[0][X]},${line[0][Y]}`];
  let sweep = true === inward ? 0 : 1;
  let lArc = true === inward ? 0 : 1;

  while (point) {
    arc = ` A${radius},${radius} 0 ${lArc},${sweep} ${point[X]},${point[Y]}`;
    cloud.push(arc);
    remainingLine = [point, remainingLine[1]];
    point = getIntersection(remainingLine, radius * 2);
    if (true === swapping) {
      sweep ^= 1;
      lArc ^= 1;
    }
  }

  return cloud.join('');
};


const fixRadiusToFitLine = (line, radius) => {
  const length = lineLength(line);
  const segments = Math.round(length / (2 * radius) + 0.5);

  return 0 < length ? length / segments / 2 : radius;
};


const svgCloud = (polyline, radius, closed, inward, swapping) => {
  let cloud = [];
  let ind = 1;
  let line;
  const r = 0 < radius ? radius : 1;
  const cnt = polyline.length;
  let fittedRadius;

  for (; ind < cnt; ++ind) {
    line = [polyline[ind - 1], polyline[ind]];
    fittedRadius = fixRadiusToFitLine(line, r);
    if (true === swapping) {
      fittedRadius /= 2;
    }
    cloud.push(cloudALine(line, fittedRadius, inward, swapping));
  }

  // close to get polygon
  if (true === closed && 1 < cnt) {
    line = [polyline[ind - 1], polyline[0]];
    fittedRadius = fixRadiusToFitLine(line, r);
    if (true === swapping) {
      fittedRadius /= 2;
    }
    cloud.push(cloudALine(line, fittedRadius, inward, swapping));
  }

  // SVG complains about empty path strings
  return 0 === cloud.length ? 'M0,0' : cloud.join(' ').trim();
};


module.exports = svgCloud;
