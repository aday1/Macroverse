#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(rand(i + vec2(0.0, 0.0)), rand(i + vec2(1.0, 0.0)), u.x),
               mix(rand(i + vec2(0.0, 1.0)), rand(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 st = v_coord;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(0.0);

    // Enhanced starfield with different star types
    for (int i = 0; i < 200; i++) {
        float i_float = float(i);
        vec2 star_pos = vec2(rand(vec2(i_float)), rand(vec2(i_float * 2.0)));
        float d = distance(st, star_pos);
        
        // Different star sizes and colors
        float starType = rand(vec2(i_float * 3.0));
        vec3 starColor;
        float starSize;
        
        if (starType < 0.6) {
            // Regular white stars
            starColor = vec3(1.0, 1.0, 1.0);
            starSize = 0.0001;
        } else if (starType < 0.8) {
            // Blue giants
            starColor = vec3(0.7, 0.8, 1.0);
            starSize = 0.0003;
        } else {
            // Red giants
            starColor = vec3(1.0, 0.6, 0.4);
            starSize = 0.0002;
        }
        
        color += starColor * (starSize / d);
    }

    // Central planet with city lights
    vec2 planetCenter = vec2(0.5, 0.5);
    float planetDist = distance(st, planetCenter);
    float planetRadius = 0.15;
    
    if (planetDist < planetRadius) {
        // Planet surface with continents
        vec2 surfaceCoord = (st - planetCenter) / planetRadius;
        float continents = fbm(surfaceCoord * 8.0);
        
        vec3 oceanColor = vec3(0.1, 0.3, 0.6);
        vec3 landColor = vec3(0.4, 0.5, 0.2);
        vec3 planetSurface = mix(oceanColor, landColor, smoothstep(0.3, 0.7, continents));
        
        // City lights on night side
        float dayNight = dot(normalize(surfaceCoord), vec2(cos(u_time * 0.5), sin(u_time * 0.5)));
        if (dayNight < 0.0) {
            float cityLights = 0.0;
            for (int c = 0; c < 20; c++) {
                vec2 cityPos = vec2(rand(vec2(float(c) * 7.0)), rand(vec2(float(c) * 11.0))) * 2.0 - 1.0;
                float cityDist = distance(surfaceCoord, cityPos);
                cityLights += 0.01 / (cityDist + 0.01);
            }
            planetSurface += vec3(1.0, 0.8, 0.5) * cityLights * 0.3;
        }
        
        color = planetSurface;
    }
    
    // Orbital infrastructure
    for (int orbit = 1; orbit <= 5; orbit++) {
        float orbitRadius = planetRadius + float(orbit) * 0.08;
        float orbitAngle = u_time * 0.3 + float(orbit) * 0.5;
        
        // Satellites and space stations
        for (int sat = 0; sat < 3; sat++) {
            float satAngle = orbitAngle + float(sat) * 2.094; // 120 degrees apart
            vec2 satPos = planetCenter + vec2(cos(satAngle), sin(satAngle)) * orbitRadius;
            float satDist = distance(st, satPos);
            
            if (satDist < 0.008) {
                vec3 satColor = orbit <= 2 ? vec3(0.8, 0.8, 0.9) : vec3(0.9, 0.7, 0.5);
                color = satColor;
            }
            
            // Satellite lights
            color += vec3(0.5, 0.7, 1.0) * (0.0001 / (satDist + 0.001));
        }
        
        // Orbital rings/traffic lanes
        float ringDist = abs(distance(st, planetCenter) - orbitRadius);
        if (ringDist < 0.002) {
            color += vec3(0.2, 0.4, 0.8) * 0.1 * (1.0 + sin(u_time * 2.0 + float(orbit)) * 0.5);
        }
    }
    
    // Spaceships traveling between orbits
    for (int ship = 0; ship < 8; ship++) {
        float shipT = fract(u_time * 0.1 + float(ship) * 0.125);
        float shipOrbit1 = planetRadius + 0.08;
        float shipOrbit2 = planetRadius + 0.32;
        float shipRadius = mix(shipOrbit1, shipOrbit2, smoothstep(0.0, 1.0, shipT));
        
        float shipAngle = float(ship) * 0.785 + shipT * 6.28; // Different starting angles
        vec2 shipPos = planetCenter + vec2(cos(shipAngle), sin(shipAngle)) * shipRadius;
        float shipDist = distance(st, shipPos);
        
        // Ship trail
        if (shipDist < 0.015 && shipT > 0.1) {
            float trailIntensity = 1.0 - (shipDist / 0.015);
            color += vec3(0.8, 0.4, 1.0) * trailIntensity * 0.3;
        }
        
        // Ship itself
        if (shipDist < 0.005) {
            color = vec3(1.0, 0.8, 0.6);
        }
    }
    
    // Nebula background for deep space feel
    vec2 nebulaCoord = st * 2.0 + u_time * 0.01;
    float nebula = fbm(nebulaCoord) * 0.5;
    vec3 nebulaColor = vec3(0.2, 0.1, 0.3) * nebula;
    color = mix(nebulaColor, color, 0.8);
    
    // Audio reactive pulsing
    float pulse = 1.0 + u_audio * 0.5;
    color *= pulse;
    
    // Add some lens flares from the central star
    vec2 starCenter = vec2(0.8, 0.2);
    float starDist = distance(st, starCenter);
    if (starDist < 0.02) {
        color += vec3(1.0, 0.9, 0.7) * (1.0 - starDist / 0.02) * 2.0;
    }
    
    // Lens flare rays
    vec2 starDir = normalize(st - starCenter);
    float rayIntensity = abs(sin(atan(starDir.y, starDir.x) * 4.0)) * 0.1 / (starDist + 0.1);
    color += vec3(1.0, 0.8, 0.6) * rayIntensity;

    FragColor = vec4(color, 1.0);
}
