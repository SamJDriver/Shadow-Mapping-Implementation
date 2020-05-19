/*Sam Driver
CS 412
5/19/20
Spring 2020

This program implements shadow mapping for a forest scene with the included obj files.
Controls complement the scene, and can change various properties about the shadows
to help visualize solutions to common shadow mapping problems.
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
import { ShadowMap } from './ShadowMap.js';

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
    constructor(gl, canvas, shader, depthShader) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.shader = shader;
        this.depthShader = depthShader;

        this.offsetFactor = 0;
        this.offsetUnits = 0;

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

        // Culling Mode
        this.culling = 'off';

        // UI manager object
        this.controls = new Controls(this.canvas, this, gl, shader);
        
        // Create the meshes for the scene
        this.grid = new Grid(gl);   // The reference grid
        this.ground = new GLMesh(gl, makeGround());

        //The Shadow Map object
        this.shadowMap = new ShadowMap(gl);
        this.shadowMap.setBuffers(gl, 2048);

        this.loadObj(gl);
    }

    loadObj(gl){
        // Load the obj from an OBJ file.  Caution: the fetch method is 
        // asynchronous, so the mesh will not be immediately available.  
        this.t3Green = null;
        fetch('obj2/t3-green.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t3Green = new GLMesh(gl, objMesh);
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
        
        this.dead3 = null;
        fetch('obj2/dead3.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.dead3 = new GLMesh(gl, objMesh);
            });

        this.trunk2 = null;
        fetch('obj2/trunk.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.trunk2 = new GLMesh(gl, objMesh);
            });

        this.land1 = null;
        fetch('obj2/L1.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.land1 = new GLMesh(gl, objMesh);
            });
        
        this.land2 = null;
        fetch('obj2/L2.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.land2 = new GLMesh(gl, objMesh);
            });

        this.t2orange = null;
        fetch('obj2/t2-orange.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t2orange = new GLMesh(gl, objMesh);
            });

        this.t1Green = null;
        fetch('obj2/t1-green.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t1Green = new GLMesh(gl, objMesh);
            });

        this.t4Green = null;
        fetch('obj2/t4-green.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t4Green = new GLMesh(gl, objMesh);
            });
        
        this.t4Cyan = null;
        fetch('obj2/t4-cyan.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t4Cyan = new GLMesh(gl, objMesh);
            });

        this.t7Purple = null;
        fetch('obj2/t7-purple.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t7Purple = new GLMesh(gl, objMesh);
            });
        this.t2Yellow = null;
        fetch('obj2/t2-yellow.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t2Yellow = new GLMesh(gl, objMesh);
            });
        this.rock9 = null;
        fetch('obj2/r9.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.rock9 = new GLMesh(gl, objMesh);
            });
        this.rock5 = null;
        fetch('obj2/r5.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.rock5 = new GLMesh(gl, objMesh);
            });

        this.g7Green = null;
        fetch('obj2/g7-green.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.g7Green = new GLMesh(gl, objMesh);
            });
            
        this.f4 = null;
        fetch('obj2/f4.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.f4 = new GLMesh(gl, objMesh);
            });

        this.p1Green = null;
        fetch('obj2/p1-green.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.p1Green = new GLMesh(gl, objMesh);
            });
        this.t6Green = null;
        fetch('obj2/t6-green.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t6Green = new GLMesh(gl, objMesh);
            });
        
        this.t6Purple = null;
        fetch('obj2/t6-purple.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.t6Purple = new GLMesh(gl, objMesh);
            });
        
        this.rock10 = null;
        fetch('obj2/r10.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.rock10 = new GLMesh(gl, objMesh);
            });

    this.t3Cyan = null;
    fetch('obj2/t3-cyan.obj')
        .then( (response) => {
            return response.text();
        })
        .then( (text) => {
            let objMesh = loadObjMesh(text);
            this.t3Cyan = new GLMesh(gl, objMesh);
        });

    this.rock4 = null;
    fetch('obj2/r4.obj')
        .then( (response) => {
            return response.text();
        })
        .then( (text) => {
            let objMesh = loadObjMesh(text);
            this.rock4 = new GLMesh(gl, objMesh);
        });
        
    this.t5Yellow = null;
    fetch('obj2/t5-yellow.obj')
        .then( (response) => {
            return response.text();
        })
        .then( (text) => {
            let objMesh = loadObjMesh(text);
            this.t5Yellow = new GLMesh(gl, objMesh);
        });

    this.dead2 = null;
    fetch('obj2/dead2.obj')
        .then( (response) => {
            return response.text();
        })
        .then( (text) => {
            let objMesh = loadObjMesh(text);
            this.dead2 = new GLMesh(gl, objMesh);
        });

    this.dead4 = null;
    fetch('obj2/dead4.obj')
        .then( (response) => {
            return response.text();
        })
        .then( (text) => {
            let objMesh = loadObjMesh(text);
            this.dead4 = new GLMesh(gl, objMesh);
        });
    
    this.p2Green = null;
    fetch('obj2/p2-green.obj')
        .then( (response) => {
            return response.text();
        })
        .then( (text) => {
            let objMesh = loadObjMesh(text);
            this.p2Green = new GLMesh(gl, objMesh);
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
     * @param {ShaderProgram} depthShader the shader to use when writing to the depth buffer

     */
    render(time, gl, wireShader, flatShader, depthShader) {
        
        this.pollKeys();

        wireShader.use(gl);
        //Set the position of the light
        const lightPos = vec3.transformMat4([], this.shadowMap.worldLightPos, this.viewMatrix);
        gl.uniform3fv(gl.getUniformLocation(wireShader.programId, 'lightPosition'), lightPos);

        //Populate the depth buffer
        depthShader.use(gl);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowMap.depthFrameBuffer);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.viewport(0,0,this.shadowMap.depthTextureSize, this.shadowMap.depthTextureSize);
        //Set the uniforms for the depth shader
        gl.uniformMatrix4fv(depthShader.uniform('uModel'), false, this.modelMatrix);
        gl.uniformMatrix4fv(depthShader.uniform('uView'), false, this.shadowMap.getLightMatrix());
        gl.uniformMatrix4fv(depthShader.uniform('uProj'), false, this.shadowMap.getProjectionMatrix(this.width, this.height));

        if (this.culling == 'true'){
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.FRONT);
        } else
            gl.disable(gl.CULL_FACE);

        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(this.offsetFactor, this.offsetUnits);

    
        //Drawing our first pass
        this.drawScene(gl, depthShader);

        //Reset to using the default FRAMEBUFFER
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0,0,this.width, this.height);

        //Select channel 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.shadowMap.depthTexture);

        // Draw the objects using wireShader
        wireShader.use(gl);
        this.setMatrices(gl, wireShader);
        gl.uniform1i(wireShader.uniform('depthTexture'), 0);
        gl.uniformMatrix4fv(wireShader.uniform('shadowMatrix'), false, this.shadowMap.getShadowMatrix(this.width, this.height));

        gl.disable(gl.CULL_FACE);
        gl.disable(gl.POLYGON_OFFSET_FILL);

        //Draw the second pass
        this.drawScene(gl, wireShader);

        //Draw the grid using flatShader *for scene setup*
        // flatShader.use(gl);
        // this.setMatrices(gl, flatShader);
        // this.grid.render(gl, flatShader);
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
            this.camera.dolly(-2);
        }
        if (this.controls.keyDown("KeyA")){
            this.camera.track(-2, 0);
        }
        if (this.controls.keyDown("KeyS")){
            this.camera.dolly(2);
        }
        if (this.controls.keyDown("KeyD")){
            this.camera.track(2, 0);
        }
        if (this.controls.keyDown("KeyQ")){
            this.camera.track(0, 2);
        }
        if (this.controls.keyDown("KeyE")){
            this.camera.track(0, -2);
        }

        this.camera.getViewMatrix(this.viewMatrix);
    }

    /**
     * Draw the objects in the scene.
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader the shader program
     */
    drawScene(gl, shader, b) {
        mat4.identity(this.modelMatrix);

        //Drawing the ground
        mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * -0.5, [1,0,0]);
        this.setDesiredUniforms(gl, shader, [0.172285, 0.389000, 0.026521], 225.00, [0,0,0], [1,1,1]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        this.ground.render(gl, shader);
        

        //Drawing the objects in the scene

        //Green Tree 1
        if(this.t1Green !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [85, 83, -230]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI/30, [1,0,0])
            mat4.scale(this.modelMatrix, this.modelMatrix, [30, 30, 30]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);

            this.t1Green.render(gl, shader);
        }

        //Green tree 3
        if(this.t3Green !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-300, 55, 300]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * 0.3, [0,1,0])
            mat4.scale(this.modelMatrix, this.modelMatrix, [20, 20, 20]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);

            this.t3Green.render(gl, shader);
        }

        //Green Tree 4
        if(this.t4Green !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-340, 227, 150]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [20, 20, 20]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.t4Green.render(gl, shader);
        }

        if (this.t4Cyan !== null){
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-300, 227, 50]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [20, 20, 20]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI/30, [1,0,0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.t4Cyan.render(gl, shader);
        }

        if (this.t3Cyan !== null){
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [250, 75, -65]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI/3, [0,1,0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.t3Cyan.render(gl, shader);
        }

        //Orange tree
        if(this.t2orange !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [0, 105, -300]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [20, 20, 20]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);

            this.t2orange.render(gl, shader);
        }

        //Purple tree
        if(this.t7Purple !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-150, 57.5, 350]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * 0.3, [0,1,0])
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.t7Purple.render(gl, shader);
        }

        if(this.t6Purple !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-100, 124, -50]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.t6Purple.render(gl, shader);
        }

        if(this.t6Green !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [135, 75.5, 55]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [15, 15, 15]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * 0.3, [0,1,0])
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.t6Green.render(gl, shader);
        }

        //Yellow tree
        if(this.t2Yellow !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-200, 132, 450]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.t2Yellow.render(gl, shader);
        }
        if(this.t5Yellow !== null) {
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-410, 177, -420]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.t5Yellow.render(gl, shader);
        }

        //Dead stump
        if(this.trunk !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [10, 2.1, 15]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.trunk.render(gl, shader);
        }
        if(this.dead2 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [15, 2.42, 8]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * 0.3, [0,1,0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);

            this.dead2.render(gl, shader);
        }
        if(this.dead3 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-6, 1.8, 8]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * 0.3, [0,1,0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);

            this.dead3.render(gl, shader);
        }

        if(this.dead4 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [14, 2.1, -12]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI * 0.4, [0,1,0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);

            this.dead4.render(gl, shader);
        }

        //Tree trunk
        if(this.trunk2 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-13.5, 2.5, -2]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI/5, [1, 0, 0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.trunk2.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [35, 35, 35]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [4, 0.7, 5]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI/3, [0, 1, 0]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI/5, [0, 0, 1]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.trunk2.render(gl, shader);
        }

        //Rocky Hill1
        if(this.land1 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [15, 15, 15]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-25, 5.0, 5.0]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI/6, [0, 1, 0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.land1.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [13, 13, 13]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-15, 4.3, 5.0]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI/8, [0, 0, 1]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI/6, [0, 1, 0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.land1.render(gl, shader);

        }

        if(this.land2 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [10, 15, 10]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [20.0, 15.0, 25.0]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.land2.render(gl, shader);
        }

        //Land Decorations
        if(this.rock9 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [5, 5, 5]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-50, 19, 6]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.rock9.render(gl, shader);
        }
        if(this.rock4 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [12, 12, 12]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [18, 0.8, 7]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.rock4.render(gl, shader);
        }
        if(this.rock5 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [5, 5, 5]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-60, 20, 20]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.rock5.render(gl, shader);
        }
        if(this.rock10 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [10, 10, 10]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-25, 4, -30]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI/4, [0, 1, 0]);
            mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI/2, [0, 0, 1]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.rock10.render(gl, shader);
        }
        if(this.p1Green !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [9, 9, 9]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-30, 10.8, 18]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.p1Green.render(gl, shader);
        }
        if(this.p2Green !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [13, 13, 13]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [7, 1.7, 23]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.p2Green.render(gl, shader);
        }
        if(this.f4 !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [7, 7, 7]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-30, 0, -10]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.f4.render(gl, shader);
        }
        if(this.g7Green !== null) {
            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [15, 15, 15]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-16.5, 6.5, 8]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.g7Green.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [15, 15, 15]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-17, 6.5, 6]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.g7Green.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [15, 15, 15]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-20, 6.5, 1]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.g7Green.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.scale(this.modelMatrix, this.modelMatrix, [15, 15, 15]);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-20, 6.5, 1]);
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            this.g7Green.render(gl, shader);
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
            mat4.perspective(this.projMatrix, glMatrix.toRadian(45.0), aspect, 0.5, 3000.0);
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
            let xScale = deltaX * 0.001;
            let yScale = deltaY * 0.001;
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

        this.camera.dolly(delta * 1);
        this.camera.getViewMatrix(this.viewMatrix);
    }

    /**
     * Resets the camera to a default position and orientation.  This is 
     * called when the user clicks the "Reset Camera" button.
     */
    resetCamera() {
        // Set the camera's default position/orientation
        this.camera.orient([500,100,0], [0,20,0], [0,1,0]);
        // Retrieve the new view matrix
        this.camera.getViewMatrix(this.viewMatrix);
    }

    /**
     * Called when the camera mode is changed.
     * 
     * @param {String} type the camera mode: either "fly" or "mouse" 
     */
    setMode(type) {
        this.mode = type;
    }

    setLinearMode(gl, value, mode){
        this.shadowMap.setBuffers(gl, value, mode);
    }

    setShadowResolution(gl, value){
        this.shadowMap.setBuffers(gl, value);
    }
}