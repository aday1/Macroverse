import pygame
import sys
from typing import Dict, Any, Callable

class ShaderControlInterface:
    """
    GUI interface for controlling shader parameters in real-time
    """
    
    def __init__(self, width=400, height=600):
        pygame.init()
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Macroverse Shader Controls")
        
        self.font = pygame.font.Font(None, 24)
        self.small_font = pygame.font.Font(None, 18)
        
        # Shader parameters
        self.params = {
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
        
        # Shader presets
        self.presets = {
            'Energy Field': {'ripple_frequency': 20.0, 'ripple_speed': 2.0, 'color_r': 0.1, 'color_g': 0.2, 'color_b': 0.8},
            'Particles': {'particle_count': 100.0, 'particle_speed': 0.1, 'color_r': 1.0, 'color_g': 0.8, 'color_b': 0.2},
            'Blue Giants': {'brightness': 1.5, 'color_r': 0.2, 'color_g': 0.4, 'color_b': 1.0, 'zoom': 0.8},
            'Life Forms': {'time_scale': 0.5, 'color_r': 0.2, 'color_g': 1.0, 'color_b': 0.3, 'ripple_frequency': 15.0}
        }
        
        # Current shader
        self.current_shader = 'energy_field'
        
        # Callbacks
        self.on_param_change: Callable[[str, float], None] = lambda k, v: None
        self.on_shader_change: Callable[[str], None] = lambda s: None
        
        # UI Elements
        self.sliders = self._create_sliders()
        self.buttons = self._create_buttons()
        
        self.running = True
        
    def _create_sliders(self):
        sliders = {}
        y_pos = 50
        for param, value in self.params.items():
            sliders[param] = {
                'rect': pygame.Rect(50, y_pos, 200, 20),
                'value': value,
                'min': 0.0,
                'max': 2.0 if 'color' in param else 5.0,
                'dragging': False
            }
            y_pos += 40
        return sliders
        
    def _create_buttons(self):
        buttons = {}
        shaders = ['energy_field', 'particles', 'blue_giants', 'orbits', 'life', 'living']
        x_pos = 50
        y_pos = 500
        
        for i, shader in enumerate(shaders):
            if i % 2 == 0 and i > 0:
                y_pos += 35
                x_pos = 50
            
            buttons[shader] = pygame.Rect(x_pos, y_pos, 80, 30)
            x_pos += 90
            
        return buttons
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                return False
                
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:  # Left click
                    self._handle_click(event.pos)
                    
            elif event.type == pygame.MOUSEBUTTONUP:
                if event.button == 1:
                    self._stop_dragging()
                    
            elif event.type == pygame.MOUSEMOTION:
                self._handle_drag(event.pos)
                
            elif event.type == pygame.KEYDOWN:
                self._handle_keypress(event.key)
        
        return True
    
    def _handle_click(self, pos):
        # Check slider clicks
        for param, slider in self.sliders.items():
            if slider['rect'].collidepoint(pos):
                slider['dragging'] = True
                self._update_slider_value(param, pos[0])
                
        # Check button clicks
        for shader, button_rect in self.buttons.items():
            if button_rect.collidepoint(pos):
                self.current_shader = shader
                self.on_shader_change(shader)
    
    def _handle_drag(self, pos):
        for param, slider in self.sliders.items():
            if slider['dragging']:
                self._update_slider_value(param, pos[0])
    
    def _stop_dragging(self):
        for slider in self.sliders.values():
            slider['dragging'] = False
    
    def _update_slider_value(self, param, x):
        slider = self.sliders[param]
        rect = slider['rect']
        
        # Calculate value based on x position
        progress = max(0, min(1, (x - rect.x) / rect.width))
        value = slider['min'] + progress * (slider['max'] - slider['min'])
        
        slider['value'] = value
        self.params[param] = value
        self.on_param_change(param, value)
    
    def _handle_keypress(self, key):
        # Quick presets
        if key == pygame.K_1:
            self._apply_preset('Energy Field')
        elif key == pygame.K_2:
            self._apply_preset('Particles')
        elif key == pygame.K_3:
            self._apply_preset('Blue Giants')
        elif key == pygame.K_4:
            self._apply_preset('Life Forms')
        elif key == pygame.K_r:
            self._reset_params()
        elif key == pygame.K_s:
            self._save_preset()
    
    def _apply_preset(self, preset_name):
        if preset_name in self.presets:
            preset = self.presets[preset_name]
            for param, value in preset.items():
                if param in self.params:
                    self.params[param] = value
                    self.sliders[param]['value'] = value
                    self.on_param_change(param, value)
    
    def _reset_params(self):
        defaults = {
            'time_scale': 1.0, 'audio_sensitivity': 1.0, 'color_r': 0.1,
            'color_g': 0.2, 'color_b': 0.8, 'ripple_frequency': 20.0,
            'ripple_speed': 2.0, 'particle_count': 100.0, 'particle_speed': 0.1,
            'zoom': 1.0, 'brightness': 1.0
        }
        
        for param, value in defaults.items():
            self.params[param] = value
            self.sliders[param]['value'] = value
            self.on_param_change(param, value)
    
    def draw(self):
        self.screen.fill((30, 30, 40))
        
        # Title
        title = self.font.render("Macroverse Shader Controls", True, (255, 255, 255))
        self.screen.blit(title, (10, 10))
        
        # Current shader indicator
        shader_text = self.small_font.render(f"Current: {self.current_shader}", True, (100, 200, 255))
        self.screen.blit(shader_text, (10, 35))
        
        # Draw sliders
        for param, slider in self.sliders.items():
            self._draw_slider(param, slider)
        
        # Draw shader buttons
        self._draw_shader_buttons()
        
        # Instructions
        instructions = [
            "Keys: 1-4 (Presets), R (Reset), S (Save)",
            "Mouse: Click/drag sliders, click shader buttons"
        ]
        
        y_pos = self.height - 50
        for instruction in instructions:
            text = self.small_font.render(instruction, True, (150, 150, 150))
            self.screen.blit(text, (10, y_pos))
            y_pos += 20
        
        pygame.display.flip()
    
    def _draw_slider(self, param, slider):
        rect = slider['rect']
        value = slider['value']
        min_val = slider['min']
        max_val = slider['max']
        
        # Background
        pygame.draw.rect(self.screen, (60, 60, 70), rect)
        
        # Fill
        progress = (value - min_val) / (max_val - min_val)
        fill_width = int(rect.width * progress)
        fill_rect = pygame.Rect(rect.x, rect.y, fill_width, rect.height)
        
        color = (100, 200, 255) if not slider['dragging'] else (150, 255, 150)
        pygame.draw.rect(self.screen, color, fill_rect)
        
        # Border
        pygame.draw.rect(self.screen, (100, 100, 100), rect, 2)
        
        # Label and value
        label = self.small_font.render(f"{param}: {value:.2f}", True, (255, 255, 255))
        self.screen.blit(label, (rect.x, rect.y - 20))
    
    def _draw_shader_buttons(self):
        for shader, button_rect in self.buttons.items():
            color = (100, 200, 255) if shader == self.current_shader else (80, 80, 90)
            pygame.draw.rect(self.screen, color, button_rect)
            pygame.draw.rect(self.screen, (150, 150, 150), button_rect, 2)
            
            text = self.small_font.render(shader.replace('_', ' ').title(), True, (255, 255, 255))
            text_rect = text.get_rect(center=button_rect.center)
            self.screen.blit(text, text_rect)
    
    def run(self):
        clock = pygame.time.Clock()
        
        while self.running:
            if not self.handle_events():
                break
                
            self.draw()
            clock.tick(60)
        
        pygame.quit()

# Example usage integration
if __name__ == "__main__":
    interface = ShaderControlInterface()
    
    def on_parameter_change(param_name, value):
        print(f"Parameter changed: {param_name} = {value}")
        # Here you would send the parameter to your main application
        
    def on_shader_change(shader_name):
        print(f"Shader changed to: {shader_name}")
        # Here you would change the active shader in your main application
        
    interface.on_param_change = on_parameter_change
    interface.on_shader_change = on_shader_change
    
    interface.run()
