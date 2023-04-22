import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import styles from "../styles";
import {GameOverCanvas, WinCanvas} from "../components/models";
import { CustomButton, FadeIn } from '../components';
import { useGlobalContext } from '../context';

const GameOver = ({type}) => {
  const { setDepth } = useGlobalContext();
  const [isFullyRendered, setFullyRendered] = useState(false);
  const navigate = useNavigate();

  //* fadein animation
  useEffect(()=> {
    if (!isFullyRendered)
      setFullyRendered(true);
  },[])

  return ( 
    <section className={`${styles.flexBetween} ${styles.gameContainer} relative w-full h-screen mx-auto bg-siteblack`}>
       <FadeIn show={isFullyRendered} duration={300}>
          <div style={{width:"75vw", height:"75vh"}}>
            {type == 0 ? <GameOverCanvas /> : <WinCanvas/>}
            <div className={`${styles.flexCenter} flex-col mb-20`}>
              <h3 className={styles.headText}>YOU {type == 0 ? " LOST" : " WON"} </h3>
              <CustomButton
                title="Back to home"
                handleClick={() => {
                  navigate('/create-room', { replace: true });
                  setDepth(0);
                }}
                restStyles="mt-6"
              />
              <CustomButton
                title="Mint this NFT"
                handleClick={() => {}}
                restStyles="mt-6"
              />
            </div>
          </div>
       </FadeIn>
    </section>
  );
};

export default GameOver;
