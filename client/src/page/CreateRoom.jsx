import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalContext } from '../context';
import { CustomButton, PageHOC, GameLoad } from '../components';
import styles from '../styles';
import { levels } from '../assets/levels';

const CreateRoom = () => {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const { contract, setRoomCode, gameData, setErrorMessage, level } = useGlobalContext();
  const navigate = useNavigate();
  const [waitRoom, setWaitRoom] = useState(false);

  //* Generate random strings as room code
  function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  useEffect(() => {
    console.log("gameData update found in create room");
    console.log(gameData);
    if (gameData?.activeRoom?.GameStatus === 1) {
      navigate(`/room/${gameData.activeRoom.code}`);
    }
    else if (gameData?.activeRoom?.GameStatus === 0) {
      setWaitRoom(true);
    }
  }, [gameData]);

  // click "Choose a Floor" -> go to /floors
  const handleClick = async () => {
    navigate('/floors');
  };

  // once level is chosen, create a room
  useEffect(()=> {
    if (level != 0) {
      console.log("level changed to "+level);
  
      const createGame = async () => {
        var temp_code = generateString(6);
        setRoomCode(temp_code);
        console.log("created room "+temp_code);
        try {
          await contract.createGame(temp_code,level,levels[level].start,{gasLimit:500000});
          console.log("done?");
          setWaitRoom(true);
          console.log(gameData);
          const fetchedRooms = await contract.getAllGames();
          console.log(fetchedRooms);
    
        } catch (error) {
          setErrorMessage(error);
        }
      }
      createGame();
    }
  }, [level])

  return (
    <>
      {waitRoom && <GameLoad/>}

      <div className="flex flex-col mb-5">

        <CustomButton
          title="Choose a Floor"
          handleClick={handleClick}
        />
      </div>
        <p className={styles.infoText} onClick={() => navigate('/join-room')}>
        Or join a room
      </p> 
    </>
  );
};

export default 
PageHOC(
  CreateRoom,
  <>Step into <br/>the unknown</>, 
  <></>
);