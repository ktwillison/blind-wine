/**
    * Actions Required:
    * viz_container_id is the id of the *div* in the html into which we will add the gui and stats elements
    * viz_canvas_id is the id of the *canvas* in the html into which the visualization is rendered
    * change these when you port to your heroku portfolio, but leave it as is for now
    * example: in your portfolio, you might have a container called "boids_container"
**/
var viz_container_id = "boids_container"; 
var viz_control_id = "boids_controls"
var viz_canvas_id = "three_boid"; 

// ------------------------------------------------------------------------------------------------
// renderer, camera, scene 

// constants
var SCENE_WIDTH = SCENE_HEIGHT = 500;

// bind renderer (THREE.WebGLRenderer ==> GPU!) to canvas, set size, and enable antialiasing
var canvas = document.getElementById(viz_canvas_id);
var renderer = new THREE.WebGLRenderer({ 
    "canvas": canvas, 
    "antialias": true,
    "alpha": true
});
renderer.setClearColor( 0xffffff ); 
renderer.setSize(SCENE_WIDTH, SCENE_HEIGHT);

// set up a camera and move it to a good viewing place (orbitcontrols overwrites this)
var camera = new THREE.PerspectiveCamera(45, SCENE_WIDTH / SCENE_HEIGHT, 1, 10000);
camera.position.set(SCENE_WIDTH, SCENE_HEIGHT / 2, 800);

// scene - where we put our meshes
var scene = new THREE.Scene();

// container object (like a sub-scene) which we use to store meshes
var container = new THREE.Object3D();
scene.add(container);

// ------------------------------------------------------------------------------------------------
// helpers

// orbit controls binds mouse events (over the canvas only) to the camera
var controls = new THREE.OrbitControls(camera, canvas); // it is super important to add the second arg, it scopes the events to those fired over the canvas and not the entire doc
controls.addEventListener('change', function(){
    renderer.render(scene, camera);
});

// axes
var axes = new THREE.AxisHelper2(SCENE_WIDTH);
axes.update();
container.add(axes.mesh);

// bounding box
var bounding_box = new THREE.BoundingBoxHelper(container); // can also be tied to scene but since our objects are in the container we tie it here
bounding_box.update(); // render

// remove axes only after updating bounds
container.remove(axes.mesh);
//container.add(bounding_box);


// stats (fps graph)
var stats = new Stats();
var stats_dom = document.getElementById(viz_control_id).appendChild(stats.domElement); // add stats to the container
stats_dom.style.position = "static";

// ------------------------------------------------------------------------------------------------
// lights

var ambient_light = new THREE.AmbientLight(0xffffff);
ambient_light.name = "ambient_light";
scene.add(ambient_light);

var directional_light = new THREE.DirectionalLight(0xffffff)
directional_light.position.set(1,1,1);
directional_light.name = "directional_light";
scene.add(directional_light);

// ------------------------------------------------------------------------------------------------
// user interface

// dat.gui
var gui = new dat.GUI();
document.getElementById(viz_control_id).appendChild( gui.domElement );

// this is an object that stores the state of the controls
// when you click on the controls, it changes the values therein
// you can reference this later in the program, for example while rendering
var controls_state = {
    "ambient_light": true,
    "directional_light": true,
    "ambient_light_intensity": 1,
    "directional_light_intensity": 1,
    "show_axis": false,
    "show_bounding_box": false,
    "coeff_alignment": 1,
    "coeff_cohesion": 1,
    "coeff_separation": 1,
    "hue" : 0,
    "disco_mode": false,
};

gui.add(controls_state, 'ambient_light')
    .onChange(function(on) {
        scene.getObjectByName('ambient_light').intensity = 1 * on;
    });

gui.add(controls_state, 'directional_light')
    .onChange(function(on) {
        scene.getObjectByName('directional_light').intensity = 1 * on;
    });

gui.add(controls_state, 'ambient_light_intensity', 0, 1)
    .onChange(function(value) {
        scene.getObjectByName('ambient_light').intensity = value;
    });

gui.add(controls_state, 'directional_light_intensity', 0, 1)
    .onChange(function(value) {
        scene.getObjectByName('directional_light').intensity = value;
    });

gui.add(controls_state, 'coeff_alignment', 0, 5)
    .onChange(function(value) {
       for (var i = 0; i < n; i++) { boids[i].coeff_alignment = value; }
    });

gui.add(controls_state, 'coeff_cohesion', 0, 5)
    .onChange(function(value) {
        for (var i = 0; i < n; i++) { boids[i].coeff_cohesion = value; }
    });

gui.add(controls_state, 'coeff_separation', 0, 5)
    .onChange(function(value) {
        for (var i = 0; i < n; i++) { boids[i].coeff_separation = value; }
    });

gui.add(controls_state, 'hue', 0, 1)
    .onChange(function(value) {
        for (var i = 0; i < n; i++) { boids[i].color.setHSL(value, .85, .5); }
    });

gui.add(controls_state, 'disco_mode')
    .onChange(function(value) {
        for (var i = 0; i < n; i++) { boids[i].disco_mode = value; }
    });

gui.add(controls_state, 'show_axis')
    .onChange(function(on) {
        if (on) { container.add(axes.mesh);    } 
        else    { container.remove(axes.mesh); }
    });

gui.add(controls_state, 'show_bounding_box')
    .onChange(function(on) {
        if (on) { container.add(bounding_box);    } 
        else    { container.remove(bounding_box); }
    });

// --------------------------------------------------------- 
// add boids

var n = 200,
    boids = [];

for (var i = 0; i < n; i++) {
    // Add boids to the visualization
    var b = new Boid(SCENE_WIDTH, SCENE_HEIGHT);
    b.set_parameters();
    b.init_mesh_obj(); 
    container.add(b.mesh);
    boids.push(b);
}

// ------------------------------------------------------------------------------------------------
// animation loop

function animate() {
    // start stats recording
    stats.begin();

    // render boids
    for (var i = 0; i < n; i++) {
        var b = boids[i];
        b.run(boids);
        b.update_mesh();
    }

    // render scene
    renderer.render(scene, camera);

    // end stats recording
    stats.end();

    // run again
    requestAnimationFrame(animate);
}

// start visualization
requestAnimationFrame(animate);
