# Rhylok - Rhythm Game

A dynamic rhythm game that generates beats from the vibe of any song you upload, with tunable sensitivity and ergonomic keyboard controls.

## Features

🎵 **Dynamic Beat Generation**: Uses Web Audio API to analyze any audio file and generate rhythm patterns based on the song's energy and frequency content

🎛️ **Tunable Sensitivity**: Adjust beat detection sensitivity from 0.1x to 5.0x to match your preferred difficulty level

🎚️ **Playback Speed Control**: Slow down (0.5x) for practice or speed up (2.0x) for extreme challenge - note timing adjusts automatically

🎸 **Instrument Focus**: Target specific instruments or frequency ranges:
- **All Frequencies**: Standard full-spectrum detection
- **Bass**: Focus on bass lines and low-end (20-250Hz)
- **Drums**: Target drum hits and percussion (60-150Hz) 
- **Vocals**: Follow vocal melodies and mid-range (300-3kHz)
- **Treble**: Track high-frequency elements like cymbals (2-20kHz)
- **Custom Range**: Set your own frequency range for ultimate precision

🔥 **Extreme Difficulty Modes**:
- **Normal**: Standard gameplay experience
- **Hard**: 1.3x sensitivity, 1.4x note frequency, enhanced patterns
- **Extreme**: 1.8x sensitivity, 2.0x note frequency, syncopated rhythms
- **Intensity Master**: 2.5x sensitivity, 3.0x note frequency, chord patterns that follow the most intense moments

⚡ **Intensity-Based Beat Generation**: Tracks the most intense, climactic moments in songs for incredibly satisfying gameplay that matches the emotional peaks

🎼 **Time Signature Awareness**: Optional detection and following of time signature changes in complex songs

⌨️ **Ergonomic Controls**: Designed for natural hand positioning:
- Left hand: `A` `S` `D` `F`
- Right hand: `J` `K` `L` `;`

🎮 **Real-time Gameplay**: 
- Hit notes as they reach the hit zone
- Score based on timing accuracy
- Combo multiplier system
- Visual feedback for hits and misses

🎨 **Audio Visualization**: Real-time frequency spectrum visualization during gameplay

## How to Play

1. **Load a Song**: Click "Choose File" and select any audio file (MP3, WAV, etc.)
2. **Adjust Sensitivity**: Use the sensitivity slider to control how many beats are detected
3. **Start Playing**: Click "Play/Pause" to begin
4. **Hit the Beats**: Press the corresponding keys when notes reach the red hit zone
5. **Build Combos**: Hit consecutive notes for score multipliers

## Controls

| Key | Lane | Hand Position |
|-----|------|---------------|
| A   | 1    | Left pinky    |
| S   | 2    | Left ring     |
| D   | 3    | Left middle   |
| F   | 4    | Left index    |
| J   | 5    | Right index   |
| K   | 6    | Right middle  |
| L   | 7    | Right ring    |
| ;   | 8    | Right pinky   |

## Scoring System

- **Base Score**: 100 points per note
- **Accuracy Bonus**: Up to 50 points based on timing precision
- **Combo Bonus**: Up to 100 points based on current combo
- **Perfect Hit**: Within 50ms of the target time
- **Good Hit**: Within 100ms of the target time
- **Miss**: Outside 150ms tolerance window

## Technical Features

### Audio Analysis
- Real-time frequency analysis using Web Audio API
- Energy-based beat detection algorithm
- Adaptive thresholding based on song dynamics
- Multi-frequency range analysis (bass, mid, treble)

### Beat Generation Algorithm
- Analyzes audio in 100ms windows with 75% overlap
- Calculates energy variance to detect rhythmic patterns
- Maps frequency content to different lanes:
  - Bass frequencies → Left lanes (A, S)
  - Mid frequencies → Center lanes (D, F)
  - High frequencies → Right lanes (J, K, L, ;)
- Filters beats to maintain musical coherence

### Game Engine
- 60 FPS game loop with smooth animations
- Canvas-based rendering with hardware acceleration
- Responsive design that adapts to window size
- Hit detection with configurable timing windows

## Development

### Prerequisites
- Node.js (16+ recommended)
- npm or yarn

### Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

### Building
\`\`\`bash
npm run build
npm run preview
\`\`\`

### Project Structure
\`\`\`
src/
├── game/
│   ├── RhythemGame.ts      # Main game controller
│   ├── AudioAnalyzer.ts    # Web Audio API wrapper
│   ├── BeatDetector.ts     # Beat detection algorithm
│   ├── GameRenderer.ts     # Canvas rendering
│   ├── InputHandler.ts     # Keyboard input management
│   └── ScoreManager.ts     # Scoring and combo system
├── main.ts                 # Application entry point
└── style.css              # Game styling
\`\`\`

## Browser Compatibility

- Chrome/Chromium 66+
- Firefox 60+
- Safari 14+
- Edge 79+

Requires Web Audio API support for audio analysis and playback.

## Tips for Best Experience

1. **Audio Quality**: Higher quality audio files (48kHz, stereo) provide better beat detection
2. **Sensitivity Tuning**: 
   - Low sensitivity (0.5-0.8): Fewer, more obvious beats
   - High sensitivity (1.2-2.0): More complex, challenging patterns
3. **Song Selection**: Songs with clear rhythmic patterns work best
4. **Performance**: For smoother gameplay, close other browser tabs and applications

## License

MIT License - feel free to modify and distribute!

---

Load up your favorite tracks and test your rhythm skills! 🎵
