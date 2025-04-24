const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const playlist = document.getElementById('playlist');
const title = document.getElementById('title');
const fileUpload = document.getElementById('file-upload');
const lyricsUpload = document.getElementById('lyrics-upload');
const lyricsBox = document.getElementById('lyrics-box');
const uploadBox = document.getElementById('upload-box');
const themeButtons = document.querySelectorAll('[data-theme]');
const notesContainer = document.getElementById('floating-notes');

let currentIndex = 0;
let tracks = [];
let noteInterval = null;

// Theme Management
function setTheme(theme) {
  document.body.className = theme;
  
  // Create a burst of notes when changing themes
  for(let i = 0; i < 10; i++) {
    setTimeout(() => createFloatingNote(), i * 200);
  }
  
  // Update party effects
  if(theme === 'party') {
    document.getElementById('party-lights').style.display = 'block';
    createPartyEffect();
  } else {
    document.getElementById('party-lights').style.display = 'none';
    removePartyEffect();
  }
}

// Initialize theme buttons
themeButtons.forEach(btn => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});

// Auto-detect dark mode
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  setTheme('dark');
}

// File Upload
fileUpload.addEventListener('change', handleFiles);
uploadBox.addEventListener('dragover', e => {
  e.preventDefault();
  uploadBox.style.borderColor = '#0ff';
});
uploadBox.addEventListener('drop', e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});

function handleFiles(e) {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    if (file.type.includes('audio')) {
      tracks.push(file);
      const li = document.createElement('li');
      li.textContent = file.name;
      li.onclick = () => playTrack(tracks.indexOf(file));
      playlist.appendChild(li);
    }
  });
  if (tracks.length === 1) playTrack(0);
}

function playTrack(index) {
  currentIndex = index;
  audio.src = URL.createObjectURL(tracks[index]);
  title.textContent = tracks[index].name;
  highlightActive();
  audio.play();
}

function highlightActive() {
  playlist.querySelectorAll('li').forEach((li, i) => {
    li.classList.toggle('active', i === currentIndex);
  });
}

playBtn.onclick = () => audio.paused ? audio.play() : audio.pause();
prevBtn.onclick = () => {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  playTrack(currentIndex);
};
nextBtn.onclick = () => {
  currentIndex = (currentIndex + 1) % tracks.length;
  playTrack(currentIndex);
};

// Lyrics Upload
lyricsUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => lyricsBox.textContent = reader.result;
  reader.readAsText(file);
});

// Floating Notes
const symbols = ['♬', '♫', '♩', '♪', '♯', '♭', '𝅝', '𝅘𝅥𝅯', '𝅘𝅥𝅮'];
const colors = {
  light: ['#4a90e2', '#50c878', '#ff6b6b'],
  dark: ['#bb86fc', '#03dac6', '#cf6679'],
  neon: ['#0ff', '#f0f', '#ff0'],
  party: ['#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00']
};

function createFloatingNote() {
  // Create a new note element
  const note = document.createElement('div');
  note.className = 'note';
  note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  
  // Add size classes for variety
  const sizeRandom = Math.random();
  if (sizeRandom > 0.7) {
    note.classList.add('large');
  } else if (sizeRandom > 0.4) {
    note.classList.add('medium');
  } else {
    note.classList.add('small');
  }
  
  // Randomly add bright class for extra glow
  if (Math.random() > 0.7) {
    note.classList.add('bright');
  }
  
  // Add different wave patterns for more natural movement
  const wavePattern = Math.floor(Math.random() * 3) + 1;
  note.classList.add(`wave${wavePattern}`);
  
  // Get music container dimensions to avoid floating notes over it
  const musicContainer = document.getElementById('music-container');
  const containerRect = musicContainer.getBoundingClientRect();
  const containerLeft = containerRect.left;
  const containerRight = containerRect.right;
  const containerWidth = containerRect.width;
  const screenWidth = window.innerWidth;
  
  // Decide which side to place the note (left or right of container)
  let leftPosition;
  
  // Create space on both sides of container
  const leftSpace = containerLeft - 20; // 20px buffer
  const rightSpace = screenWidth - containerRight - 20; // 20px buffer
  
  // Choose left or right side of container based on available space
  if (Math.random() > 0.5 && rightSpace > 100) {
    // Place on right side
    leftPosition = containerRight + Math.random() * rightSpace;
  } else if (leftSpace > 100) {
    // Place on left side
    leftPosition = Math.random() * leftSpace;
  } else {
    // Default to random position if spaces are too small
    leftPosition = Math.random() * screenWidth;
  }
  
  // Set horizontal position
  note.style.left = leftPosition + 'px';
  
  // Calculate random animation delay (0-3s)
  const animDelay = Math.random() * 3;
  note.style.animationDelay = animDelay + 's';
  
  // Randomize animation duration (shorter for more natural movement)
  const duration = 7 + Math.random() * 5; // 7-12 seconds
  note.style.animationDuration = duration + 's';
  
  // Theme-based color with slight random variation
  const currentTheme = document.body.className || 'dark';
  const themeColors = colors[currentTheme];
  let baseColor = themeColors[Math.floor(Math.random() * themeColors.length)];
  
  // Create slight color variations
  if (Math.random() > 0.7) {
    note.style.filter = `hue-rotate(${Math.random() * 40 - 20}deg)`;
  }
  
  note.style.color = baseColor;
  
  // Add to container
  notesContainer.appendChild(note);
  
  // Remove note as soon as animation is expected to complete
  // We use duration + delay as the timeout with a small buffer
  // This ensures notes don't linger at the top
  setTimeout(() => {
    if (note && note.parentNode) {
      note.parentNode.removeChild(note);
    }
  }, (duration + animDelay) * 1000 + 200); // 200ms buffer
  
  // Increase limit for more notes but prevent excessive DOM elements
  if (notesContainer.children.length > 100) {
    notesContainer.removeChild(notesContainer.firstChild);
  }
}

// Create notes more frequently when music is playing
audio.addEventListener('play', () => {
  // Create several notes immediately when playback starts
  for (let i = 0; i < 10; i++) {
    setTimeout(() => createFloatingNote(), i * 100);
  }
  
  const interval = document.body.className === 'party' ? 300 : 600; // Even more frequent note creation
  noteInterval = setInterval(createFloatingNote, interval);
  document.querySelectorAll('.bar').forEach(bar => bar.style.animationPlayState = 'running');
});

audio.addEventListener('pause', () => {
  if (noteInterval) {
    clearInterval(noteInterval);
    noteInterval = null;
  }
  document.querySelectorAll('.bar').forEach(bar => bar.style.animationPlayState = 'paused');
});

// Party Theme Effects
function createPartyEffect() {
  // Create disco ball
  const discoBall = document.createElement('div');
  discoBall.className = 'disco-ball';
  document.body.appendChild(discoBall);

  // Create light beams
  for(let i = 0; i < 5; i++) {
    const beam = document.createElement('div');
    beam.className = 'light-beam';
    beam.style.setProperty('--rotation', `${i * 72}deg`);
    document.body.appendChild(beam);
  }
}

function removePartyEffect() {
  const discoBall = document.querySelector('.disco-ball');
  const beams = document.querySelectorAll('.light-beam');
  if(discoBall) discoBall.remove();
  beams.forEach(beam => beam.remove());
}

// Initialize party lights
document.getElementById('party-lights').style.display = 'none';

// Create initial floating notes when page loads
function startInitialNotes() {
  // Create many more initial notes (40 instead of 20)
  for (let i = 0; i < 40; i++) {
    setTimeout(() => createFloatingNote(), i * 100); // Faster creation (100ms vs 200ms)
  }
  
  // Set a continuous interval for creating new notes even when music isn't playing
  setInterval(() => {
    if (!noteInterval) {  // Only create notes if music isn't already playing
      createFloatingNote();
    }
  }, 800); // Create notes much more frequently (was 1500)
}

// Add a function to create a burst of notes
function createNoteBurst(count = 15) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => createFloatingNote(), i * 50);
  }
}

// Create a burst every 10 seconds for continuous visual impact
setInterval(createNoteBurst, 10000);

// Run when page is loaded
window.addEventListener('load', () => {
  startInitialNotes();
  // Create an initial burst after a short delay
  setTimeout(() => createNoteBurst(20), 1000);
});
