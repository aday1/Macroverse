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

void main() {
    vec2 st = v_coord * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, -5.0);
    vec3 rd = normalize(vec3(st, 1.0));

    float d = 0.0;
    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * d;
        float ds = 1000.0;
        for (int j = 0; j < 3; j++) {
            float j_float = float(j);
            vec3 q = p - vec3(sin(u_time + j_float) * 2.0, cos(u_time + j_float) * 2.0, 0.0);
            ds = smin(ds, sphere(q, 1.0 + u_audio * 0.5), 0.5);
        }
        if (ds < 0.001) break;
        d += ds;
    }

    vec3 color = vec3(0.0);
    if (d < 100.0) {
        color = vec3(0.1, 0.2, 0.8) * (1.0 - d / 100.0);
    }

    FragColor = vec4(color, 1.0);
}
