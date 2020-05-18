import {SliderControl} from './slider-control.js';
/**
 * Manages the event listeners for keyboard, mouse and DOM events.
 */
export class Controls {

    /**
     * Constructs a Controls object and adds the appropriate event 
     * listeners to DOM elements.
     * 
     * @param {DOMElement} canvas the canvas element 
     * @param {Scene} scene the Scene object 
     */
    constructor(canvas, scene, gl, shader) {
        this.canvas = canvas;
        this.scene = scene;
        this.mousePrevious = null;
        this.downKeys = new Set();

        const initExposure = 550000.0;
        const initResolution = 2048;

        const groupEl = document.getElementById('main-group');
        const offsetEl = document.getElementById('offset-group');

        // Keyboard listeners
        document.addEventListener("keydown", (e) => {
            this.downKeys.add(e.code);

            // Prevent the space key from scrolling
            if( e.code === "Space" ) e.preventDefault();
        });
        document.addEventListener("keyup", (e) => {
            this.downKeys.delete(e.code);
            if( e.code === "Space" ) e.preventDefault();
        });

        // Mouse listeners
        const mouseMoveFn = (e) => this.mouseMoveEvent(e);
        canvas.addEventListener('mousedown', (e) => {
            this.canvas.addEventListener('mousemove', mouseMoveFn );
        });
        canvas.addEventListener('mouseup', (e) => {
            this.canvas.removeEventListener('mousemove', mouseMoveFn);
            this.mousePrevious = null;
        });
        // Mouse wheel listener
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scene.mouseWheel(e.deltaY);
        });
        
        // Controls
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', (e) => this.scene.resetCamera() );

        document.getElementById('mouse-mode-rb').addEventListener('change', (e) => this.modeChange(e));
        document.getElementById('fly-mode-rb').addEventListener('change', (e) => this.modeChange(e));


        shader.use(gl);
        gl.uniform1f(shader.uniform('exposure'), initExposure);

        this.exposureSlider = new SliderControl( "Exposure:", "exposure-slider", groupEl, 
            {min: 5.0, max: 25.0, initial: Math.log2(initExposure), precision: 1,
            valueFn: (v) => Math.pow(2, v) });
        this.exposureSlider.addInputListener( (e) => {
            const v = Math.pow(2, e.target.value);
            shader.use(gl);
            gl.uniform1f(shader.uniform('exposure'), v);
            this.update();
        });

        this.resolutionSlider = new SliderControl( "Resolution:", "resolution-slider", groupEl, 
                {min: 256, 
                max: 4096, 
                initial:initResolution, 
                precision: 1,
                valueFn: (v) => v });
        this.resolutionSlider.addInputListener( (e) => {
            const v = e.target.value;
            this.scene.setShadowResolution(gl, v);
            this.update();
        });

        this.offsetSliderFactor = new SliderControl( "Offset Factor:", "factor-slider", offsetEl, 
                {min: 0, 
                max: 100, 
                initial: 0, 
                precision: 5,
                valueFn: (v) => v });
        this.offsetSliderFactor.addInputListener( (e) => {
            const v = e.target.value;
            this.scene.offsetFactor = v;
            this.update();
        });
        
        this.offsetSliderUnits = new SliderControl( "Offset Units:", "units-slider", offsetEl, 
                {min: 0, 
                max: 100, 
                initial: 0, 
                precision: 5,
                valueFn: (v) => v });
        this.offsetSliderUnits.addInputListener( (e) => {
            const v = e.target.value;
            this.scene.offsetUnits =  v;
            this.update();
        });
        
        this.pcfOffsetSlider = new SliderControl( "Offset:", "units-slider", document.getElementById('pcf-group'), 
                {min: 0, 
                max: 3, 
                initial: 0, 
                precision: 5,
                valueFn: (v) => v });
        this.pcfOffsetSlider.addInputListener( (e) => {
            const v = e.target.value;
            shader.use(gl);
            gl.uniform1f(shader.uniform('pcfOffset'), v);
            this.update();
        }); 


    }

    update() {
        this.canvas.dispatchEvent(new Event('repaint'));
    }

    /**
     * Returns true if the key is currently down, false otherwise.
     * 
     * @param {string} key the key code (e.g. "KeyA", "KeyB", etc.) see:
     *   https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code 
     *   for details on the key codes.
     */
    keyDown( key ) {
        return this.downKeys.has(key);
    }

    /**
     * Called when a mousemove event is received.
     * 
     * @param {MouseEvent} e the MouseEvent object 
     */
    mouseMoveEvent(e) {
        const x = e.offsetX, y = e.offsetY;
        if( this.mousePrevious === null ) {
            this.mousePrevious = [x, y];
        }
        const deltaX = x - this.mousePrevious[0];
        const deltaY = y - this.mousePrevious[1];

        if( e.buttons === 1 ) {
            if( e.shiftKey ) {
                this.scene.shiftLeftDrag(deltaX, deltaY);
            } else {
                this.scene.leftDrag(deltaX, deltaY);
            }
        }

        this.mousePrevious[0] = x;
        this.mousePrevious[1] = y;
    }

    /**
     * Called when the perspective/orthographic radio button is changed.
     * 
     * @param {Event} e 
     */
    perspOrthoChange(e) {
        if( e.target.value === "perspective" ) {
            this.scene.setViewVolume("perspective");
        } else {
            this.scene.setViewVolume("orthographic");
        }
    }

    /**
     * Called when the fly/mouse mode radio button is changed.
     * 
     * @param {Event} e 
     */
    modeChange(e) {
        if( e.target.value === "mouse") {
            this.scene.setMode("mouse");
        } else {
            this.scene.setMode("fly");
        }
    }
}