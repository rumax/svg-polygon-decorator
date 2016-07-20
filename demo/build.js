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
}, {
  selector: '#cloud_l1',
  coords: [[10, 10], [230, 10]]
}, {
  selector: '#cloud_l2',
  coords: [[450, 10], [240, 10]]
}];

var render = function render() {
  var elem = void 0;
  var cloud = void 0;
  var radius = parseFloat(form.radius.value);
  var closed = form.closed.checked;
  var inward = form.inward.checked;

  for (var ind = 0, cnt = clouds.length; ind < cnt; ++ind) {
    elem = document.querySelector(clouds[ind].selector);
    cloud = (0, _decorator2.default)(clouds[ind].coords, radius, closed, inward);
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
 * @param  {Polygon} polygon
 *
 * @return {SVG Path}
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

var cloudALine = function cloudALine(line, radius, inward) {
  var point = getIntersection(line, radius * 2);
  var remainingLine = line;
  var arc = void 0;
  var cloud = ['M' + line[0][X] + ', ' + line[0][Y]];
  var sweep = true === inward ? 0 : 1;
  var lArc = true === inward ? 0 : 1;

  while (point) {
    arc = ' A ' + radius + ' ' + radius + ' 0 ' + lArc + ' ' + sweep + ' ' + point[X] + ' ' + point[Y];
    cloud.push(arc);
    remainingLine = [point, remainingLine[1]];
    point = getIntersection(remainingLine, radius * 2);
  }

  return cloud.join('');
};

var fixRadiusToFitLine = function fixRadiusToFitLine(line, radius) {
  var length = lineLength(line);
  var segments = Math.round(length / (2 * radius) + 0.5);

  return 0 < length ? length / segments / 2 : radius;
};

var svgCloud = function svgCloud(polyline, radius, closed, inward) {
  var cloud = '';
  var ind = 1;
  var line = void 0;
  var cnt = polyline.length;

  for (; ind < cnt; ++ind) {
    if (0 >= ind) {
      cloud += ' ';
    }
    line = [polyline[ind - 1], polyline[ind]];
    cloud += cloudALine(line, fixRadiusToFitLine(line, radius), inward);
  }

  // close to get polygon
  if (true === closed) {
    line = [polyline[ind - 1], polyline[0]];
    cloud += ' ' + cloudALine(line, fixRadiusToFitLine(line, radius), inward);
  }

  // SVG complains about empty path strings
  return cloud || 'M0 0';
};

module.exports = svgCloud;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vXFxpbmRleC5qcyIsInNyY1xcZGVjb3JhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7O0FBRUEsSUFBTSxPQUFPLFNBQVMsYUFBVCxDQUF1QixXQUF2QixDQUFiO0FBQ0EsSUFBTSxTQUFTLENBQ2I7QUFDRSxZQUFVLFNBRFo7QUFFRSxVQUFRLENBQUMsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUFELEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFaLEVBQXdCLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBeEI7QUFGVixDQURhLEVBS2I7QUFDRSxZQUFVLFNBRFo7QUFFRSxVQUFRLENBQUMsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUFELEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFaLEVBQXlCLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBekIsRUFBcUMsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFyQyxFQUFpRCxDQUFDLEdBQUQsRUFBTSxHQUFOLENBQWpELEVBQ0MsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUREO0FBRlYsQ0FMYSxFQVViO0FBQ0UsWUFBVSxTQURaO0FBRUUsVUFBUSxDQUFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBRCxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBYixFQUF5QixDQUFDLEdBQUQsRUFBTSxHQUFOLENBQXpCO0FBRlYsQ0FWYSxFQWNiO0FBQ0UsWUFBVSxTQURaO0FBRUUsVUFBUSxDQUFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBRCxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBYixFQUF5QixDQUFDLEdBQUQsRUFBTSxHQUFOLENBQXpCLEVBQXFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBckMsRUFBaUQsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFqRCxF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QyxNQUE1QztBQUNELENBTEQ7O0FBUUEsSUFBTSxXQUFXLFNBQVgsUUFBVyxDQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLE1BQW5CLEVBQTJCLE1BQTNCLEVBQXNDO0FBQ3JELE1BQUksUUFBUSxFQUFaO0FBQ0EsTUFBSSxNQUFNLENBQVY7QUFDQSxNQUFJLGFBQUo7QUFDQSxNQUFNLE1BQU0sU0FBUyxNQUFyQjs7QUFFQSxTQUFPLE1BQU0sR0FBYixFQUFrQixFQUFFLEdBQXBCLEVBQXlCO0FBQ3ZCLFFBQUksS0FBSyxHQUFULEVBQWM7QUFDWixlQUFTLEdBQVQ7QUFDRDtBQUNELFdBQU8sQ0FBQyxTQUFTLE1BQU0sQ0FBZixDQUFELEVBQW9CLFNBQVMsR0FBVCxDQUFwQixDQUFQO0FBQ0EsYUFBUyxXQUFXLElBQVgsRUFBaUIsbUJBQW1CLElBQW5CLEVBQXlCLE1BQXpCLENBQWpCLEVBQW1ELE1BQW5ELENBQVQ7QUFDRDs7QUFFRDtBQUNBLE1BQUksU0FBUyxNQUFiLEVBQXFCO0FBQ25CLFdBQU8sQ0FBQyxTQUFTLE1BQU0sQ0FBZixDQUFELEVBQW9CLFNBQVMsQ0FBVCxDQUFwQixDQUFQO0FBQ0EsYUFBUyxNQUFNLFdBQVcsSUFBWCxFQUFpQixtQkFBbUIsSUFBbkIsRUFBeUIsTUFBekIsQ0FBakIsRUFBbUQsTUFBbkQsQ0FBZjtBQUNEOztBQUVEO0FBQ0EsU0FBTyxTQUFTLE1BQWhCO0FBQ0QsQ0F0QkQ7O0FBeUJBLE9BQU8sT0FBUCxHQUFpQixRQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgc3ZnQ2xvdWQgZnJvbSAnLi4vc3JjL2RlY29yYXRvcic7XG5cbmNvbnN0IGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udHJvbHMnKTtcbmNvbnN0IGNsb3VkcyA9IFtcbiAge1xuICAgIHNlbGVjdG9yOiAnI2Nsb3VkMScsXG4gICAgY29vcmRzOiBbWzEwLCAxMjBdLCBbMTgwLCAxMjBdLCBbMjMwLCAxODBdXVxuICB9LFxuICB7XG4gICAgc2VsZWN0b3I6ICcjY2xvdWQyJyxcbiAgICBjb29yZHM6IFtbMjAsIDMwMF0sIFsxODAsIDMwMF0sICBbMjAwLCAzMzBdLCBbMTkwLCAzNjBdLCBbMTQwLCA0MjBdLFxuICAgICAgICAgICAgIFs3MCwgMzgwXV1cbiAgfSxcbiAge1xuICAgIHNlbGVjdG9yOiAnI2Nsb3VkMycsXG4gICAgY29vcmRzOiBbWzQ2MCwgMTIwXSwgWzI5MCwgMTIwXSwgWzI0MCwgMTgwXV1cbiAgfSxcbiAge1xuICAgIHNlbGVjdG9yOiAnI2Nsb3VkNCcsXG4gICAgY29vcmRzOiBbWzQ1MCwgMzAwXSwgWzI5MCwgMzAwXSwgWzI3MCwgMzMwXSwgWzI4MCwgMzYwXSwgWzMzMCwgNDIwXSxcbiAgICAgICAgICAgICBbNDAwLCAzODBdXVxuICB9LFxuICB7XG4gICAgc2VsZWN0b3I6ICcjY2xvdWRfbDEnLFxuICAgIGNvb3JkczogW1sxMCwgMTBdLCBbMjMwLCAxMF1dXG4gIH0sXG4gIHtcbiAgICBzZWxlY3RvcjogJyNjbG91ZF9sMicsXG4gICAgY29vcmRzOiBbWzQ1MCwgMTBdLCBbMjQwLCAxMF1dXG4gIH1cbl07XG5cblxuY29uc3QgcmVuZGVyID0gKCkgPT4ge1xuICBsZXQgZWxlbTtcbiAgbGV0IGNsb3VkO1xuICBjb25zdCByYWRpdXMgPSBwYXJzZUZsb2F0KGZvcm0ucmFkaXVzLnZhbHVlKTtcbiAgY29uc3QgY2xvc2VkID0gZm9ybS5jbG9zZWQuY2hlY2tlZDtcbiAgY29uc3QgaW53YXJkID0gZm9ybS5pbndhcmQuY2hlY2tlZDtcblxuICBmb3IgKGxldCBpbmQgPSAwLCBjbnQgPSBjbG91ZHMubGVuZ3RoOyBpbmQgPCBjbnQ7ICsraW5kKSB7XG4gICAgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY2xvdWRzW2luZF0uc2VsZWN0b3IpO1xuICAgIGNsb3VkID0gc3ZnQ2xvdWQoY2xvdWRzW2luZF0uY29vcmRzLCByYWRpdXMsIGNsb3NlZCwgaW53YXJkKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZSgnZCcsIGNsb3VkKTtcbiAgfVxufTtcblxuZm9ybS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCByZW5kZXIpO1xucmVuZGVyKCk7XG4iLCJcbi8qKlxuICogR2VuZXJhdGVzIHN2ZyBjbG91ZCBmb3IgcG9seWdvblxuICpcbiAqIEBwYXJhbSAge1BvbHlnb259IHBvbHlnb25cbiAqXG4gKiBAcmV0dXJuIHtTVkcgUGF0aH1cbiAqL1xuXG4vLyBsZXQgbGluZVNlZ21lbnRJbnRlcnNlY3Rpb24gPSAoY2lyY2xlLCByYWRpdXMsIHBvaW50QSwgcG9pbnRCKSA9PiB7XG4vLyAgIGNvbnN0IHhTaGlmdCA9IGNpcmNsZS54O1xuLy8gICBjb25zdCB5U2hpZnQgPSBjaXJjbGUueTtcbi8vXG4vLyAgIC8vUmVjZXQgY2lyY2xlIHRvICgwLDApIGNvb3JkaW5hdGVcbi8vICAgY2lyY2xlLnggPSAwO1xuLy8gICBjaXJjbGUueSA9IDA7XG4vLyAgIHBvaW50QS54IC09IHhTaGlmdDtcbi8vICAgcG9pbnRBLnkgLT0geVNoaWZ0O1xuLy8gICBwb2ludEIueCAtPSB4U2hpZnQ7XG4vLyAgIHBvaW50Qi55IC09IHlTaGlmdDtcbi8vXG4vLyAgIGxldCBrID0gKHBvaW50Qi55IC0gcG9pbnRBLnkpIC8gKHBvaW50Qi54IC0gcG9pbnRBLngpO1xuLy8gICBsZXQgYiA9IHBvaW50QS55IC0gcG9pbnRBLnggKiAocG9pbnRCLnkgLSBwb2ludEEueSkgL1xuLy8gICAgIChwb2ludEIueCAtIHBvaW50QS54KTtcbi8vXG4vLyAgIGNvbnN0IEEgPSAxICsgayAqIGs7XG4vLyAgIGNvbnN0IEIgPSAyICogayAqIGI7XG4vLyAgIGNvbnN0IEMgPSBiICogYiAtIHJhZGl1cyAqIHJhZGl1cztcbi8vICAgY29uc3QgRCA9IEIgKiBCIC0gNCAqIEEgKiBDO1xuLy9cbi8vICAgbGV0IHgxID0gbnVsbDtcbi8vICAgbGV0IHgyID0gbnVsbDtcbi8vICAgbGV0IHkxID0gbnVsbDtcbi8vICAgbGV0IHkyID0gbnVsbDtcbi8vXG4vLyAgIGlmICgwIDwgRCkge1xuLy8gICAgIGNvbnNvbGUubG9nKCcyIHBvaW50cyBpbnRlcnNlY3RzJyk7XG4vLyAgICAgeDEgPSAoLUIgKyBNYXRoLnNxcnQoRCkpIC8gKDIgKiBBKTtcbi8vICAgICB4MiA9ICgtQiAtIE1hdGguc3FydChEKSkgLyAoMiAqIEEpO1xuLy9cbi8vICAgICBpZiAocG9pbnRBLnggPCB4MSAmJiBwb2ludEIueCA+IHgxKSB7XG4vLyAgICAgICByZXR1cm4gW3gxICsgeFNoaWZ0LCAoeDEgKiBrICArIGIpICsgeVNoaWZ0XTtcbi8vICAgICB9XG4vLyAgIH0gZWxzZSBpZiAoMCA9PT0gRCkge1xuLy8gICAgIGNvbnNvbGUubG9nKCcxIHBvaW50IGludGVyc2VjdCcpO1xuLy8gICAgIHgxID0geDIgPSAoLUIgKyBNYXRoLnNxcnQoRCkpIC8gKDIgKiBBKTtcbi8vICAgfSBlbHNlIHtcbi8vICAgICBjb25zb2xlLmxvZygnMCBwb2ludHMgaW50ZXJzZWN0Jyk7XG4vLyAgIH1cbi8vXG4vLyAgIHJldHVybiBudWxsICE9PSB4MiA/IFt4MiArIHhTaGlmdCwgKHgyICogayAgKyBiKSArIHlTaGlmdF0gOiBudWxsO1xuLy8gfTtcblxuY29uc3QgWCA9IDA7XG5jb25zdCBZID0gMTtcbmNvbnN0IEZMT0FUX1BSRUNJU0UgPSAwLjAwMDAwMTtcblxuXG5jb25zdCBsaW5lTGVuZ3RoID0gKGxpbmUpID0+IHtcbiAgY29uc3QgcG9pbnRBID0gbGluZVswXTtcbiAgY29uc3QgcG9pbnRCID0gbGluZVsxXTtcblxuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChwb2ludEJbWF0gLSBwb2ludEFbWF0pLCAyKSArXG4gICAgTWF0aC5wb3coKHBvaW50QltZXSAtIHBvaW50QVtZXSksIDIpKTtcbn07XG5cblxuY29uc3QgZ2V0SW50ZXJzZWN0aW9uID0gKGxpbmUsIGxlbmd0aCkgPT4ge1xuICBsZXQgcG9pbnRDID0gbnVsbDtcbiAgY29uc3QgcG9pbnRBID0gbGluZVswXTtcbiAgY29uc3QgcG9pbnRCID0gbGluZVsxXTtcbiAgbGV0IGRlbHRhO1xuICBsZXQgeFBvaW50O1xuICBsZXQgeVBvaW50O1xuICBjb25zdCBmdWxsTGVuID0gbGluZUxlbmd0aChsaW5lKTtcblxuICBpZiAoTWF0aC5hYnMoZnVsbExlbiAtIGxlbmd0aCkgPCBGTE9BVF9QUkVDSVNFKSB7XG4gICAgcG9pbnRDID0gcG9pbnRCO1xuICB9IGVsc2UgaWYgKGZ1bGxMZW4gPiBsZW5ndGgpIHtcbiAgICBkZWx0YSA9IGxlbmd0aCAvIChmdWxsTGVuIC0gbGVuZ3RoKTtcbiAgICB4UG9pbnQgPSAocG9pbnRBW1hdICsgZGVsdGEgKiBwb2ludEJbWF0pIC8gKDEgKyBkZWx0YSk7XG4gICAgeVBvaW50ID0gKHBvaW50QVtZXSArIGRlbHRhICogcG9pbnRCW1ldKSAvICgxICsgZGVsdGEpO1xuICAgIHBvaW50QyA9IFt4UG9pbnQsIHlQb2ludF07XG4gIH1cblxuICByZXR1cm4gcG9pbnRDO1xufTtcblxuXG5jb25zdCBjbG91ZEFMaW5lID0gKGxpbmUsIHJhZGl1cywgaW53YXJkKSA9PiB7XG4gIGxldCBwb2ludCA9IGdldEludGVyc2VjdGlvbihsaW5lLCByYWRpdXMgKiAyKTtcbiAgbGV0IHJlbWFpbmluZ0xpbmUgPSBsaW5lO1xuICBsZXQgYXJjO1xuICBjb25zdCBjbG91ZCA9IFtgTSR7bGluZVswXVtYXX0sICR7bGluZVswXVtZXX1gXTtcbiAgY29uc3Qgc3dlZXAgPSB0cnVlID09PSBpbndhcmQgPyAwIDogMTtcbiAgY29uc3QgbEFyYyA9IHRydWUgPT09IGlud2FyZCA/IDAgOiAxO1xuXG4gIHdoaWxlIChwb2ludCkge1xuICAgIGFyYyA9IGAgQSAke3JhZGl1c30gJHtyYWRpdXN9IDAgJHtsQXJjfSAke3N3ZWVwfSAke3BvaW50W1hdfSAke3BvaW50W1ldfWA7XG4gICAgY2xvdWQucHVzaChhcmMpO1xuICAgIHJlbWFpbmluZ0xpbmUgPSBbcG9pbnQsIHJlbWFpbmluZ0xpbmVbMV1dO1xuICAgIHBvaW50ID0gZ2V0SW50ZXJzZWN0aW9uKHJlbWFpbmluZ0xpbmUsIHJhZGl1cyAqIDIpO1xuICB9XG5cbiAgcmV0dXJuIGNsb3VkLmpvaW4oJycpO1xufTtcblxuXG5jb25zdCBmaXhSYWRpdXNUb0ZpdExpbmUgPSAobGluZSwgcmFkaXVzKSA9PiB7XG4gIGNvbnN0IGxlbmd0aCA9IGxpbmVMZW5ndGgobGluZSk7XG4gIGNvbnN0IHNlZ21lbnRzID0gTWF0aC5yb3VuZChsZW5ndGggLyAoMiAqIHJhZGl1cykgKyAwLjUpO1xuXG4gIHJldHVybiAwIDwgbGVuZ3RoID8gbGVuZ3RoIC8gc2VnbWVudHMgLyAyIDogcmFkaXVzO1xufTtcblxuXG5jb25zdCBzdmdDbG91ZCA9IChwb2x5bGluZSwgcmFkaXVzLCBjbG9zZWQsIGlud2FyZCkgPT4ge1xuICBsZXQgY2xvdWQgPSAnJztcbiAgbGV0IGluZCA9IDE7XG4gIGxldCBsaW5lO1xuICBjb25zdCBjbnQgPSBwb2x5bGluZS5sZW5ndGg7XG5cbiAgZm9yICg7IGluZCA8IGNudDsgKytpbmQpIHtcbiAgICBpZiAoMCA+PSBpbmQpIHtcbiAgICAgIGNsb3VkICs9ICcgJztcbiAgICB9XG4gICAgbGluZSA9IFtwb2x5bGluZVtpbmQgLSAxXSwgcG9seWxpbmVbaW5kXV07XG4gICAgY2xvdWQgKz0gY2xvdWRBTGluZShsaW5lLCBmaXhSYWRpdXNUb0ZpdExpbmUobGluZSwgcmFkaXVzKSwgaW53YXJkKTtcbiAgfVxuXG4gIC8vIGNsb3NlIHRvIGdldCBwb2x5Z29uXG4gIGlmICh0cnVlID09PSBjbG9zZWQpIHtcbiAgICBsaW5lID0gW3BvbHlsaW5lW2luZCAtIDFdLCBwb2x5bGluZVswXV07XG4gICAgY2xvdWQgKz0gJyAnICsgY2xvdWRBTGluZShsaW5lLCBmaXhSYWRpdXNUb0ZpdExpbmUobGluZSwgcmFkaXVzKSwgaW53YXJkKTtcbiAgfVxuXG4gIC8vIFNWRyBjb21wbGFpbnMgYWJvdXQgZW1wdHkgcGF0aCBzdHJpbmdzXG4gIHJldHVybiBjbG91ZCB8fCAnTTAgMCc7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gc3ZnQ2xvdWQ7XG4iXX0=
