export const playAudio = ( clip ) => {
  const audio = new Audio();
  audio.src = clip;
  audio.volume = 0.7;
  audio.play()

  return audio;
};