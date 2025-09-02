# Macroverse Shader Control Guide

## 🎛️ Real-Time Controls

### Keyboard Controls (Main Application)

**Shader Switching:**
- `1` - Energy Field
- `2` - Particles  
- `3` - Blue Giants
- `4` - Orbits
- `5` - Life
- `6` - Living

**Parameter Controls:**
- `Q/A` - Time Scale (±0.1)
- `W/S` - Audio Sensitivity (±0.1)
- `E/D` - Zoom (±0.1) 
- `R/F` - Brightness (±0.1)
- `T/G` - Ripple Frequency (±2.0)
- `Y/H` - Ripple Speed (±0.2)
- `U/J` - Red Color (±0.05)
- `I/K` - Green Color (±0.05)
- `O/L` - Blue Color (±0.05)
- `P/;` - Particle Count (±10)
- `[/]` - Particle Speed (±0.01)
- `ESC` - Exit

## 🎨 Shader Parameters

### Available Uniforms in Shaders:
```glsl
uniform float u_time;              // Animated time
uniform vec2 u_resolution;         // Screen resolution
uniform float u_audio;             // Audio level (0.0-1.0)
uniform float u_zoom;              // Zoom level (0.1-3.0)
uniform float u_brightness;        // Overall brightness (0.1-3.0)
uniform float u_color_r;           // Red component (0.0-2.0)
uniform float u_color_g;           // Green component (0.0-2.0)  
uniform float u_color_b;           // Blue component (0.0-2.0)
uniform float u_ripple_frequency;  // Wave frequency (1.0-50.0)
uniform float u_ripple_speed;      // Animation speed (0.1-10.0)
uniform float u_particle_count;    // Number of particles (1.0-200.0)
uniform float u_particle_speed;    // Particle movement speed (0.1-5.0)
```

## 📁 Shader File Structure

### Location: `shaders/`
- `default.vert` - Vertex shader (shared)
- `energy_field.glsl` - Energy ripples and waves
- `particles.glsl` - Particle system
- `blue_giants.glsl` - Stellar formations
- `orbits.glsl` - Orbital mechanics
- `life.glsl` - Organic patterns
- `living.glsl` - Living systems

## 🛠️ Creating Custom Shaders

### 1. Basic Shader Template:
```glsl
#version 330 core
in vec2 v_coord;
out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

// Your custom uniforms
uniform float u_zoom = 1.0;
uniform float u_brightness = 1.0;
uniform float u_color_r = 1.0;
uniform float u_color_g = 1.0;
uniform float u_color_b = 1.0;

void main() {
    vec2 st = v_coord;
    st.x *= u_resolution.x / u_resolution.y;
    
    // Apply zoom
    st = (st - 0.5) * u_zoom + 0.5;
    
    // Your shader code here
    vec3 color = vec3(0.0);
    
    // Example: Simple gradient
    color.r = st.x * u_color_r;
    color.g = st.y * u_color_g;
    color.b = sin(u_time) * u_color_b;
    
    // Apply brightness and audio reactivity
    color *= u_brightness * (1.0 + u_audio);
    
    FragColor = vec4(color, 1.0);
}
```

### 2. Add Your Shader:
1. Create a new `.glsl` file in the `shaders/` folder
2. Use the template above as starting point
3. Restart the application to load the new shader

## 🎵 Audio Reactive Features

### Audio Input Processing:
- `u_audio` provides real-time audio level (0.0-1.0)
- Use `u_audio_sensitivity` to scale audio response
- Example: `color *= (1.0 + u_audio * 2.0);` for glow effects

### Audio Reactive Patterns:
```glsl
// Pulsing effect
float pulse = 1.0 + u_audio * 2.0;
color *= pulse;

// Audio-driven animation
float wave = sin(u_time + u_audio * 10.0);

// Particle size variation
float size = 0.01 + u_audio * 0.05;
```

## 🎛️ Advanced Controls

### OSC Integration:
Send OSC messages to control parameters:
```
/scene <int>        # Change shader (0-5)
/param <string> <float> # Set parameter value
```

### MIDI Control:
- Connect MIDI controllers for real-time parameter control
- MIDI messages are logged to console

### Python API Integration:
```python
# Example: Control from external Python script
from pythonosc import udp_client

client = udp_client.SimpleUDPClient("127.0.0.1", 5005)
client.send_message("/param", ["brightness", 1.5])
client.send_message("/scene", 2)  # Switch to particles
```

## 🎨 Shader Techniques

### 1. Distance Fields:
```glsl
float circle = distance(st, vec2(0.5, 0.5));
circle = 1.0 - step(0.3, circle);
```

### 2. Procedural Patterns:
```glsl
float pattern = sin(st.x * 10.0) * cos(st.y * 10.0);
pattern *= sin(u_time);
```

### 3. Audio Reactive Colors:
```glsl
vec3 audioColor = vec3(
    sin(u_time + u_audio * 5.0),
    cos(u_time + u_audio * 3.0), 
    sin(u_time * 2.0 + u_audio * 7.0)
) * 0.5 + 0.5;
```

### 4. Multi-layer Effects:
```glsl
vec3 layer1 = /* first effect */;
vec3 layer2 = /* second effect */;
vec3 final = mix(layer1, layer2, sin(u_time) * 0.5 + 0.5);
```

## 🚀 Performance Tips

1. **Limit Loop Iterations**: Use reasonable limits in for loops
2. **Optimize Distance Calculations**: Cache expensive operations
3. **Use Built-in Functions**: prefer `length()` over manual distance
4. **Conditional Rendering**: Use `step()` and `smoothstep()` instead of if statements

## 🎯 Preset Creation

### Save Your Settings:
Current parameter values are displayed in the terminal. Copy these to create presets in your code.

### Example Preset:
```python
energy_preset = {
    'time_scale': 1.2,
    'audio_sensitivity': 1.5,
    'brightness': 1.3,
    'color_r': 0.2,
    'color_g': 0.8,
    'color_b': 1.0,
    'ripple_frequency': 25.0,
    'ripple_speed': 2.5
}
```

## 🔧 Troubleshooting

### Common Issues:
1. **Shader won't load**: Check GLSL syntax
2. **Parameters not working**: Ensure uniform names match
3. **Performance issues**: Reduce particle count or loop iterations
4. **Audio not responsive**: Increase audio sensitivity

### Debug Tips:
- Check console output for error messages
- Start with simple effects and build complexity
- Use parameter display in terminal to monitor values

---

**Happy Shader Tweaking! 🌌✨**
