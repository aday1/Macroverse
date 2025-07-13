#version 330 core

in vec3 in_position;
out vec2 v_coord;

void main() {
    gl_Position = vec4(in_position, 1.0);
    v_coord = in_position.xy * 0.5 + 0.5;
}
