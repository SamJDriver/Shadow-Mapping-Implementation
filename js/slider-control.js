
/**
 * Creates and abstracts an HTML slider.
 */
export class SliderControl {
    
    /**
     * Constructs a SliderControl and adds it to the DOM.
     * 
     * @param {string} label the text for the slider's label 
     * @param {string} id the text for the slider's HTML id attribute
     * @param {HTMLElement} parent the DOM element that will be the direct parent of this slider 
     * @param {object} config configuration.  This object can have the following attributes :
     *                           - min: the minimum value for the slider (default 0)
     *                           - max: the maximum value for the slider (default 100)
     *                           - step: the step value (default 'any')
     *                           - initial: the initial value (default (max - min) / 2)
     *                           - valueFn: a function to convert the value of the slider
     *                           - precision: how many digits to the right of the decimal to display
     */
    constructor( label, id, parent, config = {} ) {
        this.min = ('min' in config) ? config.min : 0;
        this.max = ('max' in config) ? config.max : 100;
        this.step = ('step' in config) ? config.step : 'any';
        this.initial = ('initial' in config) ? config.initial : (config.max - config.min) / 2;
        this.valueFn = ('valueFn' in config) ? config.valueFn : (v) => v ;
        this.precision = ('precision' in config) ? config.precision : 3;

        const container = document.createElement('div');
        container.classList.add('slider-control');
        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', id );
        labelEl.appendChild(document.createTextNode(label));
        container.appendChild(labelEl);
        this.slider = document.createElement('input');
        this.slider.setAttribute('type', 'range');
        this.slider.setAttribute('id', id);
        this.slider.setAttribute('min', this.min);
        this.slider.setAttribute('max', this.max);
        this.slider.setAttribute('step', this.step);
        this.slider.value = this.initial;
        container.appendChild(this.slider);
        const valueDiv = document.createElement('div');
        valueDiv.setAttribute('id', id + "-value");
        valueDiv.classList.add('slider-num');
        valueDiv.innerText = "0.000";
        container.appendChild(valueDiv);
        parent.appendChild(container);

        this.slider.addEventListener('input', (evt) => {
            const val = this.valueFn( parseFloat(evt.target.value) );
            valueDiv.innerText = val.toFixed(this.precision);
        });

        this.slider.dispatchEvent(new Event('input'));
    }

    /**
     * Add a listener to this slider's input event.
     * 
     * @param {function} f the function to be called when the slider generates an input event
     */
    addInputListener(f) {
        this.slider.addEventListener('input', f);
    }

}