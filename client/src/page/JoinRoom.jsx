import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalContext } from '../context';
import { CustomInput, CustomButton, PageHOC } from '../components';
import styles from '../styles';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { contract, gameData, roomCode, setRoomCode, walletAddress, setShowAlert, setErrorMessage } = useGlobalContext();

  useEffect(() => {
    if (gameData?.activeRoom?.battleStatus === 1) navigate(`/room/${gameData.activeRoom.name}`);
  }, [gameData]);

  const handleClick = async () => {
    try {
      await contract.joinBattle(roomCode,{gasLimit:200000});
      console.log(gameData);
      setShowAlert({ status: true, type: 'success', message: `Joining ${roomCode}` });
    } catch (error) {
      // console.log(error);
      setErrorMessage(error);
    }
  };

  return (
    <>
      <div className="flex flex-col mb-5">
        <CustomInput
          label="Room Code"
          placeHolder="Enter room code"
          value={roomCode}
          handleValueChange={setRoomCode}
        />

        <CustomButton
          title="Join Room"
          handleClick={handleClick}
          restStyles="mt-6"
        />
      </div>
      <p className={styles.infoText} onClick={() => navigate('/create-room')}>
        Or create a new room
      </p> 
    </>
  );
};

export default PageHOC(
  JoinRoom,
  <>Join <br /> a Room</>,
  <>Play with your friends in an already existing room</>,
);
