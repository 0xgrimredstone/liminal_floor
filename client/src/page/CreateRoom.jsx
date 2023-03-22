import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalContext } from '../context';
import { CustomButton, PageHOC, GameLoad } from '../components';

const CreateRoom = () => {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const { contract, setRoomCode, gameData, setErrorMessage } = useGlobalContext();
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
    console.log(gameData?.activeRoom);
    if (gameData?.activeRoom?.GameStatus === 1) {
      navigate(`/room/${gameData.activeRoom.name}`);
    }
    else if (gameData?.activeRoom?.GameStatus === 0) {
      setWaitRoom(true);
    }
  }, [gameData]);

  const handleClick = async () => {
    var temp_code = generateString(6);
    setRoomCode(temp_code);
    console.log("created room "+temp_code);
    
    try {
      await contract.createGame(temp_code,{gasLimit:500000});
      console.log("done?");
      setWaitRoom(true);
      console.log(gameData);
      const fetchedRooms = await contract.getAllGames();
      console.log(fetchedRooms);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    <>
      {waitRoom && <GameLoad/>}

      <div className="flex flex-col mb-5">

        <CustomButton
          title="Choose a Level"
          handleClick={handleClick}
        />
      </div>
    </>
  );
};

export default 
PageHOC(
  CreateRoom,
  <>Start<br/>a level</>, 
  <>Step into the unknown</>
);