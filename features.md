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
- [x] Delete ALL emojis from the codebase and never ever use them when developing features
- [x] Option for selecting the fret board. I want the existing option to be the default. In addition to a 3d fret board option with a cyan oscilloscope audio visualization with different overlapping frequencies. This should use animeJS and lookup the documentation if you need too. The visuals should feel like you are traversing a vector graph and the high intensity should make it feel like you don't know which direction you are going with the notes being the edges on the vectors.
- [x] Save the current selected song in local storage and retrieve the value on window reload.
- [x] Save the current setting in local storage and retrieve the value on window reload.
- [x] Hash each file and use the hash to save the generated notes/beats in local storage, so they persist between sessions.
- [x] Add a button to clear/reset local storage in an advanced menu
- [x] Modular architecture refactoring - Split GameRenderer logic into separate Game.ts shared logic, Fretboard2D.ts for 2D rendering, and enhanced Fretboard3D.ts with full gameplay integration