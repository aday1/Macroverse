#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

// Enhanced controls
uniform float u_zoom = 1.0;
uniform float u_brightness = 1.0;
uniform float u_color_r = 0.1;
uniform float u_color_g = 0.2;
uniform float u_color_b = 0.8;
uniform float u_ripple_frequency = 20.0;
uniform float u_ripple_speed = 2.0;

void main() {
    vec2 st = v_coord;
    st.x *= u_resolution.x / u_resolution.y;
    
    // Apply zoom
    st = (st - 0.5) * u_zoom + 0.5;

    vec3 color = vec3(0.0);
    float d = 0.0;

    // Multiple ripple layers for complexity
    for (int i = 0; i < 3; i++) {
        float layer = float(i + 1);
        vec2 center = vec2(0.5 + sin(u_time * 0.3 * layer) * 0.2, 
                          0.5 + cos(u_time * 0.2 * layer) * 0.2);
        
        d = distance(st, center);
        d = sin(d * u_ripple_frequency * layer - u_time * u_ripple_speed + u_audio * 10.0) / (20.0 * layer);
        d = abs(d);
        
        color += vec3(d) * (1.0 / layer);
    }

    // Apply color mapping and brightness
    color.r *= u_color_r * u_brightness;
    color.g *= u_color_g * u_brightness;
    color.b *= u_color_b * u_brightness;
    
    // Audio reactive glow
    float glow = 1.0 + u_audio * 2.0;
    color *= glow;

    FragColor = vec4(color, 1.0);
}
