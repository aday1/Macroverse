#version 330 core
out vec4 FragColor;

in vec2 v_coord;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

#define NUM_PARTICLES 100

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
    vec2 st = v_coord;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(0.0);

    for (int i = 0; i < NUM_PARTICLES; i++) {
        float i_float = float(i);
        vec2 pos = vec2(rand(vec2(i_float, i_float)), rand(vec2(i_float * 2.0, i_float * 2.0)));
        pos.x += sin(u_time + i_float) * 0.1 * u_audio;
        pos.y += cos(u_time + i_float) * 0.1 * u_audio;

        float d = distance(st, pos);

        if (d < 0.01) {
            color = vec3(1.0);
        }
    }

    FragColor = vec4(color, 1.0);
}
