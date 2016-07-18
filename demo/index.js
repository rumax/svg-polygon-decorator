import svgCloud from '../src/decorator';

const cloudEl1 = document.querySelector('#cloud1');
const cloudEl2 = document.querySelector('#cloud2');

const radius = 8;

var coordinates = [
  [10, 120], [180, 120], [230, 180]
];

let cloud1 = svgCloud(coordinates, radius);
cloudEl1.setAttribute('d', cloud1);

let coordinates2 = [
  [20, 300], [180, 300],  [200, 330], [190, 360], [140, 420], [70, 380]
];

let cloud2 = svgCloud(coordinates2, radius);
cloudEl2.setAttribute('d', cloud2);
