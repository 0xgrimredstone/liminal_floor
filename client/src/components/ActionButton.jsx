import styles from '../styles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ActionButton = ({ imgUrl, text, handleClick, restStyles }) => (
  <div
    className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${restStyles} `}
    onClick={handleClick}
  >
    <FontAwesomeIcon icon={imgUrl} className={`text-white`}/>
  </div>
);

export default ActionButton;
