import moderngl_window as mglw
from audio_processing import AudioProcessor
from control import Control
from player_framework import Player
import os
import threading
import queue

class Macroverse(mglw.WindowConfig):
    gl_version = (3, 3)
    title = "Macroverse - Interactive Shader Visualizer"
    window_size = (1280, 720)
    aspect_ratio = 16 / 9
    resizable = True
    resource_dir = '.'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.audio_processor = AudioProcessor()
        self.control = Control()
        self._osc_thread = threading.Thread(target=self.control.start_osc_server, daemon=True)
        self._osc_thread.start()

        # Shader control parameters
        self.shader_params = {
            'time_scale': 1.0,
            'audio_sensitivity': 1.0,
            'color_r': 0.1,
            'color_g': 0.2,
            'color_b': 0.8,
            'ripple_frequency': 20.0,
            'ripple_speed': 2.0,
            'particle_count': 100.0,
            'particle_speed': 0.1,
            'zoom': 1.0,
            'brightness': 1.0
        }

        self.scenes = self.load_scenes()
        self.current_scene_index = 0
        self.player = Player(self.scenes, default_duration_seconds=20.0, fade_duration_seconds=1.0, loop=True)
        self.prog = None
        self.quad_fs = None
        if self.scenes:
            self.load_scene(self.scenes[self.current_scene_index])

        self.control.map_osc("/scene", self.handle_scene_change)
        self.control.map_osc("/param", self.handle_param_change)
        self.control.map_osc("/transport", self.handle_transport)
        
        # Queue for parameter updates
        self.param_queue = queue.Queue()
        
        print("=== MACROVERSE SHADER CONTROLS ===")
        print("Available Shaders:")
        for i, scene in enumerate(self.scenes):
            print(f"  {i+1}. {scene}")
        print("\nKeyboard Controls:")
        print("  1-6: Switch shaders")
        print("  LEFT/RIGHT: Previous/Next scene")
        print("  SPACE: Play/Pause, M: Toggle loop")
        print("  Q/A: Time scale (±0.1)")
        print("  W/S: Audio sensitivity (±0.1)")
        print("  E/D: Zoom (±0.1)")
        print("  R/F: Brightness (±0.1)")
        print("  T/G: Ripple frequency (±2.0)")
        print("  Y/H: Ripple speed (±0.2)")
        print("  U/J: Red color (±0.05)")
        print("  I/K: Green color (±0.05)")
        print("  O/L: Blue color (±0.05)")
        print("  P/;: Particle count (±10)")
        print("  [/]: Particle speed (±0.01)")
        print("  ESC: Quit")
        print("===============================\n")

    def load_scenes(self):
        shader_dir = os.path.join('..', 'shaders')
        return [f for f in os.listdir(shader_dir) if f.endswith('.glsl')]

    def load_scene(self, shader_name):
        self.prog = self.load_program(
            vertex_shader=os.path.join('..', 'shaders', 'default.vert'),
            fragment_shader=os.path.join('..', 'shaders', shader_name)
        )
        self.quad_fs = mglw.geometry.quad_fs()

    def handle_scene_change(self, address, *args):
        if args and isinstance(args[0], int):
            self.current_scene_index = args[0] % len(self.scenes)
            self.player.goto_index(self.current_scene_index)
            self.load_scene(self.scenes[self.current_scene_index])
            print(f"Switched to scene: {self.scenes[self.current_scene_index]}")

    def handle_transport(self, address, *args):
        """OSC handler for transport commands
        /transport <cmd> [arg]
        cmds: play, pause, toggle, next, prev, loop, goto
        goto expects numeric index as [arg]
        """
        if not args:
            return
        cmd = str(args[0]).lower()
        if cmd == 'play':
            self.player.play()
        elif cmd == 'pause':
            self.player.pause()
        elif cmd == 'toggle':
            self.player.toggle_play()
        elif cmd == 'next':
            self.player.next()
        elif cmd == 'prev':
            self.player.prev()
        elif cmd == 'loop':
            self.player.toggle_loop()
        elif cmd == 'goto' and len(args) >= 2:
            try:
                index = int(args[1])
                self.player.goto_index(index)
            except Exception:
                pass

    def handle_param_change(self, address, *args):
        """Handle OSC parameter changes"""
        if len(args) >= 2:
            param_name = str(args[0])
            param_value = float(args[1])
            if param_name in self.shader_params:
                self.shader_params[param_name] = param_value
                print(f"Parameter updated: {param_name} = {param_value}")

    def key_event(self, key, action, modifiers):
        """Handle keyboard input for real-time shader control"""
        if action == self.wnd.keys.ACTION_PRESS:
            # Shader switching
            if key >= self.wnd.keys.NUMBER_1 and key <= self.wnd.keys.NUMBER_6:
                shader_index = key - self.wnd.keys.NUMBER_1
                if shader_index < len(self.scenes):
                    self.current_scene_index = shader_index
                    self.player.goto_index(self.current_scene_index)
                    self.load_scene(self.scenes[self.current_scene_index])
                    print(f"Switched to shader: {self.scenes[self.current_scene_index]}")

            # Transport
            elif key == self.wnd.keys.SPACE:
                self.player.toggle_play()
                print("Play" if self.player.is_playing else "Pause")
            elif key == self.wnd.keys.RIGHT:
                self.player.next()
            elif key == self.wnd.keys.LEFT:
                self.player.prev()
            elif key == self.wnd.keys.M:
                self.player.toggle_loop()
                print(f"Loop: {self.player.loop}")
            
            # Parameter controls
            elif key == self.wnd.keys.Q:
                self.shader_params['time_scale'] = min(5.0, self.shader_params['time_scale'] + 0.1)
                print(f"Time scale: {self.shader_params['time_scale']:.2f}")
            elif key == self.wnd.keys.A:
                self.shader_params['time_scale'] = max(0.0, self.shader_params['time_scale'] - 0.1)
                print(f"Time scale: {self.shader_params['time_scale']:.2f}")
            
            elif key == self.wnd.keys.W:
                self.shader_params['audio_sensitivity'] = min(5.0, self.shader_params['audio_sensitivity'] + 0.1)
                print(f"Audio sensitivity: {self.shader_params['audio_sensitivity']:.2f}")
            elif key == self.wnd.keys.S:
                self.shader_params['audio_sensitivity'] = max(0.0, self.shader_params['audio_sensitivity'] - 0.1)
                print(f"Audio sensitivity: {self.shader_params['audio_sensitivity']:.2f}")
                
            elif key == self.wnd.keys.E:
                self.shader_params['zoom'] = min(3.0, self.shader_params['zoom'] + 0.1)
                print(f"Zoom: {self.shader_params['zoom']:.2f}")
            elif key == self.wnd.keys.D:
                self.shader_params['zoom'] = max(0.1, self.shader_params['zoom'] - 0.1)
                print(f"Zoom: {self.shader_params['zoom']:.2f}")
                
            elif key == self.wnd.keys.R:
                self.shader_params['brightness'] = min(3.0, self.shader_params['brightness'] + 0.1)
                print(f"Brightness: {self.shader_params['brightness']:.2f}")
            elif key == self.wnd.keys.F:
                self.shader_params['brightness'] = max(0.1, self.shader_params['brightness'] - 0.1)
                print(f"Brightness: {self.shader_params['brightness']:.2f}")
                
            elif key == self.wnd.keys.T:
                self.shader_params['ripple_frequency'] = min(50.0, self.shader_params['ripple_frequency'] + 2.0)
                print(f"Ripple frequency: {self.shader_params['ripple_frequency']:.1f}")
            elif key == self.wnd.keys.G:
                self.shader_params['ripple_frequency'] = max(1.0, self.shader_params['ripple_frequency'] - 2.0)
                print(f"Ripple frequency: {self.shader_params['ripple_frequency']:.1f}")
                
            elif key == self.wnd.keys.Y:
                self.shader_params['ripple_speed'] = min(10.0, self.shader_params['ripple_speed'] + 0.2)
                print(f"Ripple speed: {self.shader_params['ripple_speed']:.2f}")
            elif key == self.wnd.keys.H:
                self.shader_params['ripple_speed'] = max(0.1, self.shader_params['ripple_speed'] - 0.2)
                print(f"Ripple speed: {self.shader_params['ripple_speed']:.2f}")
                
            # Color controls
            elif key == self.wnd.keys.U:
                self.shader_params['color_r'] = min(1.0, self.shader_params['color_r'] + 0.05)
                print(f"Red: {self.shader_params['color_r']:.2f}")
            elif key == self.wnd.keys.J:
                self.shader_params['color_r'] = max(0.0, self.shader_params['color_r'] - 0.05)
                print(f"Red: {self.shader_params['color_r']:.2f}")
                
            elif key == self.wnd.keys.I:
                self.shader_params['color_g'] = min(1.0, self.shader_params['color_g'] + 0.05)
                print(f"Green: {self.shader_params['color_g']:.2f}")
            elif key == self.wnd.keys.K:
                self.shader_params['color_g'] = max(0.0, self.shader_params['color_g'] - 0.05)
                print(f"Green: {self.shader_params['color_g']:.2f}")
                
            elif key == self.wnd.keys.O:
                self.shader_params['color_b'] = min(1.0, self.shader_params['color_b'] + 0.05)
                print(f"Blue: {self.shader_params['color_b']:.2f}")
            elif key == self.wnd.keys.L:
                self.shader_params['color_b'] = max(0.0, self.shader_params['color_b'] - 0.05)
                print(f"Blue: {self.shader_params['color_b']:.2f}")
                
            # Particle controls
            elif key == self.wnd.keys.P:
                self.shader_params['particle_count'] = min(500.0, self.shader_params['particle_count'] + 10.0)
                print(f"Particle count: {self.shader_params['particle_count']:.0f}")
            elif key == self.wnd.keys.SEMICOLON:
                self.shader_params['particle_count'] = max(10.0, self.shader_params['particle_count'] - 10.0)
                print(f"Particle count: {self.shader_params['particle_count']:.0f}")
                
            elif key == self.wnd.keys.BRACKET_LEFT:
                self.shader_params['particle_speed'] = min(1.0, self.shader_params['particle_speed'] + 0.01)
                print(f"Particle speed: {self.shader_params['particle_speed']:.3f}")
            elif key == self.wnd.keys.BRACKET_RIGHT:
                self.shader_params['particle_speed'] = max(0.01, self.shader_params['particle_speed'] - 0.01)
                print(f"Particle speed: {self.shader_params['particle_speed']:.3f}")
                
            elif key == self.wnd.keys.ESCAPE:
                print("Exiting Macroverse...")
                self.wnd.close()

    def on_render(self, time: float, frametime: float):
        self.ctx.clear(0.0, 0.0, 0.0)  # Black background

        # Update player (auto-advance + transitions)
        try:
            self.player.update(frametime)
        except Exception:
            pass

        # Sync loaded scene with player's current scene if needed
        current_scene_name = self.player.get_current_scene_name() if self.scenes else None
        if current_scene_name and (self.scenes[self.current_scene_index] != current_scene_name):
            if current_scene_name in self.scenes:
                self.current_scene_index = self.scenes.index(current_scene_name)
                self.load_scene(current_scene_name)
                print(f"Auto-advanced to: {current_scene_name}")

        fft_data = self.audio_processor.get_fft_data()
        audio_level = (sum(fft_data) / len(fft_data) / 10000) * self.shader_params['audio_sensitivity']

        if self.prog and self.quad_fs:
            # Pass all shader parameters as uniforms
            self.prog['u_time'] = time * self.shader_params['time_scale']
            self.prog['u_resolution'] = self.window_size
            self.prog['u_audio'] = audio_level
            
            # Additional parameters for enhanced control
            if 'u_zoom' in self.prog:
                self.prog['u_zoom'] = self.shader_params['zoom']
            effective_brightness = self.shader_params['brightness'] * (self.player.get_brightness_multiplier() if self.scenes else 1.0)
            if 'u_brightness' in self.prog:
                self.prog['u_brightness'] = effective_brightness
            if 'u_color_r' in self.prog:
                self.prog['u_color_r'] = self.shader_params['color_r']
            if 'u_color_g' in self.prog:
                self.prog['u_color_g'] = self.shader_params['color_g']
            if 'u_color_b' in self.prog:
                self.prog['u_color_b'] = self.shader_params['color_b']
            if 'u_ripple_frequency' in self.prog:
                self.prog['u_ripple_frequency'] = self.shader_params['ripple_frequency']
            if 'u_ripple_speed' in self.prog:
                self.prog['u_ripple_speed'] = self.shader_params['ripple_speed']
            if 'u_particle_count' in self.prog:
                self.prog['u_particle_count'] = self.shader_params['particle_count']
            if 'u_particle_speed' in self.prog:
                self.prog['u_particle_speed'] = self.shader_params['particle_speed']

            self.quad_fs.render(self.prog)

        # Handle any pending MIDI messages
        for msg in self.control.get_midi_messages():
            print(f"MIDI: {msg}")
            
        # Display current parameters in terminal (every 60 frames)
        if hasattr(self, 'frame_count'):
            self.frame_count += 1
        else:
            self.frame_count = 0
            
        if self.frame_count % 60 == 0:  # Update display every second (at 60fps)
            current_shader = self.scenes[self.current_scene_index] if self.scenes else "None"
            r, g, b = self.shader_params['color_r'], self.shader_params['color_g'], self.shader_params['color_b']
            particles = self.shader_params['particle_count']
            print(f"[{current_shader}] Time:{self.shader_params['time_scale']:.1f} Audio:{self.shader_params['audio_sensitivity']:.1f} Zoom:{self.shader_params['zoom']:.1f} Brightness:{self.shader_params['brightness']:.1f}")
            print(f"  RGB:({r:.2f},{g:.2f},{b:.2f}) Ripple:{self.shader_params['ripple_frequency']:.0f}@{self.shader_params['ripple_speed']:.1f} Particles:{particles:.0f}@{self.shader_params['particle_speed']:.3f}")

    @classmethod
    def run(cls):
        mglw.run_window_config(cls)

if __name__ == '__main__':
    Macroverse.run()
