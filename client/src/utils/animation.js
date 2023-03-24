import { explosion } from '../assets';

// https://codepen.io/meodai/pen/OVVzBb\

export const playAudio = ( clip ) => {
  const audio = new Audio();
  audio.src = clip;

  return audio.play();
};