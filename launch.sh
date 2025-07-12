#!/bin/bash

# Start the virtual framebuffer
Xvfb :99 -screen 0 1280x720x24 &

# Set the display environment variable
export DISPLAY=:99

# Run the main python application
export PYTHONPATH=$PYTHONPATH:.
python3 python/main.py
