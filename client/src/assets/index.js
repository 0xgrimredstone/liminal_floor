// logo
import logo from './logo.svg';

// icon
import alertIcon from './alertIcon.svg';
import AlertIcon from './AlertIcon.jsx';

// sounds
import footstep from './sounds/footstep.mp3';
import bgm from './sounds/bgm.mp3';
import lose from './sounds/lose.wav';
import win from './sounds/win.wav';

export {
  logo,

  alertIcon,
  AlertIcon,

  footstep,
  bgm,
  lose,
  win
};

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

export const levels = [
  {
    id: 0,
    difficulty: "",
    start: [0, 0],
    goal: [4, 4],
    trap: [[4, 0]],
    map: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ],
    rotMap: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 1,
    difficulty: "★",
    start: [0, 1],
    goal: [2, 1],
    trap: [[1, 3]],
    map: [
      [0, 7, 5, 4, 0],
      [0, 8, 6, 2, 0],
      [0, 1, 8, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ],
    rotMap: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 2,
    difficulty: "★★",
    start: [0, 2],
    goal: [2, 1],
    trap: [[2, 3]],
    map: [
      [0, 0, 3, 0, 0],
      [0, 8, 7, 3, 0],
      [0, 1, 0, 2, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ],
    rotMap: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 3,
    difficulty: "★★",
    start: [0, 2],
    goal: [2, 3],
    trap: [
      [2, 1],
      [3, 2]
    ],
    map: [
      [0, 0, 5, 0, 0],
      [0, 3, 6, 0, 0],
      [0, 2, 5, 1, 0],
      [0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0]
    ],
    rotMap: [
      [0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 4,
    difficulty: "★★★",
    start: [0, 3],
    goal: [3, 1],
    trap: [[2, 3]],
    map: [
      [0, 0, 0, 7, 0],
      [0, 6, 3, 6, 0],
      [0, 8, 5, 2, 0],
      [0, 1, 7, 4, 0],
      [0, 0, 0, 0, 0]
    ],
    rotMap: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  }
];