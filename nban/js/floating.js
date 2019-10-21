const nearDist = 0.1;
const farDist = 5000;
const card = 24;

var container;
var camera, scene, raycaster, renderer, sphereInter;
var thingieTransform;

var mouse = new THREE.Vector2();
var radius = 100, theta = 0;
var gsec = 0;
var gi = 0;
var gScale;

let mouseX = 0;
let mouseY = 0;
const mouseFX = {
  windowHalfX: window.innerWidth / 2,
  windowHalfY: window.innerHeight / 2,
  coordinates: function(coordX, coordY) {
    mouseX = (coordX - mouseFX.windowHalfX) * 10;
    mouseY = (coordY - mouseFX.windowHalfY) * 10;
  },
};


init();
animate();


function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, nearDist, farDist );
  camera.position.x = farDist * -2;
  camera.position.z = 500;

  renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
  //renderer.setClearColor("#3d30c2");
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.querySelector("#canvas-wrapper").appendChild(renderer.domElement);
  container.appendChild( renderer.domElement );

  //MOUSE INTERACTIONS
  raycaster = new THREE.Raycaster();
  raycaster.linePrecision = 5;

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'wheel', onMouseWheel, false );

  window.addEventListener( 'resize', onWindowResize, false );

  //CREATE GEOMETRIES
  const cubeSize = 120;
  const glob = new THREE.SphereBufferGeometry(cubeSize, cubeSize/3, cubeSize/3);
  const field = new THREE.PlaneBufferGeometry(cubeSize*2, cubeSize*2);

  //CREATE THINGIES
  const skinFiles = [];
  const skinPaths = [
    'assets/icons/grendilla.png',
    'assets/icons/growth-swirl.png',
    'assets/icons/guavas.png',
    'assets/icons/octo.png',
    'assets/icons/orange-ip.png',
    'assets/icons/ip.png',
    'assets/icons/ip2.png',
    'assets/icons/limbo.png',
    'assets/icons/sponge-ip.png'
  ];
  const skins = [];
  for(i=0; i<skinPaths.length; i++){
    skinFiles[i] = new THREE.TextureLoader();
    skins[i] = new THREE.MeshBasicMaterial({ map: skinFiles[i].load(skinPaths[i]), transparent: true });
  }
  thingieTransform = new THREE.Object3D();

  for ( var i = 0; i < (card*3); i ++ ) {
    var object;
    var chooseSkin;
    if(Math.random()<0.5){
      chooseSkin = skins[Math.floor(Math.random()*skins.length)];
      object = new THREE.Mesh(glob, chooseSkin );
    } else {
      chooseSkin = skins[Math.floor(Math.random()*skins.length)];
      object = new THREE.Mesh(field, chooseSkin );
    }
    const dist = farDist / 3;
    const distDouble = dist * 2;
    const tau = 2 * Math.PI;
    const size = (2*Math.random()) + 0.2;

    object.position.x = Math.random() * distDouble - dist;
    object.position.y = Math.random() * distDouble - dist;
    object.position.z = Math.random() * distDouble - dist;
    object.rotation.x = Math.random() * tau;
    object.rotation.y = Math.random() * tau;
    object.rotation.z = Math.random() * tau;
    object.scale.x = size;
    object.scale.y = size;
    object.scale.z = size;

    thingieTransform.add( object );
  }
  scene.add( thingieTransform );
}


//MOUSE INTERACTIONS
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
let dummyX=0;
let dummyY=0;

function onMouseWheel( event ) {
  //event.preventDefault();
  //console.log(event);
  dummyX = Math.min(Math.max(dummyX + event.deltaX, 350), 800);
  dummyY = Math.min(Math.max(dummyY + event.deltaY, 250), 800);
  mouseFX.coordinates(dummyX, dummyY);
  // console.log([dummyX, dummyY]);
}
function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseDown( event ) {
  event.preventDefault();
  mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  var interThingie = raycaster.intersectObjects( thingieTransform.children, true );

  if ( interThingie.length > 0 ) {

    for(let i=0;i<thingieTransform.children.length; i++) {
      if (interThingie[0].object == thingieTransform.children[i]) {
        gi = i;
        gsec = 0;
        gScale = Math.random()*5 + 0.2;
      }
    }
  }
  }

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {

  // var backdrop = document.getElementById("gradient");
  // backdrop.style.backgroundImage = "linear-gradient(to left, #7db8af, #3d30c2)"";

  //move camera view
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (mouseY * -1 - camera.position.y) * 0.05;

  camera.lookAt( scene.position );
  camera.updateMatrixWorld();

  // find intersections
  raycaster.setFromCamera( mouse, camera );

  for(var i=0; i<card; i++) {
    thingieTransform.children[i].rotation.y = 2*Math.PI*Math.sin( THREE.Math.degToRad( theta ));
    thingieTransform.children[i+card].rotation.y = 2*Math.PI*Math.sin( THREE.Math.degToRad( 90 + theta ));
    thingieTransform.children[i+(card*2)].rotation.y = 2*Math.PI*Math.sin( THREE.Math.degToRad( 180 + theta ));

    thingieTransform.children[i].position.x = THREE.Math.euclideanModulo(thingieTransform.children[i].position.x + 3, farDist/2);
    thingieTransform.children[i+card].position.y = THREE.Math.euclideanModulo(thingieTransform.children[i+card].position.y + 5, farDist/2);
    thingieTransform.children[i+(card*2)].position.z = THREE.Math.euclideanModulo(thingieTransform.children[i+(card*2)].position.z + 2, farDist/2);
  }

  //scaling for clicking on thingies
  thingieTransform.children[gi].scale.x = gScale + (0.125*Math.sin(0.20*gsec)+0.5)*Math.exp((-1/2)*gsec)*Math.sin(5*gsec + Math.PI/4);
  thingieTransform.children[gi].scale.y = gScale + (0.125*Math.sin(0.25*gsec)+0.5)*Math.exp((-1/2)*gsec)*Math.sin(5*gsec + Math.PI/2);
  thingieTransform.children[gi].scale.z = gScale + (0.125*Math.sin(0.23*gsec)+0.5)*Math.exp((-1/2)*gsec)*Math.sin(5*gsec);

  theta += 0.1;
  gsec += 0.1;

  renderer.render( scene, camera );
}
