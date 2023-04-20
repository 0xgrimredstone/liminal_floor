import ReactTooltip from 'react-tooltip';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from "../styles";
import DynamicRoomCanvas from '../components/DynamicRoomCanvas';
import { useGlobalContext } from '../context';
import { playAudio } from '../utils/animation.js';
import { levels } from '../assets/levels';

import { ActionButton, GameInfo, FadeIn, AudioButton } from '../components';
import { faChevronRight, faChevronLeft, faChevronUp } from '@fortawesome/free-solid-svg-icons'

const Player1Room = () => {
  // info
  const { contract, gameData, walletAddress, showAlert, setShowAlert, setErrorMessage, playerRef, depth, setDepth} = useGlobalContext();
  const [player, setPlayer] = useState({}); 
  const { name } = useParams();//room/Name
  const [roomValue, setRoomValue] = useState(0);
  // visuals
  const [isFullyRendered, setFullyRendered] = useState(true);
  const [buttonAvailable, setButtonAvailable] = useState([false, false, false]);
  const inactiveButtonStyle = "bg-white dark:bg-white";
  const activeButtonStyle = " hover:border-[#7c4353]";
  const [cameraPos, setCameraPos] = useState(0);

  // initial setup
  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        // save players locally
        let player01Address = null;

        if (gameData.activeRoom.players[0].toLowerCase() === walletAddress.toLowerCase()) {
          player01Address = gameData.activeRoom.players[0];
        }

        // fetch player data
        const p1TokenData = await contract.getPlayerToken(player01Address);
        const player01 = await contract.getPlayer(player01Address);

        // set state
        setPlayer({ ...player01, Token: p1TokenData });
        console.log(player);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (contract && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData, name]);

  // get next round game data
  useEffect(() => {
    setCameraPos(0);
    if (gameData?.activeRoom?.level) {
      getRoundValues();
      if(!isFullyRendered) setFullyRendered(true);
      setRoomValue(levels[gameData.activeRoom.level].map[gameData.activeRoom.position[0]][gameData.activeRoom.position[1]]);
    }
    
  },[gameData?.activeRoom])

  const getRoundValues = () => {
    console.log(gameData.activeRoom);
    let availTemp = [false, false, false];
    let pos = gameData.activeRoom.position;
    let map = levels[gameData.activeRoom.level].map
    let goal = levels[gameData.activeRoom.level].goal
    let calcDepth = Math.abs(goal[0]-pos[0])+Math.abs(goal[1]-pos[1]);
    setDepth(calcDepth);

    if (pos[0] + 1 <= 5){
      if(map[pos[0]+1][pos[1]] != 0) {
        availTemp[0] = true;
      }
    }
    if (pos[1] + 1 <= 5){
      if(map[pos[0]][pos[1]+1] != 0) {
        availTemp[1] = true;
      }
    }
    if (pos[1] - 1 >= 0){
      if(map[pos[0]][pos[1]-1] != 0) {
        availTemp[2] = true;
      }
    }
    setButtonAvailable(availTemp);
  }

  const makeAMove = async (choice) => {
    if(!buttonAvailable[choice-1]) {
      console.log("unavailable");
      return;
    }

    // determine new position
    let choiceCoord = [0,0];
    switch(choice) {
      case 1:
        choiceCoord = [1,0];
        break;
      case 2:
        choiceCoord = [0,1];
        break;
      case 3:
        choiceCoord = [0,-1];
        break;
      default:
        break;
    }
    let newPosition = [gameData.activeRoom.position[0]+choiceCoord[0], gameData.activeRoom.position[1]+choiceCoord[1]];
    let newPosition2 = choiceCoord;

    // determine game outcome | 0 = none, 3 = lose, 4 = win
    let outcome = 0;
    if (newPosition[0] == levels[gameData.activeRoom.level].goal[0] && newPosition[1] == levels[gameData.activeRoom.level].goal[1]) {
      outcome = 4;
    }
    for (let i = 0; i < levels[gameData.activeRoom.level].trap.length; i++) {
      if (newPosition[0] == levels[gameData.activeRoom.level].trap[i][0] && newPosition[1] == levels[gameData.activeRoom.level].trap[i][1]) {
        outcome = 3;
      }
    }

    try {
      console.log(newPosition2, outcome, newPosition);
      await contract.GameProgress(newPosition2, outcome, name, { gasLimit: 500000 });
      if(isFullyRendered) setFullyRendered(false);
      playAudio( footstep );
      
      setShowAlert({
        status: true,
        type: 'info',
        message: `Going ${choice === 1 ? 'forward' : choice === 2 ? 'left' : 'right'}`,
      });
      getRoundValues();
      setCameraPos(choice);
    } catch (error) {
      console.log(error);
      setErrorMessage(error);
    }
  }

  return (
    <section className={`${styles.flexBetween} ${styles.gameContainer} relative w-full h-screen mx-auto bg-siteblack`}>
      <FadeIn show={isFullyRendered}>
        <DynamicRoomCanvas index={roomValue} ready={isFullyRendered} choice={cameraPos}/>
        <div className={`${styles.flexCenter} flex-col mb-20`}>
        <div className="flex items-center flex-row">
        <ActionButton
            imgUrl={faChevronUp}
            handleClick={() => makeAMove(1)}
            restStyles={`mx-10 mt-10 ${buttonAvailable[0] ? activeButtonStyle : inactiveButtonStyle}`}
          />
        </div>
        <div className="flex items-center flex-row">
          <ActionButton
            imgUrl={faChevronLeft}
            handleClick={() => makeAMove(2)}
            restStyles={`mr-10 ${buttonAvailable[1] ? activeButtonStyle : inactiveButtonStyle}`}
          />
          
          <ActionButton
            imgUrl={faChevronRight}
            handleClick={() => makeAMove(3)}
            restStyles={`ml-10 ${buttonAvailable[2] ? activeButtonStyle : inactiveButtonStyle}`}
          />
        </div>
        <div>
          <div
            data-for={`Depth`}
            data-tip="How close you are to the goal"
            className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${styles.playerMana} cursor-default`}
          >
            {depth}
          </div>
        </div>
        </div>
        <GameInfo /> 
        <ReactTooltip id={`Depth`} effect="solid" backgroundColor="#7c4353" />
      </FadeIn>
    </section>
  );
};

export default Player1Room;