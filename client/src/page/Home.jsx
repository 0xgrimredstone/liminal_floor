import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import {PageHOC, CustomInput, CustomButton} from '../components';
import {useGlobalContext} from '../context';

const Home = () => {
  const {contract, walletAddress, setShowAlert, gameData, setErrorMessage} = useGlobalContext();
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState('');

  const handleClick = async () => {
    try {
      console.log({contract});
      const playerExists = await contract.isPlayer(walletAddress);
      // if player already made a name
      if (!playerExists) {
        await contract.registerPlayer(playerName, playerName, { gasLimit: 500000 });

        setShowAlert({
          status: true,
          type: 'info',
          message: `${playerName} is being summoned!`,
        });

        setTimeout(() => navigate('/create-room'), 8000);
      }
    } catch (error) {
      setErrorMessage(error);
    }
  };
  
  useEffect(() => {
    const checkForPlayerToken = async () => {
      const playerExists = await contract.isPlayer(walletAddress);
      const playerTokenExists = await contract.isPlayerToken(walletAddress);

      console.log({playerExists, playerTokenExists});

      if (playerExists && playerTokenExists) navigate('/create-room');
    };
    if (contract && walletAddress) checkForPlayerToken();
  }, [contract, walletAddress]);

  useEffect(() => {
    if (gameData.activeRoom) {
      navigate(`/room/${gameData.activeRoom.name}`);
    }
  }, [gameData]);

  return (
    <div className="flex flex-col">
      <CustomInput
        label="Name"
        placeHolder="Enter your player name"
        value={playerName}
        handleValueChange={setPlayerName}
      />

      <CustomButton
        title="Register"
        handleClick={handleClick}
        restStyles="mt-6"
      />    
    </div>
  )
};

export default 
PageHOC(
  Home,
  <>Liminal Floor <br/> a Puzzle Horror Game</>,
  <>Connect your wallet <br/> and step into the unknown.</>
);