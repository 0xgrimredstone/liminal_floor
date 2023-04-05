import React from 'react';
import {PageHOC} from '../components';
import {useGlobalContext} from '../context';
import styles from '../styles';

const DevNotes = () => {
  const {} = useGlobalContext();
  
  return (
    <div>
        <h3 className={styles.joinHeadText}>What's Liminal Floor?</h3>
        <p className={styles.normalText}>Liminal Floor started out as a <a href="https://opensea.io/collection/liminal-floor" styles={styles.infoText}>puzzle collection</a> investigating how fear can be created in under 64 voxels <br/>Realising that the NFT gaming space still has much to develop, I decided to develop the collection into an immersive experience to further investigate how to play with fear</p>
        <br/>
        <h3 className={styles.joinHeadText}>How to play?</h3>
        <p className={styles.normalText}>1. Register your wallet as a player<br/>2. Select a level<br/>3. If you're bringing friends, share the room code with them<br/>4. Find your way out</p>

    </div>
  )
};

export default 
PageHOC(
  DevNotes,
  <>Developer's Notes</>,
  <>
    <p className={styles.normalText}>Thank you so much for trying this little passion project out!</p>

    <a className={styles.infoText} href="https://twitter.com/0xgrimredstone">Made with 💛 by 0xgrimredstone</a>
    <br/>
    <a className={styles.infoText} href="https://www.youtube.com/watch?v=C9ctoK4M9Bk">This project was made with the help of JS Mastery</a>
    <br/>
    <a className={styles.infoText} href="https://www.youtube.com/watch?v=Dn_lRGgTu5k">Background music by CO.AG Music</a>
    
  </>
);