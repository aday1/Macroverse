#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

// Julia Set
vec2 rot(vec2 p, float a) {
    return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));
}

void main() {
    vec2 st = v_coord * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    vec2 z = st;
    vec2 c = vec2(sin(u_time * 0.1) * 0.2 - 0.7, cos(u_time * 0.1) * 0.2 + 0.27);

    float i = 0.0;
    for (int j = 0; j < 100; j++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if (length(z) > 2.0) break;
        i += 1.0;
    }

    vec3 color = vec3(i / 100.0);
    color *= vec3(0.2, 0.8, 0.5);
    color *= (1.0 + u_audio * 0.5);

    FragColor = vec4(color, 1.0);
}
