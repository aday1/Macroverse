import numpy as np
import time

class AudioProcessor:
    def __init__(self, chunk_size=1024, rate=44100):
        self.chunk_size = chunk_size
        self.rate = rate

    def get_fft_data(self):
        # Generate synthetic audio data for testing
        t = time.time()
        frequency = np.sin(t * 2) * 5 + 10  # Varying frequency
        amplitude = (np.sin(t * 3) + 1) / 2  # Varying amplitude

        time_array = np.arange(self.chunk_size) / self.rate
        synthetic_data = (amplitude * np.sin(2 * np.pi * frequency * time_array * 100) * 32767).astype(np.int16)

        fft_data = np.fft.fft(synthetic_data)
        return np.abs(fft_data)

    def stop(self):
        # No-op for synthetic data
        pass

if __name__ == '__main__':
    audio_processor = AudioProcessor()
    try:
        while True:
            fft_data = audio_processor.get_fft_data()
            print(fft_data)
    except KeyboardInterrupt:
        print("Stopping audio processing...")
        audio_processor.stop()
