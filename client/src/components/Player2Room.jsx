import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGlobalContext } from '../context';
import {levels, footstep} from '../assets';

import styles from "../styles";
import { ActionButton, GameInfo, FadeIn, DynamicRoomMap, Loader2, CustomButton } from '../components';
import { faRotateRight, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { playAudio } from '../utils/animation.js';

const Player2Room = () => {
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
  const [direction, setDirection] = useState([0,0,0,0]); // which directions are activated, ulrd
  const [directionAll, setDirectionAll] = useState([0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]); // which directions are activated, ulrd
  const [choice, setChoice] = useState(0);  //[x,y,z
  const [isCommitRot, setCommitRot] = useState(false);
  // visuals
  const [isFullyRendered, setFullyRendered] = useState(true);
  // Helper Functions to calculate and gather corresponding values
  const determineDirection = (v,u) => {
    var result = [0,0,0,0];
    switch(v){
      case 0:
        break;
      case 1:
        result = [1,1,1,1];
        break;
      case 2:
        result = [1,1,1,1];
        break;
      case 3:
        result = [1,u?1:0,u?1:0,u?1:0];
        break;
      case 4:
        result = [1,1,1,u?1:0];
        break;
      case 5:
        result = [0,u?1:0,1,0];
        break;
      case 6:
        result = [1,0,1,0];
        break;
      case 7:
        result = [1,0,0,u?1:0];
        break;
      case 8:
        result = [1,0,0,1];
        break;
      default:
        result = [0,0,0,u?1:0];
        break;
    }
    return result;
  }
  const determineRotation = (v,dir) => {
    let newDir = [0,0,0,0];
    switch(v){
      case 0:
        if (dir[0] == 1) newDir[0] = 1; // up to up
        if (dir[1] == 1) newDir[1] = 1; // left to left
        if (dir[2] == 1) newDir[2] = 1; // right to right
        if (dir[3] == 1) newDir[3] = 1; // down to down
        break;
      case 1:
        if (dir[0] == 1) newDir[1] = 1; // up to left
        if (dir[1] == 1) newDir[3] = 1; // left to down
        if (dir[2] == 1) newDir[0] = 1; // right to up
        if (dir[3] == 1) newDir[2] = 1; // down to right
        setChoice(1);
        break;
      case 2:
        if (dir[0] == 1) newDir[3] = 1; // up to down
        if (dir[1] == 1) newDir[2] = 1; // left to right
        if (dir[2] == 1) newDir[1] = 1; // right to left
        if (dir[3] == 1) newDir[0] = 1; // down to up
        setChoice(2);
        break;
      case 3:
        if (dir[0] == 1) newDir[2] = 1; // up to right
        if (dir[1] == 1) newDir[0] = 1; // left to up
        if (dir[2] == 1) newDir[3] = 1; // right to down
        if (dir[3] == 1) newDir[1] = 1; // down to left
        setChoice(3);
        break;
      default:
          break;
    }
    return newDir;
  }
  const rotateLeft = () => {
    setChoice(choice+1);
    var newDirection = [0,0,0,0];
    if (directionAll[4][0] == 1) newDirection[1] = 1; // up to left
    if (directionAll[4][1] == 1) newDirection[3] = 1; // left to down
    if (directionAll[4][2] == 1) newDirection[0] = 1; // right to up
    if (directionAll[4][3] == 1) newDirection[2] = 1; // down to right
    let newState = [...directionAll];
    newState[4] = newDirection;
    setDirectionAll(newState);
  }
  const rotateRight = () => {
    setChoice(choice-1);
    var newDirection = [0,0,0,0];
    if (directionAll[4][0] == 1) newDirection[2] = 1; // up to right
    if (directionAll[4][1] == 1) newDirection[0] = 1; // left to up
    if (directionAll[4][2] == 1) newDirection[3] = 1; // right to down
    if (directionAll[4][3] == 1) newDirection[1] = 1; // down to left
    let newState = [...directionAll];
    newState[4] = newDirection;
    setDirectionAll(newState);
  }

  // fetch player info from contract and set player state
  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        let player02Address = gameData.activeRoom.players[1];   // save players locally
        // Fetch player data
        const p2TokenData = await contract.getPlayerToken(player02Address);
        const player02 = await contract.getPlayer(player02Address);
        setPlayer({ ...player02, Token: p2TokenData });         // set state
        // console.log(player);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (contract && walletAddress && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData, name]);

  // get next round game data and update the room
  useEffect(() => {
    // Retrieve position, map and goal information from gameData
    if (gameData?.activeRoom?.level) {
      // console.log("LOOK AT GAME MOVES "+gameData.activeRoom.moves[1]);
      let map = levels[gameData.activeRoom.level].map;
      let pos = gameData.activeRoom.position;
      // let rot = levels[gameData.activeRoom.level].rotMap;
      let rot = gameData.activeRoom.gameRotationMap;
      if(!isFullyRendered) setFullyRendered(false); // to load data, hide the room for now

      setCommitRot(gameData.activeRoom.moves[1]); // set to true if player 2 has already rotated
      
      // if the room has changed from last time -> P1 has just moved and P2 needs to update their info
      // console.log("initial setup\nlevel = "+gameData.activeRoom.level+"\nroomValue = "+roomValue+"\npos = "+pos+"\nroom value in map = "+map[pos[0]][pos[1]]);
      
      // Determine available directions and perspective based on the current room's rotation
      let allDir = [];  // set direction
      let counter = 0;
      // get direction for all rooms nearby
      console.log(pos);
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          let x = pos[0]+i;
          let y = pos[1]+j;
          console.log(counter+": "+x+" "+y+"");
          if (x < 0 || x > 5 || y < 0 || y > 5) 
            allDir.push(determineDirection(0));
          else {
            let temp = (counter == 2 ? false : true);
            console.log("direction for "+map[x][y]+" at "+x+" "+y+" w temp "+temp+" = "+determineDirection(map[x][y],temp));
            console.log("rotation for "+rot[x][y]+" at "+x+" "+y+" = "+determineRotation(rot[x][y], determineDirection(map[x][y],temp)));
            allDir.push(determineRotation(rot[x][y], determineDirection(map[x][y],temp)));
            console.log(counter+": "+allDir[counter]);
          }
          counter++;
        }
      }
      setDirectionAll(allDir);
      
      // console.log("determine if new game?\nrotation value: "+rot[pos[0]][pos[1]]+"\nrecorded roomValue: "+roomValue+" != "+(map[pos[0]][pos[1]])+"\ndirection determined: "+dir);
      // console.log("rotationMap pos: "+rot[pos[0]][pos[1]]+" choice: "+choice+" direction: "+dir);
      

      setRoomValue(map[pos[0]][pos[1]]);  // set room value
      setDirection(allDir[4]);
      if (pos[0] == levels[gameData.activeRoom.level].start[0] && pos[1] == levels[gameData.activeRoom.level].start[1])
        setStartingRoom(true);

      if(!isFullyRendered) setFullyRendered(true);
    }
    
  },[gameData?.activeRoom])

  const commitRotationClick = async () => {
    // check if player not trapped
    // direction [up, left, right, down]
    // directionAll [up, left, right]
    let isPlayerNotStuck = 
      directionAll[4][0] == 1 && directionAll[3][3] == 1 || 
      directionAll[4][1] == 1 && directionAll[1][2] == 1 || 
      directionAll[4][2] == 1 && directionAll[7][1] == 1 || 
      directionAll[4][3] == 1 && directionAll[5][0] == 1;
    if (!isPlayerNotStuck) {
      setShowAlert({
          status: true,
          type: 'failure',
          message: "Player 1 will be trapped! Change the rotations so Player 1 can still move!",
        });
      return;
    }
    // console.log(direction[0] && directionAll[2][3]);
    // console.log(direction[1] && directionAll[0][2]);
    // console.log(direction[2] && directionAll[1][1]);

    // call Player2Move in contract
    try {
      // console.log("Player not trapped, calling contract");
      let pos = gameData.activeRoom.position;
      let toChange = choice % 4;
      if (toChange < 0) toChange=(choice % 4) + 4;  // 0 = no, 1 = left, 2 = back, 3 = right

      // console.log("GameProgress("+name+", "+pos+", "+toChange+")");
      await contract.GameProgress(pos, toChange, name, { gasLimit: 500000 });

      // successfully finished round
      // console.log("LOOK AT GAME MOVES "+gameData.activeRoom.moves);
      setCommitRot(true);
      playAudio(footstep);

    } catch (error) {
      console.log(error);
      setErrorMessage(error);
    }
  }

  return (
    <section className={`${styles.flexBetween} ${styles.gameContainer} relative w-full h-screen mx-auto bg-siteblack`}>
      <FadeIn show={isFullyRendered}>

        <DynamicRoomMap 
          wholeMap = {levels[gameData.activeRoom.level].map} 
          P1Position = {gameData.activeRoom.position} 
          // commitedRot = {levels[gameData.activeRoom.level].rotMap} 
          commitedRot = {gameData.activeRoom.gameRotationMap} 
          rotChoice = {choice}
          direction = {direction}
          directionAll = {directionAll}
        />
        
        {isCommitRot ? (
          <div className={`${styles.flexCenter} flex-col m-20`}>
            <Loader2/>
            <p className={styles.gameInfoText}>Waiting for Player 1 to move...</p>
          </div>
        ) : (
          <div className={`${styles.flexCenter} flex-col m-20`}>

            <div className="flex items-center flex-row">
              <ActionButton
                imgUrl={faRotateLeft}
                handleClick={rotateLeft}
                restStyles={`mr-10  hover:border-[#7c4353]`}
              />
              <ActionButton
                imgUrl={faRotateRight}
                handleClick={rotateRight}
                restStyles={`ml-10  hover:border-[#7c4353]`}
              />
            </div>

            <div className={`${styles.flexCenter} m-5`}>
              <CustomButton title="Confirm rotations" handleClick={commitRotationClick} />
            </div>

          </div>  
          )}

        <GameInfo gameInfo={2} isInitial={isStartingRoom}/> 
      </FadeIn>
    </section>
  );
};

export default Player2Room;