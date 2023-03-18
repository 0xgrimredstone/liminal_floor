import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles';
import { useGlobalContext } from '../context';
import { CustomButton, PageHOC, GameLoad } from '../components';

const CreateRoom = () => {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const { contract, setRoomCode, gameData, setErrorMessage } = useGlobalContext();
  const [waitRoom, setWaitRoom] = useState(false);
  const navigate = useNavigate();

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
    // console.log("gameData update found in create room");
    // console.log(gameData?.activeRoom);
    if (gameData?.activeRoom?.battleStatus === 1) {
      navigate(`/room/${gameData.activeRoom.name}`);
    } else if (gameData?.activeRoom?.battleStatus === 0) {
      // console.log("setting gameload to true");
      setWaitRoom(true);
    }
  }, [gameData]);

  const handleClick = async () => {
    var temp_code = generateString(6);
    setRoomCode(temp_code);
    console.log("created room "+temp_code);
    
    try {
      await contract.createBattle(temp_code,{gasLimit:200000});

      setWaitRoom(true);
    } catch (error) {
      // console.log(error);
      setErrorMessage(error);
    }
  };

  return (
    <>
      {waitRoom && <GameLoad />}

      <div className="flex flex-col mb-5">

        <CustomButton
          title="Generate Room Code"
          handleClick={handleClick}
        />
      </div>
      <p className={styles.infoText} onClick={() => navigate('/join-room')}>
        Or join already existing rooms
      </p>
    </>
  );
};

export default 
PageHOC(
  CreateRoom,
  <>Start playing<br/> with friends</>, 
  <>Create your own room and share the room code with your friends</>
);