// ---------------------------------------------------------
// Particle (Replaced with Boid) Render Prototype Methods

Boid.prototype.set_parameters = function() {
    this.radius = Math.random() * 40;
    this.max_momentum = 0;
    this.min_momentum = 4; 
    this.range_momentum = 0;
    this.disco_mode = false;
}

Boid.prototype.create_geometry = function() {
    this.geometry = new THREE.BoxGeometry(this.radius, this.radius, this.radius);
}

Boid.prototype.create_material = function() {
    // assign a random color from HSL space
    this.color = new THREE.Color(); // http://threejs.org/docs/#Reference/Math/Color
    this.color.setHSL(Math.random(), .85, .5);

    // http://threejs.org/docs/#Reference/Materials/MeshPhongMaterial
    this.material = new THREE.MeshPhongMaterial({
        "color": this.color,
        "specular": 0x333333,
        "shininess": .9,
        "transparent": true,
        "opacity": 0.75
    });
}

Boid.prototype.create_mesh = function() {
    // create the mesh
    // http://threejs.org/docs/#Reference/Objects/Mesh
    this.mesh = new THREE.Mesh(
        this.geometry,
        this.material
    );

    //set the position of the mesh to the position of the boid in xyz space
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
}

Boid.prototype.init_mesh_obj = function() {
    this.create_geometry();
    this.create_material();
    this.create_mesh();
}

Boid.prototype.update_mesh = function() {  
    // update the new position of the mesh to the current position of the boid in xyz space
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    /** bonus points:
        * No Action Required
        * calculate momentum and map it to color in HSL space
        * try adjusting the 1.1 and 0.4 scaling to see how that affects the color as a function of momentum
        * hook these two parameters into a dat.gui slider
    **/
    // If disco mode is on, increment hue
    if (this.disco_mode) {
        this.color.setHSL(this.color.getHSL().h + 0.01, 0.85, 0.5);
    }

    var momentum = this.velocity.length() * this.radius;
    if( momentum > this.max_momentum){ this.max_momentum = momentum; this.range_momentum = this.max_momentum - this.min_momentum; }
    if( momentum < this.min_momentum){ this.min_momentum = momentum; this.range_momentum = this.max_momentum - this.min_momentum; }
    this.mesh.material.color.setHSL( this.color.getHSL().h, momentum/this.range_momentum * 1.1, momentum/this.range_momentum * 0.4);
}