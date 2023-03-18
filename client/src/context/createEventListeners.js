import { ethers } from 'ethers';

import { ABI } from '../contract';
import { playAudio, sparcle } from '../utils/animation.js';
import { defenseSound } from '../assets';

const AddNewEvent = ( eventFilter, provider, cb ) => {
  provider.removeListener( eventFilter );

  provider.on( eventFilter, ( logs ) => {
    const parsedLog = ( new ethers.utils.Interface( ABI ) ).parseLog( logs );

    cb( parsedLog );
  } );
};

//* Get battle card coordinates
const getCoords = ( cardRef ) => {
  const { left, top, width, height } = cardRef.current.getBoundingClientRect();

  return {
    pageX: left + width / 2,
    pageY: top + height / 2.25,
  };
};

const emptyAccount = '0x0000000000000000000000000000000000000000';

export const createEventListeners = (
  { navigate, contract, provider, walletAddress, setShowAlert, player1Ref, player2Ref, setUpdateGameData }
) => {
  const NewPlayerEventFilter = contract.filters.NewPlayer();
  AddNewEvent( NewPlayerEventFilter, provider, ( { args } ) => {
    console.log( 'New player created!', args );

    if ( walletAddress === args.owner ) {
      setShowAlert( {
        status: true,
        type: 'success',
        message: 'Player has been successfully registered',
      } );
    }
  } );

  const NewRoomEventFilter = contract.filters.NewBattle();
  AddNewEvent( NewRoomEventFilter, provider, ( { args } ) => {
    console.log( 'New Level started!', args, walletAddress );

    if ( walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() === args.player2.toLowerCase() ) {
      navigate( `/room/${args.name}` );
    }

    setUpdateGameData( ( prevUpdateGameData ) => prevUpdateGameData + 1 );
  } );

  const NewGameTokenEventFilter = contract.filters.NewGameToken();
  AddNewEvent( NewGameTokenEventFilter, provider, ( { args } ) => {
    console.log( 'New game token created!', args.owner );

    if ( walletAddress.toLowerCase() === args.owner.toLowerCase() ) {
      setShowAlert( {
        status: true,
        type: 'success',
        message: 'Player game token has been successfully generated',
      } );

      navigate( '/create-room' );
    }
  } );

  const MoveEventFilter = contract.filters.BattleMove();
  AddNewEvent( MoveEventFilter, provider, ( { args } ) => {
    console.log( 'Move initiated!', args );
  } );

  const RoundEndedEventFilter = contract.filters.RoundEnded();
  AddNewEvent( RoundEndedEventFilter, provider, ( { args } ) => {
    console.log( 'Round ended!', args, walletAddress );

    for ( let i = 0; i < args.damagedPlayers.length; i += 1 ) {
      if ( args.damagedPlayers[i] !== emptyAccount ) {
        if ( args.damagedPlayers[i] === walletAddress ) {
          sparcle( getCoords( player1Ref ) );
        } else if ( args.damagedPlayers[i] !== walletAddress ) {
          sparcle( getCoords( player2Ref ) );
        }
      } else {
        playAudio( defenseSound );
      }
    }

    setUpdateGameData( ( prevUpdateGameData ) => prevUpdateGameData + 1 );
  } );

  // Battle Ended event listener
  const BattleEndedEventFilter = contract.filters.BattleEnded();
  AddNewEvent( BattleEndedEventFilter, provider, ( { args } ) => {
    if ( walletAddress.toLowerCase() === args.winner.toLowerCase() ) {
      setShowAlert( { status: true, type: 'success', message: 'You won!' } );
    } else if ( walletAddress.toLowerCase() === args.loser.toLowerCase() ) {
      setShowAlert( { status: true, type: 'failure', message: 'You lost!' } );
    }

    setTimeout( () => navigate( '/create-room' ), 3000 )
  } );
};
