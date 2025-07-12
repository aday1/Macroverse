#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
    vec2 st = v_coord;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(0.0);

    // Starfield
    for (int i = 0; i < 100; i++) {
        float i_float = float(i);
        vec2 star_pos = vec2(rand(vec2(i_float)), rand(vec2(i_float * 2.0)));
        float d = distance(st, star_pos);
        color += vec3(1.0) * (0.0001 / d);
    }

    // Pulsating circle
    float circle = 1.0 - smoothstep(0.0, 0.5, length(st - vec2(0.5, 0.5)) - 0.2 * u_audio);
    color += vec3(0.8, 0.2, 0.5) * circle;

    FragColor = vec4(color, 1.0);
}
