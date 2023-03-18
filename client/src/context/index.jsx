import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {ethers} from 'ethers';
import Web3Modal from 'web3modal';
import {useNavigate} from 'react-router-dom';

import { ABI, ADDRESS } from '../contract';
import { createEventListeners } from './createEventListeners';
import {GetParams} from '../utils/Onboard';

const GlobalContext = createContext();
export const GlobalContextProvider = ({children})=> {
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState('');
  const [contract, setContract] = useState('');
  const [showAlert, setShowAlert] = useState({ status: false, type: 'info', message: '' });
  const [roomCode, setRoomCode] = useState('');
  const [gameData, setGameData] = useState({ players: [], pendingRooms: [], activeRoom: null });
  const [updateGameData, setUpdateGameData] = useState(0);
  const [level, setLevel] = useState('bg-astral');
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(1);
   
  const player1Ref = useRef();
  const player2Ref = useRef();

  const navigate = useNavigate();

  //* Set level to local storage
  // TODO: make sure player have chosen level before playing
  useEffect(() => {
    const levelFromLocalStorage = localStorage.getItem('level');

    if (levelFromLocalStorage) {
      setLevel(levelFromLocalStorage);
    } else {
      localStorage.setItem('level', level);
    }
  }, []);

  //* Reset web3 onboarding modal params
  useEffect(() => {
    const resetParams = async () => {
      const currentStep = await GetParams();

      setStep(currentStep.step);
    };

    resetParams();

    window?.ethereum?.on('chainChanged', () => resetParams());
    window?.ethereum?.on('accountsChanged', () => resetParams());
  }, []);

  //* Set the wallet address to the state
  const updateCurrentWalletAddress = async () => {
    const accounts = await window?.ethereum?.request({ method: 'eth_accounts' });

    if (accounts) setWalletAddress(accounts[0]);
    console.log("updating current wallet address: "+accounts);
  };

  useEffect(() => {
    updateCurrentWalletAddress();   // seems to already make a popup- nice
    window?.ethereum?.on('accountsChanged', updateCurrentWalletAddress);
  }, []);

  //* Set the smart contract and provider to the state
  useEffect(() => {
    const setSmartContractAndProvider = async () => {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const newProvider = new ethers.providers.Web3Provider(connection);
        const signer = newProvider.getSigner();
        const newContract = new ethers.Contract(ADDRESS, ABI, signer);

        setProvider(newProvider);
        setContract(newContract);
        console.log("initial provider and contract made and saved");
    };

    const timer = setTimeout(()=> setSmartContractAndProvider(), [1000]);
    return () => clearTimeout(timer);
  }, []);

  //* Activate event listeners for the smart contract
  useEffect(() => {
    if (contract) {
      createEventListeners({
        navigate,contract,provider,
        walletAddress,setShowAlert,
        player1Ref,player2Ref,
        setUpdateGameData,
      });
    }
  }, [contract]);

  //* Set the game data to the state
  useEffect(() => {
    const fetchGameData = async () => {
      if (contract && walletAddress) {
        const fetchedRooms = await contract.getAllBattles();
        const pendingRooms = fetchedRooms.filter((room) => room.battleStatus === 0);
        let activeRoom = null;

        fetchedRooms.forEach((room) => {
          if (room.players.find((player) => player.toLowerCase() === walletAddress.toLowerCase())) {
            if (room.winner.startsWith('0x00')) {
              activeRoom = room;
            }
          }
        });

        setGameData({ pendingRooms: pendingRooms.slice(1), activeRoom });
        setRoomCode(activeRoom.name)
        console.log("activeRoom: "+activeRoom.name+" fetched rooms:")
        console.log(fetchedRooms);
      }
    };

    fetchGameData();
  }, [contract, walletAddress, updateGameData]);

  //* Handle alerts
  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: 'info', message: '' });
      }, [5000]);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  //* Handle error messages
  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage?.reason?.slice('execution reverted: '.length).slice(0, -1);

      if (parsedErrorMessage) {
        setShowAlert({
          status: true,
          type: 'failure',
          message: parsedErrorMessage,
        });
      }
      else {
        setShowAlert({
          status: true,
          type: 'failure',
          message: "Something went wrong! Please make sure you have your wallet connected",
        });
      }
    }
  }, [errorMessage]);


    return(
        <GlobalContext.Provider value={{
          contract, walletAddress,
          showAlert, setShowAlert,
          roomCode, setRoomCode,
          gameData, 
          level, setLevel,
          setErrorMessage,
          player1Ref, player2Ref,
          updateCurrentWalletAddress

        }}>
            {children}

        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext);
