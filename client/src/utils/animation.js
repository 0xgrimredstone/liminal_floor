import { explosion } from '../assets';

// https://codepen.io/meodai/pen/OVVzBb\

export const playAudio = ( clip, loop ) => {
  const audio = new Audio();
  audio.src = clip;
  loop ? audio.loop = true : audio.loop = false;


  return audio;
};