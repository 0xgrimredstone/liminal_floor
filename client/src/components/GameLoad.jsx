import React from 'react';
import { useNavigate } from 'react-router-dom';

import CustomButton from './CustomButton';
import { useGlobalContext } from '../context';
import { player01, player02 } from '../assets';
import styles from '../styles';

const GameLoad = () => {
  /*////////////
  TODO
  - accept multiple people in one room (UI + function)
  - start game manually (button)
  - quit room function
  ///////////*/

  const { walletAddress, gameData, roomCode } = useGlobalContext();
  const navigate = useNavigate();

  return (
    <div className={`${styles.flexBetween} ${styles.gameLoadContainer}`}>
      <div className={styles.gameLoadBtnBox}>
        <CustomButton
          title="Choose Level"
          handleClick={() => navigate('/battleground')}
          restStyles="mt-6"
        />
      </div>

      <div className={`flex-1 ${styles.flexCenter} flex-col`}>
        <p className={styles.gameLoadText}>
          Room Code:
        </p>
        <h1 className={`${styles.headText} text-center`}>
          {roomCode}
        </h1>
        <p className={styles.gameLoadText}>
          Protip: while you're waiting, choose your preferred level
        </p>

        <div className={styles.gameLoadPlayersBox}>
          <div className={`${styles.flexCenter} flex-col`}>
            <img src={player01} className={styles.gameLoadPlayerImg} />
            <p className={styles.gameLoadPlayerText}>
              {walletAddress.slice(0, 10)}...
            </p>
          </div>
          <div className={`${styles.flexCenter} ml-10 flex-col`}>
            <img src={player02} className={styles.gameLoadPlayerImg} />
            <p className={styles.gameLoadPlayerText}>...</p>
          </div>
        </div>

        <div className="mt-10">
          <CustomButton
            title="Start Game"
            handleClick={() => navigate(`/room/${roomCode}`)}
            restStyles="mx-3"
          />
          <CustomButton
            title="Quit Game"
            handleClick={() => {//do something
            }}
            restStyles="mx-3"
          />
        </div>

        <div className="mt-10">
          <p className={`${styles.infoText} text-center mb-5`}>OR</p>

          <CustomButton
            title="Join other rooms"
            handleClick={() => navigate('/join-room')}
            restStyles="mx-3"
          />
        </div>
      </div>
    </div>
  );
};

export default GameLoad;
