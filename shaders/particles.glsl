#version 330 core
out vec4 FragColor;

in vec2 v_coord;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

// Enhanced controls
uniform float u_zoom = 1.0;
uniform float u_brightness = 1.0;
uniform float u_color_r = 1.0;
uniform float u_color_g = 0.8;
uniform float u_color_b = 0.2;
uniform float u_particle_count = 100.0;
uniform float u_particle_speed = 0.1;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
    vec2 st = v_coord;
    st.x *= u_resolution.x / u_resolution.y;
    
    // Apply zoom
    st = (st - 0.5) * u_zoom + 0.5;

    vec3 color = vec3(0.0);
    int num_particles = int(u_particle_count);

    for (int i = 0; i < num_particles && i < 200; i++) {
        float i_float = float(i);
        vec2 pos = vec2(rand(vec2(i_float, i_float)), 
                       rand(vec2(i_float * 2.0, i_float * 2.0)));
        
        // Enhanced movement patterns
        pos.x += sin(u_time * u_particle_speed + i_float) * (0.3 + u_audio * 0.5);
        pos.y += cos(u_time * u_particle_speed + i_float) * (0.3 + u_audio * 0.5);
        
        // Wrap particles around screen
        pos = fract(pos);

        float d = distance(st, pos);
        float particle_size = 0.005 + u_audio * 0.01;

        if (d < particle_size) {
            float intensity = (1.0 - d / particle_size);
            vec3 particle_color = vec3(u_color_r, u_color_g, u_color_b) * intensity;
            
            // Add some variation based on particle index
            particle_color.r += sin(i_float * 0.1) * 0.3;
            particle_color.g += cos(i_float * 0.15) * 0.3;
            particle_color.b += sin(i_float * 0.2 + u_time) * 0.3;
            
            color += particle_color * u_brightness;
        }
    }

    // Audio reactive background glow
    float bg_glow = u_audio * 0.1;
    color += vec3(bg_glow * u_color_r, bg_glow * u_color_g, bg_glow * u_color_b);

    FragColor = vec4(color, 1.0);
}
        }
    }

    FragColor = vec4(color, 1.0);
}
