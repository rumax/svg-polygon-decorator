(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.svgCloud = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _decorator = require('../src/decorator');

var _decorator2 = _interopRequireDefault(_decorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var form = document.querySelector('.controls');
var clouds = [{
  selector: '#cloud1',
  coords: [[10, 120], [180, 120], [230, 180]]
}, {
  selector: '#cloud2',
  coords: [[20, 300], [180, 300], [200, 330], [190, 360], [140, 420], [70, 380]]
}, {
  selector: '#cloud3',
  coords: [[460, 120], [290, 120], [240, 180]]
}, {
  selector: '#cloud4',
  coords: [[450, 300], [290, 300], [270, 330], [280, 360], [330, 420], [400, 380]]
}];

var render = function render() {
  var elem = void 0;
  var cloud = void 0;
  var radius = parseFloat(form.radius.value);

  for (var ind = 0, cnt = clouds.length; ind < cnt; ++ind) {
    elem = document.querySelector(clouds[ind].selector);
    cloud = (0, _decorator2.default)(clouds[ind].coords, radius);
    elem.setAttribute('d', cloud);
  }
};

form.addEventListener('change', render);
render();

},{"../src/decorator":2}],2:[function(require,module,exports){
'use strict';

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

var X = 0;
var Y = 1;
var FLOAT_PRECISE = 0.000001;

var lineLength = function lineLength(line) {
  var pointA = line[0];
  var pointB = line[1];

  return Math.sqrt(Math.pow(pointB[X] - pointA[X], 2) + Math.pow(pointB[Y] - pointA[Y], 2));
};

var getIntersection = function getIntersection(line, length) {
  var pointC = null;
  var pointA = line[0];
  var pointB = line[1];
  var delta = void 0;
  var xPoint = void 0;
  var yPoint = void 0;
  var fullLen = lineLength(line);

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

var cloudALine = function cloudALine(line, radius) {
  var intersection = getIntersection(line, radius * 2);
  var remainingLine = line;
  var arc = void 0;
  var cloud = ['M ' + line[0][0] + ', ' + line[0][1]];

  while (intersection) {
    arc = ' A ' + radius + ' ' + radius + ' 0 1 1 ' + intersection[0] + ' ' + intersection[1];
    cloud.push(arc);
    remainingLine = [intersection, remainingLine[1]];
    intersection = getIntersection(remainingLine, radius * 2);
  }

  return cloud.join('');
};

var fixRadiusToFitLine = function fixRadiusToFitLine(line, radius) {
  var length = lineLength(line);
  var segments = Math.round(length / (2 * radius) + 0.5);

  return length / segments / 2;
};

var svgCloud = function svgCloud(poligon, radius) {
  var cloud = 'M ' + poligon[0][0] + ', ' + poligon[0][1];
  var ind = 1;
  var line = void 0;
  var cnt = poligon.length;

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

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vXFxpbmRleC5qcyIsInNyY1xcZGVjb3JhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7O0FBRUEsSUFBTSxPQUFPLFNBQVMsYUFBVCxDQUF1QixXQUF2QixDQUFiO0FBQ0EsSUFBTSxTQUFTLENBQ2I7QUFDRSxZQUFVLFNBRFo7QUFFRSxVQUFRLENBQUMsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUFELEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFaLEVBQXdCLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBeEI7QUFGVixDQURhLEVBS2I7QUFDRSxZQUFVLFNBRFo7QUFFRSxVQUFRLENBQUMsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUFELEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFaLEVBQXlCLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBekIsRUFBcUMsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFyQyxFQUFpRCxDQUFDLEdBQUQsRUFBTSxHQUFOLENBQWpELEVBQ0MsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUREO0FBRlYsQ0FMYSxFQVViO0FBQ0UsWUFBVSxTQURaO0FBRUUsVUFBUSxDQUFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBRCxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBYixFQUF5QixDQUFDLEdBQUQsRUFBTSxHQUFOLENBQXpCO0FBRlYsQ0FWYSxFQWNiO0FBQ0UsWUFBVSxTQURaO0FBRUUsVUFBUSxDQUFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBRCxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBYixFQUF5QixDQUFDLEdBQUQsRUFBTSxHQUFOLENBQXpCLEVBQXFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBckMsRUFBaUQsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFqRCxF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V0FBVyxJQUFYLEVBQWlCLG1CQUFtQixJQUFuQixFQUF5QixNQUF6QixDQUFqQixDQUFUOztBQUVBLFNBQU8sS0FBUDtBQUNELENBaEJEOztBQW1CQSxPQUFPLE9BQVAsR0FBaUIsUUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHN2Z0Nsb3VkIGZyb20gJy4uL3NyYy9kZWNvcmF0b3InO1xuXG5jb25zdCBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRyb2xzJyk7XG5jb25zdCBjbG91ZHMgPSBbXG4gIHtcbiAgICBzZWxlY3RvcjogJyNjbG91ZDEnLFxuICAgIGNvb3JkczogW1sxMCwgMTIwXSwgWzE4MCwgMTIwXSwgWzIzMCwgMTgwXV1cbiAgfSxcbiAge1xuICAgIHNlbGVjdG9yOiAnI2Nsb3VkMicsXG4gICAgY29vcmRzOiBbWzIwLCAzMDBdLCBbMTgwLCAzMDBdLCAgWzIwMCwgMzMwXSwgWzE5MCwgMzYwXSwgWzE0MCwgNDIwXSxcbiAgICAgICAgICAgICBbNzAsIDM4MF1dXG4gIH0sXG4gIHtcbiAgICBzZWxlY3RvcjogJyNjbG91ZDMnLFxuICAgIGNvb3JkczogW1s0NjAsIDEyMF0sIFsyOTAsIDEyMF0sIFsyNDAsIDE4MF1dXG4gIH0sXG4gIHtcbiAgICBzZWxlY3RvcjogJyNjbG91ZDQnLFxuICAgIGNvb3JkczogW1s0NTAsIDMwMF0sIFsyOTAsIDMwMF0sIFsyNzAsIDMzMF0sIFsyODAsIDM2MF0sIFszMzAsIDQyMF0sXG4gICAgICAgICAgICAgWzQwMCwgMzgwXV1cbiAgfVxuXTtcblxuXG5jb25zdCByZW5kZXIgPSAoKSA9PiB7XG4gIGxldCBlbGVtO1xuICBsZXQgY2xvdWQ7XG4gIGNvbnN0IHJhZGl1cyA9IHBhcnNlRmxvYXQoZm9ybS5yYWRpdXMudmFsdWUpO1xuXG4gIGZvciAobGV0IGluZCA9IDAsIGNudCA9IGNsb3Vkcy5sZW5ndGg7IGluZCA8IGNudDsgKytpbmQpIHtcbiAgICBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihjbG91ZHNbaW5kXS5zZWxlY3Rvcik7XG4gICAgY2xvdWQgPSBzdmdDbG91ZChjbG91ZHNbaW5kXS5jb29yZHMsIHJhZGl1cyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2QnLCBjbG91ZCk7XG4gIH1cbn07XG5cbmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgcmVuZGVyKTtcbnJlbmRlcigpO1xuIiwiXG4vKipcbiAqIEdlbmVyYXRlcyBzdmcgY2xvdWQgZm9yIHBvbHlnb25cbiAqXG4gKiBAcGFyYW0gIHtQb2x5Z29ufSBwb2xpZ29uXG4gKlxuICogQHJldHVybiB7UGF0aH1cbiAqL1xuXG4vLyBsZXQgbGluZVNlZ21lbnRJbnRlcnNlY3Rpb24gPSAoY2lyY2xlLCByYWRpdXMsIHBvaW50QSwgcG9pbnRCKSA9PiB7XG4vLyAgIGNvbnN0IHhTaGlmdCA9IGNpcmNsZS54O1xuLy8gICBjb25zdCB5U2hpZnQgPSBjaXJjbGUueTtcbi8vXG4vLyAgIC8vUmVjZXQgY2lyY2xlIHRvICgwLDApIGNvb3JkaW5hdGVcbi8vICAgY2lyY2xlLnggPSAwO1xuLy8gICBjaXJjbGUueSA9IDA7XG4vLyAgIHBvaW50QS54IC09IHhTaGlmdDtcbi8vICAgcG9pbnRBLnkgLT0geVNoaWZ0O1xuLy8gICBwb2ludEIueCAtPSB4U2hpZnQ7XG4vLyAgIHBvaW50Qi55IC09IHlTaGlmdDtcbi8vXG4vLyAgIGxldCBrID0gKHBvaW50Qi55IC0gcG9pbnRBLnkpIC8gKHBvaW50Qi54IC0gcG9pbnRBLngpO1xuLy8gICBsZXQgYiA9IHBvaW50QS55IC0gcG9pbnRBLnggKiAocG9pbnRCLnkgLSBwb2ludEEueSkgL1xuLy8gICAgIChwb2ludEIueCAtIHBvaW50QS54KTtcbi8vXG4vLyAgIGNvbnN0IEEgPSAxICsgayAqIGs7XG4vLyAgIGNvbnN0IEIgPSAyICogayAqIGI7XG4vLyAgIGNvbnN0IEMgPSBiICogYiAtIHJhZGl1cyAqIHJhZGl1cztcbi8vICAgY29uc3QgRCA9IEIgKiBCIC0gNCAqIEEgKiBDO1xuLy9cbi8vICAgbGV0IHgxID0gbnVsbDtcbi8vICAgbGV0IHgyID0gbnVsbDtcbi8vICAgbGV0IHkxID0gbnVsbDtcbi8vICAgbGV0IHkyID0gbnVsbDtcbi8vXG4vLyAgIGlmICgwIDwgRCkge1xuLy8gICAgIGNvbnNvbGUubG9nKCcyIHBvaW50cyBpbnRlcnNlY3RzJyk7XG4vLyAgICAgeDEgPSAoLUIgKyBNYXRoLnNxcnQoRCkpIC8gKDIgKiBBKTtcbi8vICAgICB4MiA9ICgtQiAtIE1hdGguc3FydChEKSkgLyAoMiAqIEEpO1xuLy9cbi8vICAgICBpZiAocG9pbnRBLnggPCB4MSAmJiBwb2ludEIueCA+IHgxKSB7XG4vLyAgICAgICByZXR1cm4gW3gxICsgeFNoaWZ0LCAoeDEgKiBrICArIGIpICsgeVNoaWZ0XTtcbi8vICAgICB9XG4vLyAgIH0gZWxzZSBpZiAoMCA9PT0gRCkge1xuLy8gICAgIGNvbnNvbGUubG9nKCcxIHBvaW50IGludGVyc2VjdCcpO1xuLy8gICAgIHgxID0geDIgPSAoLUIgKyBNYXRoLnNxcnQoRCkpIC8gKDIgKiBBKTtcbi8vICAgfSBlbHNlIHtcbi8vICAgICBjb25zb2xlLmxvZygnMCBwb2ludHMgaW50ZXJzZWN0Jyk7XG4vLyAgIH1cbi8vXG4vLyAgIHJldHVybiBudWxsICE9PSB4MiA/IFt4MiArIHhTaGlmdCwgKHgyICogayAgKyBiKSArIHlTaGlmdF0gOiBudWxsO1xuLy8gfTtcblxuY29uc3QgWCA9IDA7XG5jb25zdCBZID0gMTtcbmNvbnN0IEZMT0FUX1BSRUNJU0UgPSAwLjAwMDAwMTtcblxuXG5jb25zdCBsaW5lTGVuZ3RoID0gKGxpbmUpID0+IHtcbiAgY29uc3QgcG9pbnRBID0gbGluZVswXTtcbiAgY29uc3QgcG9pbnRCID0gbGluZVsxXTtcblxuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChwb2ludEJbWF0gLSBwb2ludEFbWF0pLCAyKSArXG4gICAgTWF0aC5wb3coKHBvaW50QltZXSAtIHBvaW50QVtZXSksIDIpKTtcbn07XG5cblxuY29uc3QgZ2V0SW50ZXJzZWN0aW9uID0gKGxpbmUsIGxlbmd0aCkgPT4ge1xuICBsZXQgcG9pbnRDID0gbnVsbDtcbiAgY29uc3QgcG9pbnRBID0gbGluZVswXTtcbiAgY29uc3QgcG9pbnRCID0gbGluZVsxXTtcbiAgbGV0IGRlbHRhO1xuICBsZXQgeFBvaW50O1xuICBsZXQgeVBvaW50O1xuICBjb25zdCBmdWxsTGVuID0gbGluZUxlbmd0aChsaW5lKTtcblxuICBpZiAoTWF0aC5hYnMoZnVsbExlbiAtIGxlbmd0aCkgPCBGTE9BVF9QUkVDSVNFKSB7XG4gICAgcG9pbnRDID0gcG9pbnRCO1xuICB9IGVsc2UgaWYgKGZ1bGxMZW4gPiBsZW5ndGgpIHtcbiAgICBkZWx0YSA9IGxlbmd0aCAvIChmdWxsTGVuIC0gbGVuZ3RoKTtcbiAgICB4UG9pbnQgPSAocG9pbnRBW1hdICsgZGVsdGEgKiBwb2ludEJbWF0pIC8gKDEgKyBkZWx0YSk7XG4gICAgeVBvaW50ID0gKHBvaW50QVtZXSArIGRlbHRhICogcG9pbnRCW1ldKSAvICgxICsgZGVsdGEpO1xuICAgIHBvaW50QyA9IFt4UG9pbnQsIHlQb2ludF07XG4gIH1cblxuICByZXR1cm4gcG9pbnRDO1xufTtcblxuXG5jb25zdCBjbG91ZEFMaW5lID0gKGxpbmUsIHJhZGl1cykgPT4ge1xuICBsZXQgaW50ZXJzZWN0aW9uID0gZ2V0SW50ZXJzZWN0aW9uKGxpbmUsIHJhZGl1cyAqIDIpO1xuICBsZXQgcmVtYWluaW5nTGluZSA9IGxpbmU7XG4gIGxldCBhcmM7XG4gIGNvbnN0IGNsb3VkID0gW2BNICR7bGluZVswXVswXX0sICR7bGluZVswXVsxXX1gXTtcblxuICB3aGlsZSAoaW50ZXJzZWN0aW9uKSB7XG4gICAgYXJjID0gYCBBICR7cmFkaXVzfSAke3JhZGl1c30gMCAxIDEgJHtpbnRlcnNlY3Rpb25bMF19ICR7aW50ZXJzZWN0aW9uWzFdfWA7XG4gICAgY2xvdWQucHVzaChhcmMpO1xuICAgIHJlbWFpbmluZ0xpbmUgPSBbaW50ZXJzZWN0aW9uLCByZW1haW5pbmdMaW5lWzFdXTtcbiAgICBpbnRlcnNlY3Rpb24gPSBnZXRJbnRlcnNlY3Rpb24ocmVtYWluaW5nTGluZSwgcmFkaXVzICogMik7XG4gIH1cblxuICByZXR1cm4gY2xvdWQuam9pbignJyk7XG59O1xuXG5cbmNvbnN0IGZpeFJhZGl1c1RvRml0TGluZSA9IChsaW5lLCByYWRpdXMpID0+IHtcbiAgY29uc3QgbGVuZ3RoID0gbGluZUxlbmd0aChsaW5lKTtcbiAgY29uc3Qgc2VnbWVudHMgPSBNYXRoLnJvdW5kKGxlbmd0aCAvICgyICogcmFkaXVzKSArIDAuNSk7XG5cbiAgcmV0dXJuIGxlbmd0aCAvIHNlZ21lbnRzIC8gMjtcbn07XG5cblxuY29uc3Qgc3ZnQ2xvdWQgPSAocG9saWdvbiwgcmFkaXVzKSA9PiB7XG4gIGxldCBjbG91ZCA9IGBNICR7cG9saWdvblswXVswXX0sICR7cG9saWdvblswXVsxXX1gO1xuICBsZXQgaW5kID0gMTtcbiAgbGV0IGxpbmU7XG4gIGNvbnN0IGNudCA9IHBvbGlnb24ubGVuZ3RoO1xuXG4gIGZvciAoOyBpbmQgPCBjbnQ7ICsraW5kKSB7XG4gICAgbGluZSA9IFtwb2xpZ29uW2luZCAtIDFdLCBwb2xpZ29uW2luZF1dO1xuICAgIGNsb3VkICs9IGNsb3VkQUxpbmUobGluZSwgZml4UmFkaXVzVG9GaXRMaW5lKGxpbmUsIHJhZGl1cykpO1xuICB9XG5cbiAgLy8gTGFzdCBsaW5lIChsYXN0IHBvaW50IHRvIGZpcnN0IHBvaW50KVxuICBsaW5lID0gW3BvbGlnb25baW5kIC0gMV0sIHBvbGlnb25bMF1dO1xuICBjbG91ZCArPSBjbG91ZEFMaW5lKGxpbmUsIGZpeFJhZGl1c1RvRml0TGluZShsaW5lLCByYWRpdXMpKTtcblxuICByZXR1cm4gY2xvdWQ7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gc3ZnQ2xvdWQ7XG4iXX0=
