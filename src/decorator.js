
/**
 * Generates svg cloud for polygon
 *
 * @param  {Polygon} poligon
 *
 * @return {Path}
 */

let lineSegmentIntersection = (circle, radius, pointA, pointB) => {
  const xShift = circle.x;
  const yShift = circle.y;

  //Recet circle to (0,0) coordinate
  circle.x = 0;
  circle.y = 0;
  pointA.x -= xShift;
  pointA.y -= yShift;
  pointB.x -= xShift;
  pointB.y -= yShift;

  let k = (pointB.y - pointA.y) / (pointB.x - pointA.x);
  let b = pointA.y - pointA.x * (pointB.y - pointA.y) / (pointB.x - pointA.x);

  const A = 1 + k * k;
  const B = 2 * k * b;
  const C = b * b - radius * radius;
  const D = B * B - 4 * A * C;

  let x1 = null;
  let x2 = null;
  let y1 = null;
  let y2 = null;

  if (0 < D) {
    console.log('2 points intersects');
    x1 = (-B + Math.sqrt(D)) / (2 * A);
    x2 = (-B - Math.sqrt(D)) / (2 * A);

    if (pointA.x < x1 && pointB.x > x1) {
      return [x1 + xShift, (x1 * k  + b) + yShift];
    }
  } else if (0 === D) {
    console.log('1 point intersect');
    x1 = x2 = (-B + Math.sqrt(D)) / (2 * A);
  } else {
    console.log('0 points intersect');
  }

  return null !== x2 ? [x2 + xShift, (x2 * k  + b) + yShift] : null;
};





let getIntersection = (line, length) => {
  let pointC = null;
  let pointA = line[0];
  let pointB = line[1];
  let xA = pointA[0];
  let xB = pointB[0];
  let yA = pointA[1];
  let yB = pointB[1];
  let delta;
  let xPoint;
  let yPoint;

  let fullLen = Math.sqrt(Math.pow((xB - xA), 2) + Math.pow((yB - yA), 2));

  if (fullLen === length) {
    pointC = pointB;
  } else if (fullLen > length) {
    delta = length / (fullLen - length)
    xPoint = (xA + delta * xB) / (1 + delta);
    yPoint = (yA + delta * yB) / (1 + delta);
    pointC = [xPoint, yPoint];
  }// else {
    //console.log('TODO: cannot fit, left ' + fullLen + ' out of ' + length);
  //}

  return pointC;
};

let cloudALine = (line, radius, nextLine) => {
  let lineLength;
  let pointA = line[0];
  let pointB = line[1];
  let intersection = getIntersection(line, radius * 2);

  let cloud = ['M ' + line[0][0] + ', ' + line[0][1]];
  while (intersection) {
    cloud.push(' A ' + radius + ' ' + radius + ' 0 1 1 ' + intersection[0] + ' ' + intersection[1]);
    line = [intersection, line[1]];
    intersection = getIntersection(line, radius * 2);
  }


  // if (nextLine) {
  //   let nextPoint = lineSegmentIntersection(
  //     {
  //       x: line[0][0] + radius,
  //       y: line[0][1]
  //     },
  //     radius,
  //     {
  //       x: nextLine[0][0],
  //       y: nextLine[0][1]
  //     },
  //     {
  //       x: nextLine[1][0],
  //       y: nextLine[1][1]
  //     }
  //   );
  //
  //   if (null !== nextPoint) {
  //     cloud.push(' A ' + radius + ' ' + radius + ' 0 1 1 ' + nextPoint[0] + ' ' + nextPoint[1]);
  //   }
  // }
  return cloud.join('');
};


let svgCloud = (poligon, radius) => {
  let cloud = 'M ' + poligon[0][0] + ', ' + poligon[0][1];
  let ind = 1;
  let line;
  const cnt = poligon.length;

  for (; ind < cnt; ++ ind) {
    line = [poligon[ind - 1], poligon[ind]];
    cloud += cloudALine(line, radius);
  }

  line = [poligon[ind - 1], poligon[0]];
  cloud += cloudALine(line, radius);

  return cloud;
};

module.exports = svgCloud;
