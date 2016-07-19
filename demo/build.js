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
  var elem = void 0,
      coords = void 0;
  var cloud = void 0;
  var radius = parseFloat(form['radius'].value);

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
//   let b = pointA.y - pointA.x * (pointB.y - pointA.y) / (pointB.x - pointA.x);
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

var cloudALine = function cloudALine(line, radius, nextLine) {
  var lineLength = void 0;
  var pointA = line[0];
  var pointB = line[1];
  var intersection = getIntersection(line, radius * 2);
  var cloud = ['M ' + line[0][0] + ', ' + line[0][1]];

  while (intersection) {
    cloud.push(' A ' + radius + ' ' + radius + ' 0 1 1 ' + intersection[0] + ' ' + intersection[1]);
    line = [intersection, line[1]];
    intersection = getIntersection(line, radius * 2);
  }

  return cloud.join('');
};

var fixRadiusToFitLine = function fixRadiusToFitLine(line, radius) {
  var length = lineLength(line);
  var segments = Math.round(length / (2 * radius) + 0.5);
  var newRadius = length / segments;

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

  //Last line (last point to first point)
  line = [poligon[ind - 1], poligon[0]];
  cloud += cloudALine(line, fixRadiusToFitLine(line, radius));

  return cloud;
};

module.exports = svgCloud;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vXFxpbmRleC5qcyIsInNyY1xcZGVjb3JhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7O0FBRUEsSUFBTSxPQUFPLFNBQVMsYUFBVCxDQUF1QixXQUF2QixDQUFiO0FBQ0EsSUFBTSxTQUFTLENBQ2I7QUFDRSxZQUFVLFNBRFo7QUFFRSxVQUFRLENBQUMsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUFELEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFaLEVBQXdCLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBeEI7QUFGVixDQURhLEVBS2I7QUFDRSxZQUFVLFNBRFo7QUFFRSxVQUFRLENBQUMsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUFELEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFaLEVBQXlCLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBekIsRUFBcUMsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFyQyxFQUFpRCxDQUFDLEdBQUQsRUFBTSxHQUFOLENBQWpELEVBQ0MsQ0FBQyxFQUFELEVBQUssR0FBTCxDQUREO0FBRlYsQ0FMYSxFQVViO0FBQ0UsWUFBVSxTQURaO0FBRUUsVUFBUSxDQUFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBRCxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBYixFQUF5QixDQUFDLEdBQUQsRUFBTSxHQUFOLENBQXpCO0FBRlYsQ0FWYSxFQWNiO0FBQ0UsWUFBVSxTQURaO0FBRUUsVUFBUSxDQUFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBRCxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBYixFQUF5QixDQUFDLEdBQUQsRUFBTSxHQUFOLENBQXpCLEVBQXFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBckMsRUFBaUQsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFqRCxF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QVcsSUFBWCxFQUFpQixtQkFBbUIsSUFBbkIsRUFBeUIsTUFBekIsQ0FBakIsQ0FBVDtBQUNEOztBQUVEO0FBQ0EsU0FBTyxDQUFDLFFBQVEsTUFBTSxDQUFkLENBQUQsRUFBbUIsUUFBUSxDQUFSLENBQW5CLENBQVA7QUFDQSxXQUFTLFdBQVcsSUFBWCxFQUFpQixtQkFBbUIsSUFBbkIsRUFBeUIsTUFBekIsQ0FBakIsQ0FBVDs7QUFFQSxTQUFPLEtBQVA7QUFDRCxDQWhCRDs7QUFtQkEsT0FBTyxPQUFQLEdBQWlCLFFBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBzdmdDbG91ZCBmcm9tICcuLi9zcmMvZGVjb3JhdG9yJztcblxuY29uc3QgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250cm9scycpO1xuY29uc3QgY2xvdWRzID0gW1xuICB7XG4gICAgc2VsZWN0b3I6ICcjY2xvdWQxJyxcbiAgICBjb29yZHM6IFtbMTAsIDEyMF0sIFsxODAsIDEyMF0sIFsyMzAsIDE4MF1dXG4gIH0sXG4gIHtcbiAgICBzZWxlY3RvcjogJyNjbG91ZDInLFxuICAgIGNvb3JkczogW1syMCwgMzAwXSwgWzE4MCwgMzAwXSwgIFsyMDAsIDMzMF0sIFsxOTAsIDM2MF0sIFsxNDAsIDQyMF0sXG4gICAgICAgICAgICAgWzcwLCAzODBdXVxuICB9LFxuICB7XG4gICAgc2VsZWN0b3I6ICcjY2xvdWQzJyxcbiAgICBjb29yZHM6IFtbNDYwLCAxMjBdLCBbMjkwLCAxMjBdLCBbMjQwLCAxODBdXVxuICB9LFxuICB7XG4gICAgc2VsZWN0b3I6ICcjY2xvdWQ0JyxcbiAgICBjb29yZHM6IFtbNDUwLCAzMDBdLCBbMjkwLCAzMDBdLCBbMjcwLCAzMzBdLCBbMjgwLCAzNjBdLCBbMzMwLCA0MjBdLFxuICAgICAgICAgICAgIFs0MDAsIDM4MF1dXG4gIH1cbl07XG5cblxuY29uc3QgcmVuZGVyID0gKCkgPT4ge1xuICBsZXQgZWxlbSwgY29vcmRzO1xuICBsZXQgY2xvdWQ7XG4gIGNvbnN0IHJhZGl1cyA9IHBhcnNlRmxvYXQoZm9ybVsncmFkaXVzJ10udmFsdWUpO1xuXG4gIGZvciAobGV0IGluZCA9IDAsIGNudCA9IGNsb3Vkcy5sZW5ndGg7IGluZCA8IGNudDsgKytpbmQpIHtcbiAgICBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihjbG91ZHNbaW5kXS5zZWxlY3Rvcik7XG4gICAgY2xvdWQgPSBzdmdDbG91ZChjbG91ZHNbaW5kXS5jb29yZHMsIHJhZGl1cyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2QnLCBjbG91ZCk7XG4gIH1cbn1cblxuZm9ybS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCByZW5kZXIpO1xucmVuZGVyKCk7XG4iLCJcbi8qKlxuICogR2VuZXJhdGVzIHN2ZyBjbG91ZCBmb3IgcG9seWdvblxuICpcbiAqIEBwYXJhbSAge1BvbHlnb259IHBvbGlnb25cbiAqXG4gKiBAcmV0dXJuIHtQYXRofVxuICovXG5cbi8vIGxldCBsaW5lU2VnbWVudEludGVyc2VjdGlvbiA9IChjaXJjbGUsIHJhZGl1cywgcG9pbnRBLCBwb2ludEIpID0+IHtcbi8vICAgY29uc3QgeFNoaWZ0ID0gY2lyY2xlLng7XG4vLyAgIGNvbnN0IHlTaGlmdCA9IGNpcmNsZS55O1xuLy9cbi8vICAgLy9SZWNldCBjaXJjbGUgdG8gKDAsMCkgY29vcmRpbmF0ZVxuLy8gICBjaXJjbGUueCA9IDA7XG4vLyAgIGNpcmNsZS55ID0gMDtcbi8vICAgcG9pbnRBLnggLT0geFNoaWZ0O1xuLy8gICBwb2ludEEueSAtPSB5U2hpZnQ7XG4vLyAgIHBvaW50Qi54IC09IHhTaGlmdDtcbi8vICAgcG9pbnRCLnkgLT0geVNoaWZ0O1xuLy9cbi8vICAgbGV0IGsgPSAocG9pbnRCLnkgLSBwb2ludEEueSkgLyAocG9pbnRCLnggLSBwb2ludEEueCk7XG4vLyAgIGxldCBiID0gcG9pbnRBLnkgLSBwb2ludEEueCAqIChwb2ludEIueSAtIHBvaW50QS55KSAvIChwb2ludEIueCAtIHBvaW50QS54KTtcbi8vXG4vLyAgIGNvbnN0IEEgPSAxICsgayAqIGs7XG4vLyAgIGNvbnN0IEIgPSAyICogayAqIGI7XG4vLyAgIGNvbnN0IEMgPSBiICogYiAtIHJhZGl1cyAqIHJhZGl1cztcbi8vICAgY29uc3QgRCA9IEIgKiBCIC0gNCAqIEEgKiBDO1xuLy9cbi8vICAgbGV0IHgxID0gbnVsbDtcbi8vICAgbGV0IHgyID0gbnVsbDtcbi8vICAgbGV0IHkxID0gbnVsbDtcbi8vICAgbGV0IHkyID0gbnVsbDtcbi8vXG4vLyAgIGlmICgwIDwgRCkge1xuLy8gICAgIGNvbnNvbGUubG9nKCcyIHBvaW50cyBpbnRlcnNlY3RzJyk7XG4vLyAgICAgeDEgPSAoLUIgKyBNYXRoLnNxcnQoRCkpIC8gKDIgKiBBKTtcbi8vICAgICB4MiA9ICgtQiAtIE1hdGguc3FydChEKSkgLyAoMiAqIEEpO1xuLy9cbi8vICAgICBpZiAocG9pbnRBLnggPCB4MSAmJiBwb2ludEIueCA+IHgxKSB7XG4vLyAgICAgICByZXR1cm4gW3gxICsgeFNoaWZ0LCAoeDEgKiBrICArIGIpICsgeVNoaWZ0XTtcbi8vICAgICB9XG4vLyAgIH0gZWxzZSBpZiAoMCA9PT0gRCkge1xuLy8gICAgIGNvbnNvbGUubG9nKCcxIHBvaW50IGludGVyc2VjdCcpO1xuLy8gICAgIHgxID0geDIgPSAoLUIgKyBNYXRoLnNxcnQoRCkpIC8gKDIgKiBBKTtcbi8vICAgfSBlbHNlIHtcbi8vICAgICBjb25zb2xlLmxvZygnMCBwb2ludHMgaW50ZXJzZWN0Jyk7XG4vLyAgIH1cbi8vXG4vLyAgIHJldHVybiBudWxsICE9PSB4MiA/IFt4MiArIHhTaGlmdCwgKHgyICogayAgKyBiKSArIHlTaGlmdF0gOiBudWxsO1xuLy8gfTtcblxuY29uc3QgWCA9IDA7XG5jb25zdCBZID0gMTtcbmNvbnN0IEZMT0FUX1BSRUNJU0UgPSAwLjAwMDAwMTtcblxuXG5sZXQgbGluZUxlbmd0aCA9IChsaW5lKSA9PiB7XG4gIGxldCBwb2ludEEgPSBsaW5lWzBdO1xuICBsZXQgcG9pbnRCID0gbGluZVsxXTtcblxuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChwb2ludEJbWF0gLSBwb2ludEFbWF0pLCAyKSArXG4gICAgTWF0aC5wb3coKHBvaW50QltZXSAtIHBvaW50QVtZXSksIDIpKTtcbn07XG5cblxubGV0IGdldEludGVyc2VjdGlvbiA9IChsaW5lLCBsZW5ndGgpID0+IHtcbiAgbGV0IHBvaW50QyA9IG51bGw7XG4gIGxldCBwb2ludEEgPSBsaW5lWzBdO1xuICBsZXQgcG9pbnRCID0gbGluZVsxXTtcbiAgbGV0IGRlbHRhO1xuICBsZXQgeFBvaW50O1xuICBsZXQgeVBvaW50O1xuICBsZXQgZnVsbExlbiA9IGxpbmVMZW5ndGgobGluZSk7XG5cbiAgaWYgKE1hdGguYWJzKGZ1bGxMZW4gLSBsZW5ndGgpIDwgRkxPQVRfUFJFQ0lTRSkge1xuICAgIHBvaW50QyA9IHBvaW50QjtcbiAgfSBlbHNlIGlmIChmdWxsTGVuID4gbGVuZ3RoKSB7XG4gICAgZGVsdGEgPSBsZW5ndGggLyAoZnVsbExlbiAtIGxlbmd0aClcbiAgICB4UG9pbnQgPSAocG9pbnRBW1hdICsgZGVsdGEgKiBwb2ludEJbWF0pIC8gKDEgKyBkZWx0YSk7XG4gICAgeVBvaW50ID0gKHBvaW50QVtZXSArIGRlbHRhICogcG9pbnRCW1ldKSAvICgxICsgZGVsdGEpO1xuICAgIHBvaW50QyA9IFt4UG9pbnQsIHlQb2ludF07XG4gIH1cblxuICByZXR1cm4gcG9pbnRDO1xufTtcblxuXG5sZXQgY2xvdWRBTGluZSA9IChsaW5lLCByYWRpdXMsIG5leHRMaW5lKSA9PiB7XG4gIGxldCBsaW5lTGVuZ3RoO1xuICBsZXQgcG9pbnRBID0gbGluZVswXTtcbiAgbGV0IHBvaW50QiA9IGxpbmVbMV07XG4gIGxldCBpbnRlcnNlY3Rpb24gPSBnZXRJbnRlcnNlY3Rpb24obGluZSwgcmFkaXVzICogMik7XG4gIGxldCBjbG91ZCA9IFsnTSAnICsgbGluZVswXVswXSArICcsICcgKyBsaW5lWzBdWzFdXTtcblxuICB3aGlsZSAoaW50ZXJzZWN0aW9uKSB7XG4gICAgY2xvdWQucHVzaCgnIEEgJyArIHJhZGl1cyArICcgJyArIHJhZGl1cyArICcgMCAxIDEgJyArXG4gICAgICBpbnRlcnNlY3Rpb25bMF0gKyAnICcgKyBpbnRlcnNlY3Rpb25bMV0pO1xuICAgIGxpbmUgPSBbaW50ZXJzZWN0aW9uLCBsaW5lWzFdXTtcbiAgICBpbnRlcnNlY3Rpb24gPSBnZXRJbnRlcnNlY3Rpb24obGluZSwgcmFkaXVzICogMik7XG4gIH1cblxuICByZXR1cm4gY2xvdWQuam9pbignJyk7XG59O1xuXG5cbnZhciBmaXhSYWRpdXNUb0ZpdExpbmUgPSAobGluZSwgcmFkaXVzKSA9PiB7XG4gIGNvbnN0IGxlbmd0aCA9IGxpbmVMZW5ndGgobGluZSk7XG4gIGxldCBzZWdtZW50cyA9IE1hdGgucm91bmQobGVuZ3RoIC8gKDIgKiByYWRpdXMpICsgMC41KTtcbiAgY29uc3QgbmV3UmFkaXVzID0gbGVuZ3RoIC8gc2VnbWVudHM7XG5cbiAgcmV0dXJuIGxlbmd0aCAvIHNlZ21lbnRzIC8gMjtcbn07XG5cblxubGV0IHN2Z0Nsb3VkID0gKHBvbGlnb24sIHJhZGl1cykgPT4ge1xuICBsZXQgY2xvdWQgPSAnTSAnICsgcG9saWdvblswXVswXSArICcsICcgKyBwb2xpZ29uWzBdWzFdO1xuICBsZXQgaW5kID0gMTtcbiAgbGV0IGxpbmU7XG4gIGNvbnN0IGNudCA9IHBvbGlnb24ubGVuZ3RoO1xuXG4gIGZvciAoOyBpbmQgPCBjbnQ7ICsrIGluZCkge1xuICAgIGxpbmUgPSBbcG9saWdvbltpbmQgLSAxXSwgcG9saWdvbltpbmRdXTtcbiAgICBjbG91ZCArPSBjbG91ZEFMaW5lKGxpbmUsIGZpeFJhZGl1c1RvRml0TGluZShsaW5lLCByYWRpdXMpKTtcbiAgfVxuXG4gIC8vTGFzdCBsaW5lIChsYXN0IHBvaW50IHRvIGZpcnN0IHBvaW50KVxuICBsaW5lID0gW3BvbGlnb25baW5kIC0gMV0sIHBvbGlnb25bMF1dO1xuICBjbG91ZCArPSBjbG91ZEFMaW5lKGxpbmUsIGZpeFJhZGl1c1RvRml0TGluZShsaW5lLCByYWRpdXMpKTtcblxuICByZXR1cm4gY2xvdWQ7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gc3ZnQ2xvdWQ7XG4iXX0=
