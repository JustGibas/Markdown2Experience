document.addEventListener('DOMContentLoaded', () => {
  const audioElements = document.querySelectorAll('audio');
  const sections = document.querySelectorAll('section');
  let currentAudioIndex = 0;

  const playPauseButton = document.createElement('button');
  playPauseButton.innerHTML = 'Play';
  playPauseButton.addEventListener('click', () => {
    const currentAudio = audioElements[currentAudioIndex];
    if (currentAudio.paused) {
      currentAudio.play();
      playPauseButton.innerHTML = 'Pause';
    } else {
      currentAudio.pause();
      playPauseButton.innerHTML = 'Play';
    }
  });

  const rewindButton = document.createElement('button');
  rewindButton.innerHTML = 'Rewind';
  rewindButton.addEventListener('click', () => {
    const currentAudio = audioElements[currentAudioIndex];
    currentAudio.currentTime -= 10;
  });

  const fastForwardButton = document.createElement('button');
  fastForwardButton.innerHTML = 'Fast Forward';
  fastForwardButton.addEventListener('click', () => {
    const currentAudio = audioElements[currentAudioIndex];
    currentAudio.currentTime += 10;
  });

  const progressBar = document.createElement('progress');
  progressBar.max = 100;
  progressBar.value = 0;

  audioElements.forEach((audio, index) => {
    audio.addEventListener('timeupdate', () => {
      progressBar.value = (audio.currentTime / audio.duration) * 100;
    });

    audio.addEventListener('ended', () => {
      if (index < audioElements.length - 1) {
        currentAudioIndex++;
        sections[currentAudioIndex].scrollIntoView({ behavior: 'smooth' });
        audioElements[currentAudioIndex].play();
        playPauseButton.innerHTML = 'Pause';
      }
    });
  });

  document.body.appendChild(playPauseButton);
  document.body.appendChild(rewindButton);
  document.body.appendChild(fastForwardButton);
  document.body.appendChild(progressBar);
});
