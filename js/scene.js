/*Sam Driver
CS 412
4-15-20
Spring 2020
PA 4 - Camera Controls
*/
import { Grid } from "./grid.js";
import { Camera } from "./camera.js"
import { Controls } from './controls.js';
import { loadObjMesh } from './objloader.js';
import * as vec3 from './gl-matrix/vec3.js';
import { GLMesh } from './glmesh.js';
import * as glMatrix from './gl-matrix/common.js';
import * as mat4 from "./gl-matrix/mat4.js";
import { makeGround } from "./ground.js";

/**
 * Represents the entire scene.
 */
export class Scene {

    /**
     * Constructs a Scene object.
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {HTMLElement} canvas the canvas element 
     */
    constructor(gl, canvas, shader) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        // Variables used to store the model, view and projection matrices.
        this.modelMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        // Create the camera object and set to default position/orientation
        this.camera = new Camera();
        this.resetCamera();

        // The projection type
        this.projType = "perspective";

        // The camera mode
        this.mode = "mouse";

        // UI manager object
        this.controls = new Controls(this.canvas, this, gl, shader);
        
        // Create the meshes for the scene
        this.grid = new Grid(gl);   // The reference grid
        this.ground = new GLMesh(gl, makeGround());

        //The position of the light in world coordinates
        this.worldLightPos = [0, 15, -5];

        // Load the obj from an OBJ file.  Caution: the fetch method is 
        // asynchronous, so the mesh will not be immediately available.  
        // Make sure to check for null before rendering.  Use this as an example
        // to load other OBJ files.
        this.t1Green = null;
        fetch('obj2/t3-green.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t1Green = new GLMesh(gl, objMesh);
            });

        this.trunk = null;
        fetch('obj2/dead1.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.trunk = new GLMesh(gl, objMesh);
            });

    }

    /**
     * A convenience method to set all three matrices in the shader program.
     * Don't call this if you only need to set one or two matrices, instead,
     * just set it "manually" by calling gl.uniformMatrix4fv.
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {ShaderProgram} shader the shader 
     */
    setMatrices(gl, shader) {
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.uniformMatrix4fv(shader.uniform('uView'), false, this.viewMatrix);
        gl.uniformMatrix4fv(shader.uniform('uProj'), false, this.projMatrix);
    }

    /**
     * Draw the Scene.  This method will be called repeatedly as often as possible.
     * 
     * @param {Number} time time in milliseconds
     * @param {WebGL2RenderingContext} gl 
     * @param {ShaderProgram} wireShader the shader to use when drawing meshes 
     * @param {ShaderProgram} flatShader the shader to use when drawing the Grid
     */
    render(time, gl, wireShader, flatShader) {
        
        this.pollKeys();

        // Draw the objects using wireShader
        wireShader.use(gl);
        this.setMatrices(gl, wireShader);

        //Set the position of the light
        const lightPos = vec3.transformMat4([], this.worldLightPos, this.viewMatrix);
        gl.uniform3fv(gl.getUniformLocation(wireShader.programId, 'lightPosition'), lightPos);

        this.drawScene(gl, wireShader);

        // Draw the grid using flatShader
        flatShader.use(gl);
        this.setMatrices(gl, flatShader);
        this.grid.render(gl, flatShader);
    }

    /**
     * Checks to see which keys are currently pressed, and updates the camera
     * based on the results.
     */
    pollKeys() {
        // Only do this in "fly" mode.
        if( this.mode !== "fly" ) return;

        // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
      

        if (this.controls.keyDown("KeyW")){
            this.camera.dolly(-.03);
        }
        if (this.controls.keyDown("KeyA")){
            this.camera.track(-.03, 0);
        }
        if (this.controls.keyDown("KeyS")){
            this.camera.dolly(.03);
        }
        if (this.controls.keyDown("KeyD")){
            this.camera.track(.03, 0);
        }
        if (this.controls.keyDown("KeyQ")){
            this.camera.track(0, .03);
        }
        if (this.controls.keyDown("KeyE")){
            this.camera.track(0, -.03);
        }

        this.camera.getViewMatrix(this.viewMatrix);
    }

    /**
     * Draw the objects in the scene.
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader the shader program
     */
    drawScene(gl, shader) {
        mat4.identity(this.modelMatrix);
        mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * 1.5, [1,0,0]);

        // Set the model matrix in the shader
        this.setDesiredUniforms(gl, shader, [0.172285, 0.389000, 0.026521], 225.00, [0,0,0], [1,1,1]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        this.ground.render(gl, shader);

        if(this.t1Green !== null) {
            mat4.identity(this.modelMatrix);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * 0.3, [0,1,0])
            mat4.translate(this.modelMatrix, this.modelMatrix, [-52.0, 15, 0.0]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [5, 5, 5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);

            this.t1Green.render(gl, shader);
        }

        if(this.trunk !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [5, 5, 5]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [0,2.1, 0.0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);

            this.trunk.render(gl, shader);
        }
        // Reset the model matrix to the identity
        mat4.identity(this.modelMatrix);
    }

    setDesiredUniforms(gl, shader, Kd, Ns, Ks, Ka){
        gl.uniform3fv(gl.getUniformLocation(shader.programId, 'Kd'), Kd);
        gl.uniform1f(gl.getUniformLocation(shader.programId, 'Ns'), Ns);
        gl.uniform3fv(gl.getUniformLocation(shader.programId, 'Ks'), Ks);
        gl.uniform3fv(gl.getUniformLocation(shader.programId, 'Ka'), Ka);
    }

    /**
     * Called when the canvas is resized.
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Number} width the width of the canvas in pixels 
     * @param {Number} height the height of the canvas in pixels 
     */
    resize(gl, width, height) {
        this.width = width;
        this.height = height;
        this.setProjectionMatrix();

        // Sets the viewport transformation
        gl.viewport(0, 0, width, height);
    }

    /**
     * Sets this.projMatrix to the appropriate projection matrix.
     */
    setProjectionMatrix() {
        const aspect = this.width / this.height;
        if (this.projType === 'perspective'){
            mat4.perspective(this.projMatrix, glMatrix.toRadian(45.0), aspect, 0.5, 1000.0);
        }else if(this.projType === 'orthographic'){
            mat4.ortho(this.projMatrix, -aspect, aspect, -1, 1, 0.5, 1000.0)
        }
    }

    /**
     * This method is called when the mouse moves while the left mouse button
     * is pressed.  This should apply either a "orbit" motion to the camera
     * or a "turn" motion depending on this.mode.
     * @param {Number} deltaX change in the mouse's x coordinate
     * @param {Number} deltaY change in the mouse's y coordinate
     */
    leftDrag( deltaX, deltaY ) { 
        if (this.mode === 'mouse'){
            let xScale = deltaX * 0.001;
            let yScale = deltaY * 0.001;
            this.camera.orbit(-xScale, -yScale);
        }
        else if (this.mode === 'fly'){
            let xScale = deltaX * 0.0005;
            let yScale = deltaY * 0.0005;
            this.camera.turn(-xScale, -yScale);
        }
        this.camera.getViewMatrix(this.viewMatrix);
    }

    /**
     * This method is called when the mouse moves while the left mouse button
     * is pressed and the shift key is down.  This should apply a "track" motion 
     * to the camera when in "mouse" mode.
     * 
     * @param {Number} deltaX change in the mouse's x coordinate
     * @param {Number} deltaY change in the mouse's y coordinate
     */
    shiftLeftDrag( deltaX, deltaY ) {
        this.camera.track(-deltaX * 0.003, deltaY * 0.003);
        this.camera.getViewMatrix(this.viewMatrix);
    }

    /**
     * Called when the mouse wheel is turned.
     * 
     * @param {Number} delta change amount
     */
    mouseWheel(delta) {
        // Update the camera by applying a "dolly" motion.  The amount should be
        // proportional to delta.

        this.camera.dolly(delta * 0.1);
        this.camera.getViewMatrix(this.viewMatrix);
    }

    /**
     * Resets the camera to a default position and orientation.  This is 
     * called when the user clicks the "Reset Camera" button.
     */
    resetCamera() {
        // Set the camera's default position/orientation
        this.camera.orient([0,1,3], [0,0,0], [0,1,0]);
        // Retrieve the new view matrix
        this.camera.getViewMatrix(this.viewMatrix);
    }

    /**
     * Set the view volume type.  This is called when the perspective/orthographic radio button
     * is changed.
     * 
     * @param {String} type projection type.  Either "perspective" or "orthographic" 
     */
    setViewVolume( type ) {
        this.projType = type;
        this.setProjectionMatrix();
    }

    /**
     * Called when the camera mode is changed.
     * 
     * @param {String} type the camera mode: either "fly" or "mouse" 
     */
    setMode(type) {
        this.mode = type;
    }

}