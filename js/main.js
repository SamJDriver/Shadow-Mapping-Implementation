import * as ShaderCode from './shader_code.js';
import { ShaderProgram } from './shader.js';
import { Scene } from './scene.js';

import * as glMatrix from './gl-matrix/common.js';

let gl = null;           // The WebGL context object
let canvas = null;       // The canvas element
let flatShader = null;   // The shader program for the grid
let wireShader = null;   // The shader program for the
let scene = null;        // The scene

window.addEventListener("load", main);

function main() {
    glMatrix.setMatrixArrayType(Array);

    // Initialize the WebGL context
    canvas = document.getElementById('draw-canvas');
    gl = canvas.getContext("webgl2");

    // Setup WebGL
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Compile/link shader programs
    wireShader = ShaderProgram.compile(gl, ShaderCode.FLAT_WIRE_VERT, ShaderCode.FLAT_WIRE_FRAG);
    flatShader = ShaderProgram.compile(gl, ShaderCode.FLAT_VERT, ShaderCode.FLAT_FRAG);

    window.addEventListener('resize', resize);
    scene = new Scene(gl, canvas);
    
    resize();
    startAnimation();
}

/**
 * Called when the window is resized.
 */
function resize() {
    const el = document.getElementById('draw-container');
    const w = el.clientWidth, h = el.clientHeight;
    canvas.width = w;
    canvas.height = h;
    scene.resize(gl, w, h);
}

/**
 * This starts our animation "loop".  It might look a bit like a recursive
 * loop, but that's not quite what's happening.  It uses the function:
 * window.requestAnimationFrame to schedule a call to the frameFunction.
 * The frameFunction draws the scene by calling draw, and then requests 
 * another call to frameFunction.  This function should only be called once
 * to start the animation.
 */
function startAnimation( ) {
    const frameFunction = (time) => {
        draw(time);
        window.requestAnimationFrame(frameFunction);
    };
    window.requestAnimationFrame(frameFunction);
}

/**
 * Draws the scene.  This function should not be called directly.
 * @param {Number} t animation time in milliseconds
 */
function draw(t) {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the scene
    scene.render(t, gl, wireShader, flatShader);
}
