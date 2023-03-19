import ReactTooltip from 'react-tooltip';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import styles from "../styles";
import HotelCanvas from "../components/models/Hotel";
import { useGlobalContext } from '../context';
import { playAudio } from '../utils/animation.js';


import { ActionButton, Alert, GameInfo } from '../components';
import { attack, attackSound, defense, defenseSound, player01 as player01Icon } from '../assets';
import { faChevronRight, faChevronLeft, faChevronUp } from '@fortawesome/free-solid-svg-icons'


const Test = () => {
  const { contract, gameData, walletAddress, showAlert, setShowAlert, level, setErrorMessage, playerRef, } = useGlobalContext();
  const [player, setPlayer] = useState({}); 
  const { name } = useParams();//battle/Name
  const navigate = useNavigate();

  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        // save players locally
        let player01Address = null;
        let player02Address = null;

        if (gameData.activeRoom.players[0].toLowerCase() === walletAddress.toLowerCase()) {
          player01Address = gameData.activeRoom.players[0];
          player02Address = gameData.activeRoom.players[1];
        } else {
          player01Address = gameData.activeRoom.players[1];
          player02Address = gameData.activeRoom.players[0];
        }

        // fetch player data
        const p1TokenData = await contract.getPlayerToken(player01Address);
        const player01 = await contract.getPlayer(player01Address);
        const player02 = await contract.getPlayer(player02Address);

        // specify each element
        const p1Att = p1TokenData.attackStrength.toNumber();
        const p1Def = p1TokenData.defenseStrength.toNumber();
        const p1H = player01.playerHealth.toNumber();
        const p1M = player01.playerMana.toNumber();
        const p2H = player02.playerHealth.toNumber();
        const p2M = player02.playerMana.toNumber();

        // set state
        setplayer({ ...player01, att: p1Att, def: p1Def, health: p1H, mana: p1M });
        setPlayer2({ ...player02, att: '?', def: '?', health: p2H, mana: p2M });
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (contract && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData, name]);

  const makeAMove = async (choice) => {
    playAudio(choice === 1 ? attackSound : defenseSound);
    try {
      console.log(gameData.activeRoom);
      await contract.GameProgress(choice, name, { gasLimit: 200000 });
  
      setShowAlert({
        status: true,
        type: 'info',
        message: `Going ${choice === 1 ? 'forward' : choice === 2 ? 'left' : 'right'}`,
      });
    } catch (error) {
      // console.log(error);
      setErrorMessage(error);
    }
  }
  return (
    <section className={`${styles.flexBetween} ${styles.gameContainer} relative w-full h-screen mx-auto bg-black`}>
      <HotelCanvas />
      <div className={`${styles.flexCenter} flex-col mb-20`}>
      <div className="flex items-center flex-row">
      <ActionButton
          imgUrl={faChevronUp}
          handleClick={() => makeAMove(1)}
          restStyles="mx-2 hover:border-red-400"
        />
      </div>
      <div className="flex items-center flex-row">
        <ActionButton
          imgUrl={faChevronLeft}
          handleClick={() => makeAMove(2)}
          restStyles="mr-10 hover:border-red-400"
        />
         
        <ActionButton
          imgUrl={faChevronRight}
          handleClick={() => makeAMove(3)}
          restStyles="ml-10 hover:border-red-400"
        />
      </div>
      <div>
        <div
          data-for={`Depth`}
          data-tip="Depth"
          className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${styles.playerMana} cursor-default`}
        >
          {player.mana || 0}
        </div>
      </div>
      </div>
      <GameInfo /> 
      <ReactTooltip id={`Depth`} effect="solid" backgroundColor="#9E1B47" />
    </section>
  );
};

export default Test;
