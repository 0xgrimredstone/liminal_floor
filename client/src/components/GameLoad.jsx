import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

import CustomButton from './CustomButton';
import { useGlobalContext } from '../context';
import Loader2 from './Loader2';
import styles from '../styles';

const GameLoad = () => {
  /*////////////
  TODO
  - accept multiple people in one room (UI + function)
  - start game manually (button)
  - quit room function
  ///////////*/

  const { walletAddress, gameData, roomCode, setErrorMessage, contract } = useGlobalContext();
  const navigate = useNavigate();
  const [starting, setStart] = useState(false);

  const handleStart = async () => {
    try {
      if (roomCode != undefined) {
        setStart(true);
        await contract.startGame(roomCode,{gasLimit:500000})
      }; 
    } catch (error) {
      setErrorMessage(error);
      console.log(error);
    }
  };

  const handleQuit = async () => {
    try {
      setStart(true);
      await contract.quitGame(roomCode,{gasLimit:500000})
      console.log(gameData);
    } catch (error) {
      setErrorMessage(error);
    }
  }

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

        <div className="mt-10">
          <CustomButton
            title="Start Game"
            handleClick={handleStart}
            restStyles="mx-3"
            />
          <CustomButton
            title="Quit Game"
            handleClick={handleQuit}
            restStyles="mx-3"
            />
        </div>
        {starting && <Loader2/>}
      </div>
    </div>
  );
};

export default GameLoad;
