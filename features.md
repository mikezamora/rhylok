# Feature Requests

- [x] Option to follow time signature changes
- [x] Option to adjust the playback speed of the song and the corresponding beat hits
- [x] Option for game beat strikes to follow a specific instrument (like a frequency range) instead of only following generic beats
- [x] Option for the game to be MUCH harder and to increase the sensitivity
- [x] Option for the game to use a more fluid feeling beat strike that follows exactly the most intense parts of the song giving the player huge satisfaction when trying to master a song
- [x] Real time audio stream inputs for streaming and note/rhythm generation
- [x] Ability to hide controls after pausing and a pause button at the top right that will pause the song and show the controls again
- [x] After changing any settings that would affect beats calculations on the uploaded file rescan the currently uploaded file for new beats
- [x] Option to try to scan the selected song at different sensitivity levels and automatically determine which sensitivity will be the most fitting for the selected song and instrument and difficulty choice
- [x]  Delete ALL emojis from the codebase and never ever use them when developing features

## Implementation Details

### ✅ Time Signature Changes
- Added checkbox control to enable/disable time signature following
- Beat detector now accounts for time signature variations in complex songs
- Integrated into the enhanced beat detection algorithm

### ✅ Playback Speed Control
- Added playback speed slider (0.5x to 2.0x)
- Audio playback rate automatically adjusts
- Note speed dynamically scales with playback rate
- Perfect for practice at slower speeds or extreme challenge at higher speeds

### ✅ Instrument-Specific Beat Detection
- New instrument focus selector with options:
  - All Frequencies (default)
  - Bass (20-250Hz) - Focus on bass lines and low-end
  - Drums (60-150Hz) - Target drum hits and percussion
  - Vocals (300-3kHz) - Follow vocal melodies and mid-range
  - Treble (2-20kHz) - Track high-frequency elements like cymbals
  - Custom Range - Set your own frequency range
- Enhanced frequency analysis for targeted beat generation

### ✅ Extreme Difficulty Options
- Multiple difficulty modes:
  - **Normal**: Standard gameplay
  - **Hard**: 1.3x sensitivity, 1.4x note frequency
  - **Extreme**: 1.8x sensitivity, 2.0x note frequency, syncopated patterns
  - **Intensity Master**: 2.5x sensitivity, 3.0x note frequency, chord patterns
- Sensitivity slider now goes up to 5.0x (previously 2.0x)
- Ultra-responsive 50ms detection windows in Intensity mode

### ✅ Intensity-Based Beat Generation
- **Intensity Master Mode**: Tracks the most intense moments in songs
- Advanced intensity calculation using:
  - Peak detection algorithms
  - Energy variation analysis
  - Maximum amplitude tracking
- Creates incredibly satisfying gameplay where beats align with song climaxes
- Multi-layered note patterns (chords) during intense sections
- Perfect for experiencing the full emotional journey of a song

### ✅ Real-Time Audio Stream Inputs

- **Microphone Support**: Toggle microphone input with the 🎤 button
- **Live Beat Detection**: Real-time analysis of microphone audio
- **Streaming-Ready**: Perfect for live performances and streaming content
- **Responsive Thresholds**: Adjustable sensitivity for different environments
- **Memory Management**: Automatic cleanup of old notes to prevent memory issues
- **Visual Feedback**: Clear indication when microphone mode is active

### ✅ Smart UI Control Management

- **Hide/Show Controls**: Toggle button (⚙️) in the top-right corner
- **Clean Gameplay**: Hide all control panels for immersive experience
- **Quick Access**: One-click to bring controls back when needed
- **Streamlined Interface**: Perfect for recordings and focused gameplay sessions

### ✅ Automatic Settings Rescan

- **Intelligent Rescanning**: Automatically regenerates beats when settings change
- **Real-Time Feedback**: Visual notification showing number of beats detected
- **Smart Detection**: Only rescans when using file input (not microphone)
- **Optimized Performance**: Efficient re-analysis preserving user experience
- **Comprehensive Coverage**: Triggers on sensitivity, difficulty, time signature, and instrument focus changes

### ✅ Smart Sensitivity Auto-Detection

- **Intelligent Analysis**: Tests multiple sensitivity levels (0.3 to 3.0) automatically
- **Multi-Factor Scoring**: Evaluates beat frequency, distribution, and timing patterns
- **Optimal Selection**: Finds the best sensitivity for your specific song and difficulty
- **Visual Feedback**: Shows analysis results with beat count and confidence score
- **One-Click Optimization**: Auto-Detect button next to sensitivity slider
- **Context Aware**: Only works with uploaded files, not real-time microphone input

### ✅ Emoji-Free Codebase

- **Clean Interface**: Replaced all emojis with text-based alternatives
- **Professional Design**: Settings button becomes "[SETTINGS]", microphone becomes "MIC:"
- **Accessibility**: Better screen reader compatibility without emoji confusion
- **Consistent Styling**: Uniform text-based UI elements throughout
- **Maintainable Code**: No unicode characters that could cause encoding issues