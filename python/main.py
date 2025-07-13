import moderngl_window as mglw
from audio_processing import AudioProcessor
from control import Control
import os

class Macroverse(mglw.WindowConfig):
    gl_version = (3, 3)
    title = "Macroverse"
    window_size = (1280, 720)
    aspect_ratio = 16 / 9
    resizable = True
    resource_dir = '.'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.audio_processor = AudioProcessor()
        self.control = Control()

        self.scenes = self.load_scenes()
        self.current_scene_index = 0
        self.prog = None
        self.quad_fs = None
        if self.scenes:
            self.load_scene(self.scenes[self.current_scene_index])

        self.control.map_osc("/scene", self.handle_scene_change)

    def load_scenes(self):
        shader_dir = 'shaders'
        return [f for f in os.listdir(shader_dir) if f.endswith('.glsl')]

    def load_scene(self, shader_name):
        self.prog = self.load_program(
            vertex_shader='shaders/default.vert',
            fragment_shader=os.path.join('shaders', shader_name)
        )
        self.quad_fs = mglw.geometry.quad_fs()

    def handle_scene_change(self, address, *args):
        if args and isinstance(args[0], int):
            self.current_scene_index = args[0] % len(self.scenes)
            self.load_scene(self.scenes[self.current_scene_index])
            print(f"Switched to scene: {self.scenes[self.current_scene_index]}")

    def render(self, time: float, frametime: float):
        self.ctx.clear(1.0, 1.0, 1.0)

        fft_data = self.audio_processor.get_fft_data()
        audio_level = sum(fft_data) / len(fft_data) / 10000

        if self.prog:
            self.prog['u_time'] = time
            self.prog['u_resolution'] = self.window_size
            self.prog['u_audio'] = audio_level

            self.quad_fs.render(self.prog)

        for msg in self.control.get_midi_messages():
            print(f"MIDI: {msg}")

    @classmethod
    def run(cls):
        mglw.run_window_config(cls, args=['--window', 'headless'])

if __name__ == '__main__':
    Macroverse.run()
