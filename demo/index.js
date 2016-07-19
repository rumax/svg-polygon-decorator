import svgCloud from '../src/decorator';

const form = document.querySelector('.controls');
const clouds = [
  {
    selector: '#cloud1',
    coords: [[10, 120], [180, 120], [230, 180]]
  },
  {
    selector: '#cloud2',
    coords: [[20, 300], [180, 300],  [200, 330], [190, 360], [140, 420],
             [70, 380]]
  },
  {
    selector: '#cloud3',
    coords: [[460, 120], [290, 120], [240, 180]]
  },
  {
    selector: '#cloud4',
    coords: [[450, 300], [290, 300], [270, 330], [280, 360], [330, 420],
             [400, 380]]
  }
];


const render = () => {
  let elem;
  let cloud;
  const radius = parseFloat(form.radius.value);

  for (let ind = 0, cnt = clouds.length; ind < cnt; ++ind) {
    elem = document.querySelector(clouds[ind].selector);
    cloud = svgCloud(clouds[ind].coords, radius);
    elem.setAttribute('d', cloud);
  }
};

form.addEventListener('change', render);
render();
