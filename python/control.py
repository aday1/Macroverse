from pythonosc import dispatcher
from pythonosc import osc_server
import mido
import logging

class Control:
    def __init__(self, ip="127.0.0.1", port=5005):
        self.dispatcher = dispatcher.Dispatcher()
        self.server = osc_server.ThreadingOSCUDPServer((ip, port), self.dispatcher)
        try:
            self.midi_input = mido.open_input()
        except Exception as e:
            logging.warning(f"Could not open MIDI input: {e}")
            self.midi_input = None

    def map_osc(self, address, handler):
        self.dispatcher.map(address, handler)

    def start_osc_server(self):
        print(f"Serving on {self.server.server_address}")
        self.server.serve_forever()

    def stop_osc_server(self):
        self.server.shutdown()

    def get_midi_messages(self):
        if self.midi_input:
            return self.midi_input.iter_pending()
        return []

if __name__ == '__main__':
    def handle_test(address, *args):
        print(f"Received OSC message: {address}, {args}")

    control = Control()
    control.map_osc("/test", handle_test)

    import threading
    server_thread = threading.Thread(target=control.start_osc_server)
    server_thread.start()

    try:
        while True:
            for msg in control.get_midi_messages():
                print(f"Received MIDI message: {msg}")
    except KeyboardInterrupt:
        control.stop_osc_server()
        server_thread.join()
        print("Servers stopped.")
