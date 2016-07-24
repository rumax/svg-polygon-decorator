(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.svgCloud = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Generates svg cloud for polygon
 *
 * @param  {Polygon} polygon
 *
 * @return {SVG Path}
 */

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
  var cloud = ['M' + line[0][X] + ',' + line[0][Y]];
  var sweep = true === inward ? 0 : 1;
  var lArc = true === inward ? 0 : 1;

  while (point) {
    arc = ' A' + radius + ',' + radius + ' 0 ' + lArc + ',' + sweep + ' ' + point[X] + ',' + point[Y];
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
  var _radius = 0 < radius ? radius : 1;
  var cnt = polyline.length;

  for (; ind < cnt; ++ind) {
    if (0 >= ind) {
      cloud += ' ';
    }
    line = [polyline[ind - 1], polyline[ind]];
    cloud += cloudALine(line, fixRadiusToFitLine(line, _radius), inward);
  }

  // close to get polygon
  if (true === closed && 1 < cnt) {
    line = [polyline[ind - 1], polyline[0]];
    cloud += ' ' + cloudALine(line, fixRadiusToFitLine(line, _radius), inward);
  }

  // SVG complains about empty path strings
  return cloud || 'M0,0';
};

module.exports = svgCloud;

},{}]},{},[1])(1)
});