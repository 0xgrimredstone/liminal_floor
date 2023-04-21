import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CustomButton from './CustomButton';
import { useGlobalContext } from '../context';
import { alertIcon, gameRules, gameRules1, gameRules2 } from '../assets';
import styles from '../styles';

const GameInfo = ({gameInfo, isInitial}) => {
  const { contract, gameData, setShowAlert, setErrorMessage } = useGlobalContext();
  const [toggleSidebar, setToggleSidebar] = useState(isInitial);
  const navigate = useNavigate();

  const handleGameExit = async () => {
    const roomCode = gameData.activeRoom.code;
    console.log(roomCode);

    try {
      await contract.quitGame(roomCode,{gasLimit:500000});

      setShowAlert({ status: true, type: 'info', message: `You're quitting the room ${roomCode}` });
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    <>
      <div className={styles.gameInfoIconBox}>
        <div
          className={`${styles.gameInfoIcon} ${styles.flexCenter}`}
          onClick={() => setToggleSidebar(true)}
        >
          <img
            src={alertIcon}
            alt="info"
            className={styles.gameInfoIconImg}
          />
        </div>
      </div>

      <div className={`${styles.gameInfoSidebar} ${toggleSidebar ? 'translate-x-0' : 'translate-x-full'} ${styles.glassEffect} ${styles.flexBetween} backdrop-blur-3xl`}>
        <div className="flex flex-col">
          <div className={styles.gameInfoSidebarCloseBox}>
            <div
              className={`${styles.flexCenter} ${styles.gameInfoSidebarClose}`}
              onClick={() => setToggleSidebar(false)}
            >
              X
            </div>
          </div>

          <h3 className={styles.gameInfoHeading}>Game Rules:</h3>

          <div className="mt-3">
            {gameInfo == 0 ? (
              gameRules.map((rule, index) => (
                <p key={`game-rule-${index}`} className={styles.gameInfoText}>
                  <span className="font-bold">{index + 1}</span>. {rule}
                </p>
              ))
            ) : gameInfo == 1 ? (
              gameRules1.map((rule, index) => (
                <p key={`game-rule-${index}`} className={styles.gameInfoText}>
                  <span className="font-bold">{index + 1}</span>. {rule}
                </p>
              ))
            ) : (
              gameRules2.map((rule, index) => (
                <p key={`game-rule-${index}`} className={styles.gameInfoText}>
                  <span className="font-bold">{index + 1}</span>. {rule}
                </p>
              ))
            )}
          </div>
        </div>

        <div className={`${styles.flexBetween} mt-10 gap-4 w-full`}>
          <CustomButton title="Exit Level" handleClick={() => handleGameExit()} />
        </div>
      </div>
    </>
  );
};

export default GameInfo;
