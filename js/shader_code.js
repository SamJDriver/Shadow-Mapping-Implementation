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
uniform mat4 shadowMatrix;

out vec3 fNormal; //fragment normal in eye space
out vec3 fPositionEye; //fragment position in eye space
out vec4 fPositionLight; //fragment position in light space

void main() {
    // Convert position to clip coordinates

    mat4 mv = uView * uModel;
    fNormal = normalize(mat3(mv) * vNormal);
    fPositionEye = (mv * vec4(vPosition)).xyz;
    fPositionLight = shadowMatrix * uModel * vPosition;//send to frag shader use to lookup texture
    fUv = vUv;

    gl_Position = uProj * vec4(fPositionEye, 1.0);
    
}`;

export const FLAT_WIRE_FRAG = `#version 300 es
precision highp float;
precision highp sampler2DShadow;

#define NUM_LIGHTS 1

uniform vec3 lightColors[ NUM_LIGHTS ];
uniform vec3 lightPosition; // in eye space

uniform float exposure;
uniform float roughness;
uniform float Ns;
uniform vec3 Ka;
uniform vec3 Kd;
uniform vec3 Ks;
uniform float d;

in vec2 fUv;
in vec3 fNormal;    // fragment normal in eye space
in vec3 fPositionEye;  // fragment position in eye space
in vec4 fPositionLight; //fragment position in light space

uniform sampler2DShadow depthTexture;

vec3 to_sRGB(vec3 c) { return pow(c, vec3(1.0/2.2)); }
vec3 from_sRGB(vec3 c) { return pow(c, vec3(2.2)); }

out vec4 fragColor;

// uniform vec3 uColor;
// uniform vec3 uEdgeColor;
  
void main() {
    vec3 n   = normalize(fNormal);     // Normal (eye coords)
    vec3 wo  = normalize(-fPositionEye);  // Towards eye (eye coords)
    
    vec3 finalColor = vec3(0,0,0);

    float gray = textureProj(depthTexture, fPositionLight);

    for (int i = 0; i < NUM_LIGHTS; i++) {
        vec3 wi = lightPosition - fPositionEye;  
        float r = length(wi);         // Dist. to light
        wi = normalize(wi);           // Unit vector towards light
        vec3 h = normalize(wi + wo);  // "Halfway" vector
        
        // Diffuse component
        vec3 diff = Kd * max(dot(n, wi), 0.0);

        // Specular component
        vec3 spec = vec3( pow(max(dot(n, h), 0.0), Ns) * Ks );

        finalColor += (vec3(1.0,1.0,1.0) / (r*r)) * (diff + spec);
    }
    
    // Only shade if facing the light
    // Color the back faces an identifiable color
    if (gl_FrontFacing) {
       fragColor = vec4(to_sRGB(finalColor * exposure), 1.0); 
    } else {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0); 
    }

    fragColor = vec4(gray, gray, gray, 1.0);

}`;
