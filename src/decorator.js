
/**
 * Generates svg cloud for polygon
 *
 * @param  {Polygon} poligon
 *
 * @return {Path}
 */

// let lineSegmentIntersection = (circle, radius, pointA, pointB) => {
//   const xShift = circle.x;
//   const yShift = circle.y;
//
//   //Recet circle to (0,0) coordinate
//   circle.x = 0;
//   circle.y = 0;
//   pointA.x -= xShift;
//   pointA.y -= yShift;
//   pointB.x -= xShift;
//   pointB.y -= yShift;
//
//   let k = (pointB.y - pointA.y) / (pointB.x - pointA.x);
//   let b = pointA.y - pointA.x * (pointB.y - pointA.y) /
//     (pointB.x - pointA.x);
//
//   const A = 1 + k * k;
//   const B = 2 * k * b;
//   const C = b * b - radius * radius;
//   const D = B * B - 4 * A * C;
//
//   let x1 = null;
//   let x2 = null;
//   let y1 = null;
//   let y2 = null;
//
//   if (0 < D) {
//     console.log('2 points intersects');
//     x1 = (-B + Math.sqrt(D)) / (2 * A);
//     x2 = (-B - Math.sqrt(D)) / (2 * A);
//
//     if (pointA.x < x1 && pointB.x > x1) {
//       return [x1 + xShift, (x1 * k  + b) + yShift];
//     }
//   } else if (0 === D) {
//     console.log('1 point intersect');
//     x1 = x2 = (-B + Math.sqrt(D)) / (2 * A);
//   } else {
//     console.log('0 points intersect');
//   }
//
//   return null !== x2 ? [x2 + xShift, (x2 * k  + b) + yShift] : null;
// };

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


const cloudALine = (line, radius) => {
  let intersection = getIntersection(line, radius * 2);
  let remainingLine = line;
  let arc;
  const cloud = [`M ${line[0][0]}, ${line[0][1]}`];

  while (intersection) {
    arc = ` A ${radius} ${radius} 0 1 1 ${intersection[0]} ${intersection[1]}`;
    cloud.push(arc);
    remainingLine = [intersection, remainingLine[1]];
    intersection = getIntersection(remainingLine, radius * 2);
  }

  return cloud.join('');
};


const fixRadiusToFitLine = (line, radius) => {
  const length = lineLength(line);
  const segments = Math.round(length / (2 * radius) + 0.5);

  return length / segments / 2;
};


const svgCloud = (poligon, radius) => {
  let cloud = `M ${poligon[0][0]}, ${poligon[0][1]}`;
  let ind = 1;
  let line;
  const cnt = poligon.length;

  for (; ind < cnt; ++ind) {
    line = [poligon[ind - 1], poligon[ind]];
    cloud += cloudALine(line, fixRadiusToFitLine(line, radius));
  }

  // Last line (last point to first point)
  line = [poligon[ind - 1], poligon[0]];
  cloud += cloudALine(line, fixRadiusToFitLine(line, radius));

  return cloud;
};


module.exports = svgCloud;
