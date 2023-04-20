import React, { useState, useEffect } from 'react'
import { bgm } from '../assets';
import styles from '../styles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons'
import Sound from 'react-sound';
import ReactTooltip from 'react-tooltip';

const AudioButton = ({depth}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(70);

    useEffect (() => { 
      switch (depth) {
        case 0:
          setVolume(70);
          break;
        case 1:
          setVolume(70);
          break;
        case 2:
          setVolume(55);
          break;
        case 3:
          setVolume(30);
          break;
        default:
          setVolume(20);
          break;
      }
      console.log("volumeChange: "+volume+" with depth: "+depth);
    }, [depth]);

    const handleClick = () => {
      console.log("volume to play: "+volume);
      setIsPlaying(!isPlaying);
    }
  return (
    <>
      <div
        className={`${styles.gameInfoIcon} ${styles.flexCenter} ${styles.gameAudioBox} mb-5`}
        onClick={handleClick}
        data-for="Music"
        data-tip="Enable background music for a better experience"
      >
        <Sound
          url={bgm}
          playStatus={isPlaying ? Sound.status.PLAYING : Sound.status.PAUSED}
          autoLoad={true}
          loop={true}
          volume={volume}
        />
        <FontAwesomeIcon icon={isPlaying ? faVolumeUp : faVolumeMute} className={`text-white`}/>
    </div>
    <ReactTooltip id="Music" effect="solid" backgroundColor="#7c4353" />
    </>
  )
}

export default AudioButton