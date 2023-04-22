import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGlobalContext } from '../context';
import { levels, footstep } from '../assets';

import styles from "../styles";
import { ActionButton, GameInfo, FadeIn, DynamicRoomCanvas } from '../components';
import { faChevronRight, faChevronLeft, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { playAudio } from '../utils/animation.js';
import ReactTooltip from 'react-tooltip';

const Player1Room = () => {
  // get the context to access state and functions
  const {
    contract,
    gameData,
    walletAddress,
    setShowAlert,
    setErrorMessage,
    depth,
    setDepth
  } = useGlobalContext();
  
  // set initial state values
  const { name } = useParams();   //room/Name
  const [player, setPlayer] = useState({}); 
  const [roomValue, setRoomValue] = useState(0);    // get room value to change model
  const [isStartingRoom, setStartingRoom] = useState(false);  // determine whether current room is starting room
  const [isFullyRendered, setFullyRendered] = useState(true);
  const [cameraPos, setCameraPos] = useState(0);
  const [buttonAvailable, setButtonAvailable] = useState([false, false, false]);
  const inactiveButtonStyle = "bg-white dark:bg-white";
  const activeButtonStyle = " hover:border-[#7c4353]";

  // fetch player info from contract and set player state
  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        let player01Address = null;
        // Check if this is the first player in the room
        if (gameData.activeRoom.players[0].toLowerCase() === walletAddress.toLowerCase())
          player01Address = gameData.activeRoom.players[0];
        // Fetch player data
        const p1TokenData = await contract.getPlayerToken(player01Address);
        const player01 = await contract.getPlayer(player01Address);
        setPlayer({ ...player01, Token: p1TokenData });   // set state
        // console.log(player);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (contract && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData, name]);

  // get next round game data and update the room
  useEffect(() => {
    setCameraPos(0);

    // update the room only if the level data is available
    if (gameData?.activeRoom?.level) {
      // get the data for the current round
      updateButtonsnDepth();

      let pos = gameData.activeRoom.position;
      let currLvl = levels[gameData.activeRoom.level];

      if (pos[0] == currLvl.start[0] && pos[1] == currLvl.start[1]) setStartingRoom(true); // check if the player is at the starting position
      if(!isFullyRendered) setFullyRendered(true);  // set fully rendered state to true
      setRoomValue(currLvl.map[pos[0]][pos[1]]);    // set the room value for the current position
    }
  },[gameData?.activeRoom])

  // calculate the button availability for the current position
  const updateButtonsnDepth = () => {
    // console.log(gameData.activeRoom);
    let availTemp = [false, false, false];
    let pos = gameData.activeRoom.position;
    let map = levels[gameData.activeRoom.level].map
    let goal = levels[gameData.activeRoom.level].goal

    let calcDepth = Math.abs(goal[0]-pos[0])+Math.abs(goal[1]-pos[1]);
    setDepth(calcDepth);
    console.log(map);
    // check boundary & update accordingly
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

  // When players decided which direction to go
  const makeAMove = async (choice) => {
    // Make sure button is available
    if(!buttonAvailable[choice-1]) {
      console.log("unavailable");
      return;
    }

    // Determine new position based on corresponding choice
    let choiceCoord = [0,0];
    switch(choice) {
      case 1:
        choiceCoord = [1,0];  // up
        break;
      case 2:
        choiceCoord = [0,1];  // left
        break;
      case 3:
        choiceCoord = [0,-1]; // right
        break;
      default:
        break;
    }

    let currLvl = levels[gameData.activeRoom.level];
    let newPosition = [gameData.activeRoom.position[0]+choiceCoord[0], gameData.activeRoom.position[1]+choiceCoord[1]];

    // Determine game outcome | 0 = none, 3 = lose, 4 = win
    let outcome = 0;
    if (newPosition[0] == currLvl.goal[0] && newPosition[1] == currLvl.goal[1]) {
      outcome = 5;
    }
    for (let i = 0; i < levels[gameData.activeRoom.level].trap.length; i++) {
      if (newPosition[0] == currLvl.trap[i][0] && newPosition[1] == currLvl.trap[i][1]) {
        outcome = 4;
      }
    }

    // Update the game progress
    try {
      // console.log(choiceCoord, outcome, newPosition);
      await contract.GameProgress(newPosition, outcome, name, { gasLimit: 500000 });
      
      // successfully made a move, update front-end
      if(isFullyRendered) setFullyRendered(false);
      updateButtonsnDepth();
      setCameraPos(choice); // pass choice to move different direction
      playAudio(footstep);
      setShowAlert({
        status: true,
        type: 'info',
        message: `Going ${choice === 1 ? 'forward' : choice === 2 ? 'left' : 'right'}`,
      });
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

        <GameInfo gameInfo={0} isInitial={isStartingRoom}/> 
        <ReactTooltip id={`Depth`} effect="solid" backgroundColor="#7c4353" />
      </FadeIn>
    </section>
  );
};

export default Player1Room;