#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

void main() {
    vec2 st = v_coord * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(0.0);

    // Sun
    float d = distance(st, vec2(0.0));
    color += vec3(0.9, 0.6, 0.1) * (0.01 / d);

    // Planet
    vec2 planet_pos = vec2(sin(u_time * 0.5) * 0.6, cos(u_time * 0.5) * 0.6);
    d = distance(st, planet_pos);
    color += vec3(0.2, 0.5, 0.8) * (0.005 / d);

    // Moon
    vec2 moon_pos = planet_pos + vec2(sin(u_time) * 0.2, cos(u_time) * 0.2);
    d = distance(st, moon_pos);
    color += vec3(0.7) * (0.002 / d);

    // Audio reactivity
    color *= (1.0 + u_audio * 0.5);

    FragColor = vec4(color, 1.0);
}
