import React, { useEffect, useState } from 'react';
import {Player1Room, Player2Room, Player1w2Room, Loader2, Alert} from '../components';
import { useGlobalContext } from '../context';
import styles from '../styles';

const Room = () => {
  // get the context to access state and functions
  const { 
    walletAddress, 
    contract, 
    gameData, 
    setErrorMessage, 
    showAlert 
  } = useGlobalContext();

  const [isPlayer, setIsPlayer] = useState(0);
  const [currPlayer, setCurrPlayer] = useState(<Player1Room />);

  // fetch player info from contract and set player state
  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        if (gameData.activeRoom.players[0].toLowerCase() === walletAddress.toLowerCase()) {
          setIsPlayer(1);
          if (gameData.activeRoom.players[1].toLowerCase() !== '0x0000000000000000000000000000000000000000') 
            setCurrPlayer(<Player1w2Room />);
        }
        else if (gameData.activeRoom.players[1].toLowerCase() === walletAddress.toLowerCase()) {
          setIsPlayer(2);
          setCurrPlayer(<Player2Room />);
        }
      } catch (error) {
        console.log(error);
        setErrorMessage(error.message);
      }
    };
    if (contract && walletAddress && gameData.activeRoom) getPlayerInfo();
  }, [contract, walletAddress, gameData.activeRoom]);

  return (
    <>
      {showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}
      {isPlayer !== 0
        ? currPlayer
        : <section className={`${styles.flexCenter} ${styles.gameContainer} relative w-full h-screen mx-auto bg-siteblack`}>
            <Loader2/>
            <p className={styles.gameLoadText} >Taking a while? Make sure you're in the right floor</p>
          </section>
      }
    </>
  );
};

export default Room;