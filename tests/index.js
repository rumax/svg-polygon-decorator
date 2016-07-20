const tap = require('tap');
const svgCloud = require('./../src/decorator');
const testCases = require('./cases.json');


tap.test('no point', function (t) {
  const polyline = [];
  const radius =  8;
  const closed = true;
  const inward = false;
  const expected = 'M0,0';

  t.equals(svgCloud(polyline, radius, closed, inward),
    expected);

  t.end();
});


tap.test('1 point', function (t) {
  const polyline = [[0, 0]];
  const radius =  8;
  const closed = true;
  const inward = false;
  const expected = 'M0,0';

  t.equals(svgCloud(polyline, radius, closed, inward),
    expected);

  t.end();
});


tap.test('zero size line', function (t) {
  const polyline = [[0, 0], [0, 0]];
  const radius =  8;
  const closed = true;
  const inward = false;
  const expected = 'M0,0 M0,0';

  t.equals(svgCloud(polyline, radius, closed, inward),
    expected);

  t.end();
});


testCases.forEach((item) => {
  tap.test(item.name, function (t) {
    t.equals(svgCloud(item.polyline, item.radius, item.closed, item.inward),
      item.cloud);
    t.end();
  });
});
