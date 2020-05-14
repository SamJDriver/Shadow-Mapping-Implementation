
import * as mat4 from './gl-matrix/mat4.js';
import * as vec3 from './gl-matrix/vec3.js';
import * as glMatrix from './gl-matrix/common.js';

export class ShadowMap {

    /**
     * @param {WebGL2RenderingContext} gl the WebGL2 render context 
     */    
    constructor(gl){
        this.worldLightPos = [0, 1000, 0];
        this.u = [1,0,0];
        this.v = [0,1,0];
        this.w = [0,0,1];
        this.orient(this.worldLightPos, [0,0,0], [1,0,0]);

        this.rotation = mat4.create();
        this.translation = mat4.create();
        //store depth value to plane 
        //depth is same as point 
        //when theyre actually equal due to precision floating point limit > sometimes bigger sometimes smaller
        //turn on front face culling in shadow pass

        //Creating and binding depth buffer texture
        this.depthTexture = gl.createTexture();
        this.depthTextureSize = 512;
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT32F, // internal format
            this.depthTextureSize,   // width
            this.depthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.FLOAT,    // type
            null);   

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LESS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.depthFrameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFrameBuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, 
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.depthTexture, 0);

    }

    orient( eye, at, up ) {
        // Set the camera's position
        this.worldLightPos = eye;

        // Compute the camera's axes
        // w = eye - at
        vec3.subtract(this.w, this.worldLightPos, at);
        vec3.normalize(this.w, this.w);
        // u = up x w
        vec3.cross(this.u, up, this.w);
        vec3.normalize(this.u, this.u);
        // v = w x u
        vec3.cross(this.v, this.w, this.u);
        vec3.normalize(this.v, this.v);
    }

    /* 
     * @param {mat4} out the view matrix is written to this parameter 
     */
    getLightMatrix(){
        // The inverse rotation
        mat4.set(this.rotation, 
            this.u[0], this.v[0], this.w[0], 0, 
            this.u[1], this.v[1], this.w[1], 0,
            this.u[2], this.v[2], this.w[2], 0, 
            0, 0, 0, 1);

        // The inverse translation
        this.translation[12] = -this.worldLightPos[0];
        this.translation[13] = -this.worldLightPos[1];
        this.translation[14] = -this.worldLightPos[2];

        // View matrix = inverse rotation * inverse translation
        return mat4.multiply([], this.rotation, this.translation);
    }

    getShadowMatrix(){
        //treat light as camera
        //1.transform into light's camera coords
        //2. transform into light's clip coords > zcoord is pseudo depth < comes from pos of the point we're shading in 2nd pass comes from mesh
        //3. bias that into range appropriate for texture > make x,y (-1,1) > (0,1)
        //final position is texture lookup

        var matView = mat4.create();
        matView = this.getLightMatrix();

        var matProj = mat4.create();
        matProj = this.getProjectionMatrix();

        var matBias = mat4.create();
        mat4.translate(matBias, matBias, [0.5, 0.5, 0.5]);
        mat4.scale(matBias, matBias, [0.5, 0.5, 0.5]);

        var matFinal = mat4.create();
        mat4.multiply(matFinal, matFinal, matBias); //3
        mat4.multiply(matFinal, matFinal, matProj); //2
        mat4.multiply(matFinal, matFinal, matView); //1

        return matFinal;
    }

    getProjectionMatrix(){
        const aspect = 1;
        return mat4.perspective([], glMatrix.toRadian(60.0), aspect, 0.5, 10000.0);
    }
}