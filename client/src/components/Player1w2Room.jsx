import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGlobalContext } from '../context';

import styles from "../styles";
import {levels} from '../assets';
import { ActionButton, GameInfo, FadeIn, DynamicRoomCanvas, Loader2 } from '../components';
import { faChevronRight, faChevronLeft, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { playAudio } from '../utils/animation.js';

const Player1w2Room = () => {
  // get the context to access state and functions
  const {
    contract,
    gameData,
    walletAddress,
    setShowAlert,
    setErrorMessage
  } = useGlobalContext();

  // set initial state values
  const { name } = useParams();   //room/Name
  const [player, setPlayer] = useState({}); 
  const [roomValue, setRoomValue] = useState(0);    // get room value to change model
  const [isStartingRoom, setStartingRoom] = useState(false);  // determine whether current room is starting room
  // multiplayer synchro
  const [mapPerspective, setMapPerspective] = useState({up: [1,0], left: [0,1], right: [0,-1]});
  const [isP2Commit, setP2Commit] = useState(false);
  // visuals
  const [isFullyRendered, setFullyRendered] = useState(true);
  const [cameraPos, setCameraPos] = useState(0);
  const [buttonAvailable, setButtonAvailable] = useState([false, false, false]);
  const inactiveButtonStyle = "bg-white dark:bg-white";
  const activeButtonStyle = " hover:border-[#7c4353]";
  // Helper Functions to calculate and gather corresponding values
  const determineDir = (v) => {
    var result = [false,false,false,false];
    switch(v){
      case 3:
        result = [true,false,false,false];
        break;
      case 4:
        result = [true,true,true,false];
        break;
      case 5:
        result = [false,false,true,false];
        break;
      case 6:
        result = [false,false,true,false];
        break;
      case 7:
        result = [true,false,false,false];
        break;
      case 8:
        result = [false,false,true,false];
        break;
      default:
        result = [false,false,false,false];
        break;
    }
    return result;
  }
  const rotate1 = (direction) => {
    var newDirection = [false, false, false, false];
    if (direction[0] == true) newDirection[1] = true; // up to left
    if (direction[1] == true) newDirection[3] = true; // left to down
    if (direction[2] == true) newDirection[0] = true; // right to up
    if (direction[3] == true) newDirection[2] = true; // down to right
    return newDirection;
  }
  const rotate2 = (direction) => {
    var newDirection = [0,0,0,0];
    if (direction[0] == true) newDirection[3] = true; // up to down
    if (direction[1] == true) newDirection[2] = true; // left to right
    if (direction[2] == true) newDirection[1] = true; // right to left
    if (direction[3] == true) newDirection[0] = true; // down to up
    return newDirection;
  }
  const rotate3 = (direction) => {
    var newDirection = [0,0,0,0];
    if (direction[0] == true) newDirection[2] = true; // up to right
    if (direction[1] == true) newDirection[0] = true; // left to up
    if (direction[2] == true) newDirection[3] = true; // right to down
    if (direction[3] == true) newDirection[1] = true; // down to left
    return newDirection;
  }

  // fetch player info from contract and set player state
  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        let player01Address = gameData.activeRoom.players[0];   // save players locally
        // Fetch player data
        const p1TokenData = await contract.getPlayerToken(player01Address);
        const player01 = await contract.getPlayer(player01Address);
        setPlayer({ ...player01, Token: p1TokenData });         // set state
        // console.log(player);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (contract && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData, name]);

   // get next round game data and update the room
  useEffect(() => {
    // console.log(gameData);
    // update the room only if the level data is available
    if (gameData?.activeRoom?.level && gameData?.activeRoom?.moves[1]) {
      setCameraPos(0);
      setTimeout(()=> setP2Commit(true), [1500]); // TODO: immediet fade out when commit w/o animation..
      
      // get the data for the current round
      updateButtonsnDepth();

      let pos = gameData.activeRoom.position;
      let currLvl = levels[gameData.activeRoom.level];

      if (pos[0] == currLvl.start[0] && pos[1] == currLvl.start[1]) setStartingRoom(true); // check if the player is at the starting position
      if(!isFullyRendered) setFullyRendered(true);  // set fully rendered state to true
      setRoomValue(currLvl.map[pos[0]][pos[1]]);    // set the room value for the current position
    }
  },[gameData?.activeRoom])

  const updateButtonsnDepth = () => {
    // console.log(gameData.activeRoom);
    // Retrieve position, map and goal information from gameData
    let pos = gameData.activeRoom.position;
    let map = levels[gameData.activeRoom.level].map
    let goal = levels[gameData.activeRoom.level].goal

    // Determine available directions and perspective based on the current room's rotation
    let availTemp = [false, false, false];  // up, left, right
    let dir = [false, false, false, false] // up, left, right, down
    let pers = {up: [1,0], left: [0,1], right: [0,-1]};  // default pers

    switch(levels[gameData.activeRoom.level].rotMap[pos[0]][pos[1]]){
      case 1:
        dir = rotate1(determineDir(map[pos[0]][pos[1]]));
        pers = {up: [0,1], left: [-1,0], right: [1,0]};
        break;
      case 2:
        dir = rotate2(determineDir(map[pos[0]][pos[1]]));
        pers = {up: [-1,0], left: [0,-1], right: [0,1]};
        break;
      case 3:
        dir = rotate3(determineDir(map[pos[0]][pos[1]]));
        pers = {up: [0,-1], left: [1,0], right: [-1,0]};
        break;
      default:
        dir = determineDir(map[pos[0]][pos[1]]);
        break;
    }

    // console.log("rotated: "+levels[gameData.activeRoom.level].rotMap[pos[0]][pos[1]]+" so direction: "+direction+" and pers: "+pers.up+" "+pers.left+" "+pers.right);
    
    // Check if tiles in the available directions are movable and set the corresponding availability flags
    let posUp0 = pos[0] + pers.up[0];
    let posUp1 = pos[1] + pers.up[1];
    // console.log(posUp0+", "+posUp1+" is in boundary?");
    if (posUp0 < 5 && posUp0 >= 0 && posUp1 < 5 && posUp1 >= 0){
      // console.log("is "+map[posUp0][posUp1]+" a movable tile and "+determineDir(map[pos[0]][pos[1]])[0]+" is it movable from the room?");
      // if leads somewhere and if movable from current room
      if(map[posUp0][posUp1] != 0 && determineDir(map[pos[0]][pos[1]])[0])
        availTemp[0] = true;
    }

    let posLeft0 = pos[0] + pers.left[0];
    let posLeft1 = pos[1] + pers.left[1];
    // console.log(posLeft0+", "+posLeft1+" is in boundary?");
    if (posLeft0 < 5 && posLeft0 >= 0 && posLeft1 < 5 && posLeft1 >= 0){
      // console.log("is "+map[posLeft0][posLeft1]+" a movable tile and "+determineDir(map[pos[0]][pos[1]])[1]+" is it movable from the room?");
      if(map[posLeft0][posLeft1] != 0 && determineDir(map[pos[0]][pos[1]])[1])
        availTemp[1] = true;
    }

    let posRight0 = pos[0] + pers.right[0];
    let posRight1 = pos[1] + pers.right[1];
    // console.log(posRight0+", "+posRight1+" is in boundary?");
    if (posRight0 < 5 && posRight0 >= 0 && posRight1 < 5 && posRight1 >= 0){
      // console.log("is "+map[posRight0][posRight1]+" a movable tile and "+determineDir(map[pos[0]][pos[1]])[2]+" is it movable from the room?");
      if(map[posRight0][posRight1] != 0 && determineDir(map[pos[0]][pos[1]])[2])
        availTemp[2] = true;
    }
    
    setButtonAvailable(availTemp);
    setMapPerspective(pers);
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
        choiceCoord = mapPerspective.up;
        break;
      case 2:
        choiceCoord = mapPerspective.left;
        break;
      case 3:
        choiceCoord = mapPerspective.right;
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
      // if(isFullyRendered) setFullyRendered(false);
      updateButtonsnDepth();
      setCameraPos(choice); // pass choice to move different direction
      playAudio(footstep);
      setP2Commit(false);   // wait for P2 to set the room again
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
      {isP2Commit ? (
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

          </div>
          <GameInfo gameInfo={1} isIntial={isStartingRoom}/> 
        </FadeIn>
      ) : (
        <div className={`${styles.flexCenter} flex-col m-20`}>
          <Loader2/>
          <p className={styles.gameInfoText}>Waiting for Player 2 to confirm room setup...</p>
        </div>
      )}
    </section>
  );
};

export default Player1w2Room;