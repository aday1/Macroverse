from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Scene:
    name: str
    duration_seconds: float


class Player:
    """
    Lightweight playlist player with fade-to-black transitions.

    - Maintains a list of shader scene names
    - Auto-advances after each scene's duration
    - Supports play/pause, next/prev, looping
    - Provides a brightness multiplier for fade-in/out
    """

    def __init__(
        self,
        scene_names: List[str],
        default_duration_seconds: float = 15.0,
        fade_duration_seconds: float = 1.0,
        loop: bool = True,
    ) -> None:
        self.scenes: List[Scene] = [
            Scene(name=name, duration_seconds=default_duration_seconds)
            for name in scene_names
        ]
        self.default_duration_seconds: float = default_duration_seconds
        self.fade_duration_seconds: float = max(0.0, fade_duration_seconds)
        self.loop: bool = loop

        self.is_playing: bool = True
        self.current_index: int = 0 if self.scenes else -1
        self._time_in_scene_seconds: float = 0.0

        # Transition state
        self._is_fading_in: bool = True if self.scenes else False
        self._is_fading_out: bool = False

    def set_scene_duration(self, index: int, duration_seconds: float) -> None:
        if 0 <= index < len(self.scenes):
            self.scenes[index].duration_seconds = max(0.1, duration_seconds)

    def play(self) -> None:
        self.is_playing = True

    def pause(self) -> None:
        self.is_playing = False

    def toggle_play(self) -> None:
        self.is_playing = not self.is_playing

    def toggle_loop(self) -> None:
        self.loop = not self.loop

    def next(self) -> None:
        if not self.scenes:
            return
        next_index = self.current_index + 1
        if next_index >= len(self.scenes):
            if self.loop:
                next_index = 0
            else:
                next_index = self.current_index  # stay
        self._switch_to_index(next_index)

    def prev(self) -> None:
        if not self.scenes:
            return
        prev_index = self.current_index - 1
        if prev_index < 0:
            if self.loop:
                prev_index = len(self.scenes) - 1
            else:
                prev_index = self.current_index  # stay
        self._switch_to_index(prev_index)

    def goto_index(self, index: int) -> None:
        if not self.scenes:
            return
        index = max(0, min(len(self.scenes) - 1, index))
        self._switch_to_index(index)

    def _switch_to_index(self, index: int) -> None:
        if index == self.current_index:
            # Restart scene with fade-in
            self._time_in_scene_seconds = 0.0
            self._is_fading_in = self.fade_duration_seconds > 0.0
            self._is_fading_out = False
            return
        self.current_index = index
        self._time_in_scene_seconds = 0.0
        self._is_fading_in = self.fade_duration_seconds > 0.0
        self._is_fading_out = False

    def get_current_scene_name(self) -> Optional[str]:
        if 0 <= self.current_index < len(self.scenes):
            return self.scenes[self.current_index].name
        return None

    def get_brightness_multiplier(self) -> float:
        if self.fade_duration_seconds <= 0.0:
            return 1.0
        # Fade in at the beginning
        if self._is_fading_in:
            return min(1.0, self._time_in_scene_seconds / self.fade_duration_seconds)

        # Fade out near the end
        if self._is_fading_out:
            remaining = self._remaining_time_in_scene()
            progress = 1.0 - min(1.0, remaining / self.fade_duration_seconds)
            return max(0.0, 1.0 - progress)

        return 1.0

    def _remaining_time_in_scene(self) -> float:
        if not self.scenes or self.current_index < 0:
            return 0.0
        duration = self.scenes[self.current_index].duration_seconds
        return max(0.0, duration - self._time_in_scene_seconds)

    def update(self, delta_seconds: float) -> None:
        if not self.is_playing or not self.scenes or self.current_index < 0:
            return

        self._time_in_scene_seconds += max(0.0, float(delta_seconds))

        # Manage fade in/out transitions relative to current scene time
        duration = self.scenes[self.current_index].duration_seconds

        # Enter fade-out window near the end
        if (
            self.fade_duration_seconds > 0.0
            and not self._is_fading_out
            and self._time_in_scene_seconds >= max(0.0, duration - self.fade_duration_seconds)
        ):
            self._is_fading_out = True
            self._is_fading_in = False

        # Auto-advance at end
        if self._time_in_scene_seconds >= duration:
            old_index = self.current_index
            self.next()
            # If we actually moved to a new scene or restarted, start fade-in
            if self.current_index != old_index or self._time_in_scene_seconds == 0.0:
                self._is_fading_in = self.fade_duration_seconds > 0.0
                self._is_fading_out = False

