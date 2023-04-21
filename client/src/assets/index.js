// backgrounds
import saiman from './background/saiman.jpg';
import astral from './background/astral.jpg';
import eoaalien from './background/eoaalien.jpg';
import panight from './background/panight.jpg';
import heroImg from './background/hero-img.jpg';
import launchImg from './background/launch-img.jpg';

// logo
import logo from './logo.svg';

// icon
import alertIcon from './alertIcon.svg';
import AlertIcon from './AlertIcon.jsx';

// players
import player01 from './player01.png';
import player02 from './player02.png';

// sounds
import attackSound from './sounds/attack.wav';
import defenseSound from './sounds/defense.mp3';
import explosion from './sounds/explosion.mp3';
import footstep from './sounds/footstep.mp3';
import bgm from './sounds/bgm.mp3';
import lose from './sounds/lose.wav';
import win from './sounds/win.wav';


export {
  saiman,
  astral,
  eoaalien,
  panight,
  heroImg,
  launchImg,

  logo,

  alertIcon,
  AlertIcon,

  player01,
  player02,

  attackSound,
  defenseSound,
  explosion,
  footstep,
  bgm,
  lose,
  win
};

export const battlegrounds = [
  { id: 'bg-saiman', image: saiman, name: 'Saiman' },
  { id: 'bg-astral', image: astral, name: 'Astral' },
  { id: 'bg-eoaalien', image: eoaalien, name: 'Eoaalien' },
  { id: 'bg-panight', image: panight, name: 'Panight' },
];

export const gameRules = [
  'Your goal is to escape this level by finding the stairs.',
  'You can find the stairs by moving left, right, or forward.',
  'Rule of thumb: go forward as much as possible',
  'Beware: trap rooms only have one entrace and no exit'
];

export const gameRules1 = [
  'Your goal is to escape this level by finding the stairs.',
  'You can work with player 2, who will be rotating you a path towards the stairs.',
  'Rule of thumb: go forward as much as possible',
  'Beware: trap rooms only have one entrace and no exit'
];

export const gameRules2 = [
  'Your goal is to help player 1 escape this level by finding the stairs.',
  'You can see where player 1 is located, and rotate their room to reach other places',
  "Once you've decided the rotation, click 'confirm rotation' and wait for player 1 to move"
];