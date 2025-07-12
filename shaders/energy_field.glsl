#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

void main() {
    vec2 st = v_coord;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(0.0);
    float d = 0.0;

    // Ripples
    d = distance(st, vec2(0.5, 0.5));
    d = sin(d * 20.0 - u_time * 2.0 + u_audio * 5.0) / 20.0;
    d = abs(d);

    color = vec3(d);
    color.r *= 0.1;
    color.g *= 0.2;
    color.b *= 0.8;

    FragColor = vec4(color, 1.0);
}
