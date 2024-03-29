import ReactTooltip from 'react-tooltip';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from "../styles";
import HotelCanvas from "../components/models/Hotel";
import { useGlobalContext } from '../context';
import { playAudio } from '../utils/animation.js';



import { ActionButton, Alert, GameInfo, FadeIn } from '../components';
import { footstep, player01 as player01Icon } from '../assets';
import { faChevronRight, faChevronLeft, faChevronUp } from '@fortawesome/free-solid-svg-icons'


const Room = () => {
  const { contract, gameData, walletAddress, showAlert, setShowAlert, level, setErrorMessage, playerRef, } = useGlobalContext();
  const [player, setPlayer] = useState({}); 
  const [isFullyRendered, setFullyRendered] = useState(true);
  const [buttonStyles, setButtonStyles] = useState(["mx-10 mt-10 bg-white dark:bg-white", "mr-10 bg-white dark:bg-white", "ml-10 bg-white dark:bg-white"]);
  const [buttonAvailable, setButtonAvailable] = useState([false, false, false]);
  const [depth, setDepth] = useState(-1); 
  const { name } = useParams();//battle/Name
  const [cameraPos, setCameraPos] = useState(0);

  const refreshButtonStyles = () => {
    let t = ["mx-10 mt-10 bg-white dark:bg-white", "mr-10 bg-white dark:bg-white", "ml-10 bg-white dark:bg-white"];
    let y = [false, false, false];
    let c = gameData.activeRoom.currentCoord;

    if (c[0] + 1 <= 5){
      if(gameData.activeRoom.gameMap[c[0]+1][c[1]] != 0) {
        t[0] = "mx-10 mt-10 hover:border-[#7c4353]";
        y[0] = true;
      }
    }
    if (c[1] + 1 <= 5){
      if(gameData.activeRoom.gameMap[c[0]][c[1]+1] != 0) {
        t[1] = "mr-10 hover:border-[#7c4353]";
        y[1] = true;
      }
    }
    if (c[1] - 1 >= 0){
      if(gameData.activeRoom.gameMap[c[0]][c[1]-1] != 0) {
        t[2] = "ml-10 hover:border-[#7c4353]";
        y[2] = true;
      }
    }
    setButtonStyles(t);
    setButtonAvailable(y);
  }

  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        // save players locally
        let player01Address = null;

        if (gameData.activeRoom.player.toLowerCase() === walletAddress.toLowerCase()) {
          player01Address = gameData.activeRoom.player;
        }

        // fetch player data
        const p1TokenData = await contract.getPlayerToken(player01Address);
        const player01 = await contract.getPlayer(player01Address);

        // set state
        setPlayer({ ...player01, Token: p1TokenData });
        console.log(player);
        refreshButtonStyles();
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (contract && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData, name]);
  
  const makeAMove = async (choice) => {
    if(!buttonAvailable[choice-1]) {
      console.log("unavailable");
      return;
    }
    try {
      console.log(gameData.activeRoom);
      await contract.GameProgress(choice, name, { gasLimit: 500000 });
      if(isFullyRendered) setFullyRendered(false);
      playAudio( footstep, false ).play();
      
      setShowAlert({
        status: true,
        type: 'info',
        message: `Going ${choice === 1 ? 'forward' : choice === 2 ? 'left' : 'right'}`,
      });
      refreshButtonStyles();
      setCameraPos(choice);
    } catch (error) {
      // console.log(error);
      setErrorMessage(error);
    }
  }

  useEffect(() => {
    if (gameData?.activeRoom?.depth != depth) {
      setCameraPos(0);
      setDepth(gameData?.activeRoom?.depth);
      console.log(gameData?.activeRoom?.depth, depth);
      if(!isFullyRendered) setFullyRendered(true);
    }
  },[gameData?.activeRoom?.depth])

  return (
    <section className={`${styles.flexBetween} ${styles.gameContainer} relative w-full h-screen mx-auto bg-siteblack`}>
      <FadeIn show={isFullyRendered}>
        <HotelCanvas ready={isFullyRendered} choice={cameraPos}/>
        <div className={`${styles.flexCenter} flex-col mb-20`}>
        <div className="flex items-center flex-row">
        <ActionButton
            imgUrl={faChevronUp}
            handleClick={() => makeAMove(1)}
            restStyles={buttonStyles[0]}
          />
        </div>
        <div className="flex items-center flex-row">
          <ActionButton
            imgUrl={faChevronLeft}
            handleClick={() => makeAMove(2)}
            restStyles={buttonStyles[1]}
          />
          
          <ActionButton
            imgUrl={faChevronRight}
            handleClick={() => makeAMove(3)}
            restStyles={buttonStyles[2]}
          />
        </div>
        <div>
          <div
            data-for={`Depth`}
            data-tip="How far in you are"
            className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${styles.playerMana} cursor-default`}
          >
            {gameData?.activeRoom?.depth}
          </div>
        </div>
        </div>
        <GameInfo /> 
        <ReactTooltip id={`Depth`} effect="solid" backgroundColor="#7c4353" />
      </FadeIn>
    </section>
  );
};

export default Room;