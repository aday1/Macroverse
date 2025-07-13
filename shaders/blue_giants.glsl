#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

float sphere(vec3 p, float r) {
    return length(p) - r;
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// Noise function for gas clouds
float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 st = v_coord * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, -5.0);
    vec3 rd = normalize(vec3(st, 1.0));

    float d = 0.0;
    vec3 color = vec3(0.0);
    
    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * d;
        float ds = 1000.0;
        
        // Multiple blue giant cores with fusion effects
        for (int j = 0; j < 4; j++) {
            float j_float = float(j);
            vec3 offset = vec3(
                sin(u_time * 0.5 + j_float) * 3.0,
                cos(u_time * 0.3 + j_float) * 2.0,
                sin(u_time * 0.7 + j_float) * 1.5
            );
            vec3 q = p - offset;
            
            // Core with pulsing fusion
            float corePulse = 1.0 + sin(u_time * 8.0 + j_float * 2.0) * 0.3;
            float coreSize = 1.2 + u_audio * 0.8;
            ds = smin(ds, sphere(q, coreSize * corePulse), 0.8);
            
            // Gaseous atmosphere around each core
            float gasDistance = length(q) - (2.5 + j_float * 0.5);
            float gasNoise = fbm(q * 0.5 + u_time * 0.2);
            gasDistance += gasNoise * 0.5;
            ds = smin(ds, gasDistance, 1.2);
        }
        
        // Add gravitational lensing effect
        float gravity = 1.0 / (1.0 + length(p) * 0.1);
        ds *= gravity;
        
        if (ds < 0.001) {
            // Calculate heat/fusion colors
            float heat = 1.0 - d / 50.0;
            float fusion = sin(u_time * 10.0 + d) * 0.5 + 0.5;
            
            // Blue giant spectrum with fusion heat
            color = mix(
                vec3(0.1, 0.3, 1.0),  // Cool blue
                vec3(1.0, 0.8, 0.3),  // Fusion yellow
                fusion * heat
            );
            
            // Add atmospheric scattering
            vec3 gasColor = vec3(0.2, 0.4, 0.9) * fbm(p * 0.3);
            color = mix(color, gasColor, 0.3);
            
            // Heat pulsing effect
            color *= (1.0 + sin(u_time * 6.0) * 0.4);
            break;
        }
        d += ds * 0.5;  // Slower marching for gas effects
        
        if (d > 100.0) break;
    }
    
    // Add background gas clouds
    float bgGas = fbm(vec3(st * 2.0, u_time * 0.1)) * 0.2;
    color += vec3(0.05, 0.1, 0.3) * bgGas;

    FragColor = vec4(color, 1.0);
}
