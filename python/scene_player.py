import moderngl_window as mglw
from moderngl_window.timers.base import BaseTimer
from audio_processing import AudioProcessor

class ScenePlayer(mglw.WindowConfig):
    gl_version = (3, 3)
    title = "Macroverse"
    window_size = (1280, 720)
    aspect_ratio = 16 / 9
    resizable = True
    resource_dir = '.'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.audio_processor = AudioProcessor()
        self.prog = self.load_program(
            vertex_shader='../shaders/default.vert',
            fragment_shader='../shaders/living.glsl'
        )
        self.quad_fs = mglw.geometry.quad_fs()

    def render(self, time: float, frametime: float):
        self.ctx.clear(1.0, 1.0, 1.0)

        fft_data = self.audio_processor.get_fft_data()
        audio_level = sum(fft_data) / len(fft_data) / 10000

        self.prog['u_time'] = time
        self.prog['u_resolution'] = self.window_size
        self.prog['u_audio'] = audio_level

        self.quad_fs.render(self.prog)

    @classmethod
    def run(cls):
        mglw.run_window_config(cls, args=['--window', 'headless'])

if __name__ == '__main__':
    ScenePlayer.run()
