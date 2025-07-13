#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

// Noise functions for terrain generation
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Terrain height function
float terrain(vec2 p) {
    return fbm(p * 0.5) * 0.8 + fbm(p * 2.0) * 0.2;
}

void main() {
    vec2 st = v_coord;
    st.x *= u_resolution.x / u_resolution.y;
    
    // Scale coordinates for terrain
    vec2 terrainCoord = st * 8.0 + u_time * 0.1;
    
    // Generate height map
    float height = terrain(terrainCoord);
    float heightNormalized = height * 0.5 + 0.5;
    
    // Base terrain colors
    vec3 waterColor = vec3(0.1, 0.3, 0.6);
    vec3 sandColor = vec3(0.8, 0.7, 0.4);
    vec3 grassColor = vec3(0.2, 0.6, 0.2);
    vec3 mountainColor = vec3(0.5, 0.4, 0.3);
    vec3 snowColor = vec3(0.9, 0.9, 1.0);
    
    vec3 terrainColor;
    
    // Assign colors based on height
    if (heightNormalized < 0.2) {
        terrainColor = waterColor;
        // Add water movement
        terrainColor += vec3(0.0, 0.1, 0.2) * sin(u_time * 3.0 + terrainCoord.x);
    } else if (heightNormalized < 0.3) {
        terrainColor = mix(waterColor, sandColor, (heightNormalized - 0.2) * 10.0);
    } else if (heightNormalized < 0.6) {
        terrainColor = mix(sandColor, grassColor, (heightNormalized - 0.3) * 3.33);
        // Add vegetation variation
        float vegNoise = noise(terrainCoord * 4.0);
        terrainColor = mix(terrainColor, vec3(0.1, 0.4, 0.1), vegNoise * 0.3);
    } else if (heightNormalized < 0.8) {
        terrainColor = mix(grassColor, mountainColor, (heightNormalized - 0.6) * 5.0);
    } else {
        terrainColor = mix(mountainColor, snowColor, (heightNormalized - 0.8) * 5.0);
    }
    
    // Add atmospheric effects
    float atmosphere = 1.0 - length(st - vec2(0.5, 0.5)) * 1.5;
    atmosphere = clamp(atmosphere, 0.0, 1.0);
    
    // Add weather patterns
    float clouds = fbm(terrainCoord * 0.3 + u_time * 0.05);
    clouds = smoothstep(0.4, 0.8, clouds);
    vec3 cloudColor = vec3(0.8, 0.8, 0.9);
    terrainColor = mix(terrainColor, cloudColor, clouds * 0.5 * atmosphere);
    
    // Add life patterns (cellular automata-like)
    vec2 lifeCoord = terrainCoord * 2.0;
    float life = 0.0;
    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            vec2 neighbor = lifeCoord + vec2(float(i), float(j));
            life += noise(neighbor + u_time * 0.02);
        }
    }
    life /= 9.0;
    
    // Only add life to habitable zones
    if (heightNormalized > 0.25 && heightNormalized < 0.75) {
        float lifeIntensity = smoothstep(0.4, 0.6, life) * 0.3;
        vec3 lifeColor = vec3(0.3, 0.8, 0.3);
        terrainColor = mix(terrainColor, lifeColor, lifeIntensity);
        
        // Add bioluminescence effect
        if (lifeIntensity > 0.1) {
            terrainColor += vec3(0.1, 0.3, 0.1) * sin(u_time * 4.0 + life * 10.0) * lifeIntensity;
        }
    }
    
    // Audio reactive elements
    terrainColor *= (1.0 + u_audio * 0.3);
    
    // Add subtle fractal overlay for complexity
    float fractal = fbm(st * 16.0) * 0.1;
    terrainColor += vec3(fractal);
    
    // Apply atmospheric perspective
    terrainColor *= atmosphere;
    
    FragColor = vec4(terrainColor, 1.0);
}
