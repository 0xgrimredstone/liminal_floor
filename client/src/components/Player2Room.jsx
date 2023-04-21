import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGlobalContext } from '../context';
import { levels } from '../assets/levels';

import styles from "../styles";
import { ActionButton, GameInfo, FadeIn, DynamicRoomMap, Loader2 } from '../components';
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
  const [directionAll, setDirectionAll] = useState([[0,0,0,0],[0,0,0,0],[0,0,0,0]]); // which directions are activated, ulrd
  const [choice, setChoice] = useState(0);  //[x,y,z
  const [isCommitRot, setCommitRot] = useState(false);
  // visuals
  const [isFullyRendered, setFullyRendered] = useState(true);
  // Helper Functions to calculate and gather corresponding values
  const determineDirection = (v,u,l,r) => {
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
        result = [1,r?1:0,l?1:0,u?1:0];
        break;
      case 4:
        result = [1,1,1,u?1:0];
        break;
      case 5:
        result = [0,r?1:0,1,u?1:0];
        break;
      case 6:
        result = [0,r?1:0,1,u?1:0];
        break;
      case 7:
        result = [1,r?1:0,l?1:0,u?1:0];
        break;
      case 8:
        result = [0,r?1:0,1,u?1:0];
        break;
      default:
        result = [0,0,0,u?1:0];
        break;
    }
    return result;
  }
  const rotateLeft = () => {
    setChoice(choice+1);
    var newDirection = [0,0,0,0];
    if (direction[0] == 1) newDirection[1] = 1; // up to left
    if (direction[1] == 1) newDirection[3] = 1; // left to down
    if (direction[2] == 1) newDirection[0] = 1; // right to up
    if (direction[3] == 1) newDirection[2] = 1; // down to right
    setDirection(newDirection);
  }
  const rotateRight = () => {
    setChoice(choice-1);
    var newDirection = [0,0,0,0];
    if (direction[0] == 1) newDirection[2] = 1; // up to right
    if (direction[1] == 1) newDirection[0] = 1; // left to up
    if (direction[2] == 1) newDirection[3] = 1; // right to down
    if (direction[3] == 1) newDirection[1] = 1; // down to left
    setDirection(newDirection);
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

    if (contract && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData, name]);

  // get next round game data and update the room
  useEffect(() => {
    // Retrieve position, map and goal information from gameData
    if (gameData?.activeRoom?.level) {
      // console.log("LOOK AT GAME MOVES "+gameData.activeRoom.moves[1]);
      let map = levels[gameData.activeRoom.level].map;
      let pos = gameData.activeRoom.position;
      let rot = gameData.activeRoom.gameRotationMap;
      if(!isFullyRendered) setFullyRendered(false); // to load data, hide the room for now

      setCommitRot(gameData.activeRoom.moves[1]); // set to true if player 2 has already rotated
      
      // if the room has changed from last time -> P1 has just moved and P2 needs to update their info
      // console.log("initial setup\nlevel = "+gameData.activeRoom.level+"\nroomValue = "+roomValue+"\npos = "+pos+"\nroom value in map = "+map[pos[0]][pos[1]]);
      
      // Determine available directions and perspective based on the current room's rotation
      let dir = (determineDirection(map[pos[0]][pos[1]]));  // set direction
      // get direction for all rooms nearby
      let left = pos[1]-1 > 0 ? determineDirection(map[pos[0]][pos[1]-1],false,true,true): determineDirection(0);
      let right = pos[1]+1 <= 5 ? determineDirection(map[pos[0]][pos[1]+1],true,false,false,true): determineDirection(0);
      let up = pos[0]+1 <= 5 ? determineDirection(map[pos[0]+1][pos[1]],true,false,true) : determineDirection(0);
      setDirectionAll([left, right, up]);
      
      // console.log("determine if new game?\nrotation value: "+rot[pos[0]][pos[1]]+"\nrecorded roomValue: "+roomValue+" != "+(map[pos[0]][pos[1]])+"\ndirection determined: "+dir);
      // if game just started or game is continuing
      if (rot[pos[0]][pos[1]] == 0 && roomValue != map[pos[0]][pos[1]] && roomValue != 0){
        console.log("it was a prev game");
        setChoice(0); // reset choice
      }
      else {
        console.log("it was a new game");
        // set committed direction
        var newDir = [0,0,0,0];
        switch(rot[pos[0]][pos[1]]){
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
        if (!(newDir[0] == 0 && newDir[1] == 0 && newDir[2] == 0 && newDir[3] == 0)) dir = newDir;  // if newDir is not [0,0,0,0]
        // console.log("rotationMap pos: "+rot[pos[0]][pos[1]]+" choice: "+choice+" direction: "+dir);
      }

      setRoomValue(map[pos[0]][pos[1]]);  // set room value
      setDirection(dir);
      if (pos[0] == levels[gameData.activeRoom.level].start[0] && pos[1] == levels[gameData.activeRoom.level].start[1])
        setStartingRoom(true);

      if(!isFullyRendered) setFullyRendered(true);
    }
    
  },[gameData?.activeRoom])

  const commitRotationClick = async () => {
    // check if player not trapped
    // direction [up, left, right, down]
    // directionAll [left, right, up]
    let isPlayerNotStuck = direction[0] && directionAll[2][3] || direction[1] && directionAll[0][2] || direction[2] && directionAll[1][1];
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

        <DynamicRoomMap index={roomValue} directionAll={directionAll} ready={isFullyRendered} choice={choice} direction={direction}/>
        
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
                commitRotationClick={rotateLeft}
                restStyles={`mr-10  hover:border-[#7c4353]`}
              />
              <ActionButton
                imgUrl={faRotateRight}
                commitRotationClick={rotateRight}
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