export const FLAT_VERT = `#version 300 es
layout(location=0) in vec4 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;

out vec2 fUv;

uniform mat4 uModel;  // Object to world
uniform mat4 uView;   // World to camera
uniform mat4 uProj;   // Projection matrix

void main() {
    fUv = vUv;

    // Convert position to clip coordinates
    gl_Position = uProj * uView * uModel * vPosition;
}`;

export const FLAT_FRAG = `#version 300 es
precision mediump float;

out vec4 fragColor;
uniform vec3 uColor;

in vec2 fUv;

void main() {
    vec4 color = vec4(uColor,1);
    if( gl_FrontFacing ) fragColor = color;
    else fragColor = vec4(1,0,0,1);
}`;

export const FLAT_WIRE_VERT = `#version 300 es
layout(location=0) in vec4 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;

out vec2 fUv;

uniform mat4 uModel;  // Object to world
uniform mat4 uView;   // World to camera
uniform mat4 uProj;   // Projection matrix



out vec3 fNormal; //fragment normal in eye space
out vec3 fPosition; //fragment position in eye space

void main() {
    // Convert position to clip coordinates

    mat4 mv = uView * uModel;
    fNormal = normalize(mat3(mv) * vNormal);
    fPosition = (mv * vec4(vPosition)).xyz;
    fUv = vUv;

    gl_Position = uProj * vec4(fPosition, 1.0);
    
}`;

export const FLAT_WIRE_FRAG = `#version 300 es
precision highp float;

#define NUM_LIGHTS 1

uniform vec3 lightColors[ NUM_LIGHTS ];
uniform vec3 lightPositions[ NUM_LIGHTS ]; // in eye space

uniform float exposure;
uniform float roughness;
uniform float Ns;
uniform vec3 Ka;
uniform vec3 Kd;
uniform vec3 Ks;
uniform float d;

in vec2 fUv;
in vec3 fNormal;    // fragment normal in eye space
in vec3 fPosition;  // fragment position in eye space

uniform sampler2D diffuseTexture;

vec3 to_sRGB(vec3 c) { return pow(c, vec3(1.0/2.2)); }
vec3 from_sRGB(vec3 c) { return pow(c, vec3(2.2)); }

out vec4 fragColor;


// uniform vec3 uColor;
// uniform vec3 uEdgeColor;
  
void main() {
    // vec3 color = vec3(1,0,0);
    // if( gl_FrontFacing ) {
    //     color = uColor;
    // }
    // fragColor = vec4( mix(uEdgeColor, color, gf), 1);

    vec3 n   = normalize(fNormal);     // Normal (eye coords)
    vec3 wo  = normalize(-fPosition);  // Towards eye (eye coords)
    
    vec3 finalColor = vec3(0,0,0);
    for (int i = 0; i < NUM_LIGHTS; i++) {
        vec3 wi = vec3(3,3,0) - fPosition;  
        float r = length(wi);         // Dist. to light
        wi = normalize(wi);           // Unit vector towards light
        vec3 h = normalize(wi + wo);  // "Halfway" vector

        // Diffuse reflectance is taken from the texture, and converted to linear color space
        //vec3 kd = from_sRGB(texture(diffuseTexture, fUv).rgb);
        vec3 kd =  vec3(0.142400, 0.051570, 0.023390);
        
        // Diffuse component
        vec3 diff = kd * max(dot(n, wi), 0.0);


        // Specular component
        vec3 spec = vec3( pow(max(dot(n, h), 0.0), 225.000000) * vec3(0.076000, 0.076000, 0.076000) );

        finalColor += (vec3(1.0,1.0,1.0)) * (diff + spec);
    }
    
    // Only shade if facing the light
    // Color the back faces an identifiable color
    if (gl_FrontFacing) {
       fragColor = vec4(to_sRGB(finalColor), 1.0); 
    } else {
        fragColor = vec4(0.0, 0.7, 0.0, 1.0); 
    }

}`;
