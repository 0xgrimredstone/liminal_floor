import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from "../styles";
import DynamicRoomMap from './DynamicRoomMap';
import { useGlobalContext } from '../context';
import { footstep } from '../assets';
import { levels } from '../assets/levels';
import {playAudio} from '../utils/animation.js'

import { ActionButton, GameInfo, FadeIn, CustomButton, Loader2 } from '.';
import { faRotateRight, faRotateLeft } from '@fortawesome/free-solid-svg-icons'

const Player2Room = () => {
  // info
  const { contract, gameData, walletAddress, setErrorMessage, setShowAlert, setUpdateGameData} = useGlobalContext();
  const [player, setPlayer] = useState({}); 
  const { name } = useParams();//room/Name
  const [direction, setDirection] = useState([0,0,0,0]); // which directions are activated, ulrd
  const [directionAll, setDirectionAll] = useState([[0,0,0,0],[0,0,0,0],[0,0,0,0]]); // which directions are activated, ulrd
  // visuals
  const [isFullyRendered, setFullyRendered] = useState(true);
  const [isCommitRot, setCommitRot] = useState(false);
  const [choice, setChoice] = useState(0);//[x,y,z
  const [roomValue, setRoomValue] = useState(0);

  const determineDirection = (v,inclD) => {
    var result = [0,0,0,0];
    switch(v){
      case 3:
        result = [1,0,0,inclD? 1 : 0];
        break;
      case 4:
        result = [1,1,1,inclD? 1 : 0];
        break;
      case 5:
        result = [0,0,1,inclD? 1 : 0];
        break;
      case 6:
        result = [1,0,1,inclD? 1 : 0];
        break;
      case 7:
        result = [1,0,0,inclD? 1 : 0];
        break;
      case 8:
        result = [0,0,1,inclD? 1 : 0];
        break;
      default:
        result = [0,0,0,inclD? 1 : 0];
        break;
    }
    return result;
  }

  // initial setup
  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        // save players locally
        let player02Address = gameData.activeRoom.players[1];
        
        // fetch player data
        const p2TokenData = await contract.getPlayerToken(player02Address);
        const player02 = await contract.getPlayer(player02Address);

        // set state
        setPlayer({ ...player02, Token: p2TokenData });
        console.log(player);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (contract && walletAddress && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData, name]);

  // get next round game data
  useEffect(() => {
    if (gameData?.activeRoom?.level) {
      // console.log("LOOK AT GAME MOVES "+gameData.activeRoom.moves[1]);
      setCommitRot(gameData.activeRoom.moves[1]); // set to true if player 2 has already rotated
      if(!isFullyRendered) setFullyRendered(false); // to load data, hide the room for now

      let map = levels[gameData.activeRoom.level].map;
      let position = gameData.activeRoom.position;
      
      // if the room has changed from last time -> P1 has just moved and P2 needs to update their info
      console.log("initial setup\nlevel = "+gameData.activeRoom.level+"\nroomValue = "+roomValue+"\nposition = "+position+"\nroom value in map = "+map[position[0]][position[1]]);
      if (roomValue != map[position[0]][position[1]]){
        setRoomValue(map[position[0]][position[1]]);
        setDirection(determineDirection(map[position[0]][position[1]]));
        // get direction for all rooms nearby
        let left = position[1]-1 > 0 ? determineDirection(map[position[0]][position[1]-1],false): determineDirection(0);
        let right = position[1]+1 <= 5 ? determineDirection(map[position[0]][position[1]+1],false): determineDirection(0);
        let up = position[0]+1 <= 5 ? determineDirection(map[position[0]+1][position[1]],true) : determineDirection(0);
        setDirectionAll([left, right, up]);
        setCommitRot(false);  // P2 has to rotate this round
      }
      if(!isFullyRendered) setFullyRendered(true);
    }
    
  },[gameData?.activeRoom])

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

  const handleClick = async () => {
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
    console.log(direction[0] && directionAll[2][3]);
    console.log(direction[1] && directionAll[0][2]);
    console.log(direction[2] && directionAll[1][1]);

    // call Player2Move in contract
    try {
      console.log("Player not trapped, calling contract");
      let position = gameData.activeRoom.position;
      let toChange = choice % 4;
      // 0 = no, 1 = left, 2 = back, 3 = right
      if (toChange < 0) toChange=(choice % 4) + 4;
      console.log("GameProgress("+name+", "+position+", "+toChange+")");

      await contract.GameProgress(position, toChange, name, { gasLimit: 500000 });

      setCommitRot(true);
      console.log("LOOK AT GAME MOVES "+gameData.activeRoom.moves);
      playAudio( footstep );

    } catch (error) {
      console.log(error);
      setErrorMessage(error);
    }

    // some way to stop and start wating for both players

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
          ) :  (
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
              <CustomButton title="Confirm rotations" handleClick={handleClick} />
            </div>
          </div>  
          )}
        <GameInfo /> 
      </FadeIn>
    </section>
  );
};

export default Player2Room;