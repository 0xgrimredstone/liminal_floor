import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles';
import { Alert } from '../components';
import { battlegrounds } from '../assets';
import { useGlobalContext } from '../context';

const Levels = () => {
  const navigate = useNavigate();
  const { setLevel, setShowAlert, showAlert } = useGlobalContext();

  const handleLevelChoice = (level) => {
    setLevel(level.id);

    localStorage.setItem('level', level.id);

    setShowAlert({ status: true, type: 'info', message: `${level.name} is battle ready!` });

    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  return (
    <div className={`${styles.flexCenter} ${styles.levelsContainer}`}>
      {showAlert.status && <Alert type={showAlert.type} message={showAlert.message} />}

      <h1 className={`${styles.headText} text-center`}>
        Choose your
        <span className="text-siteViolet"> Level </span>
      </h1>

      <div className={`${styles.flexCenter} ${styles.levelsWrapper}`}>
        {battlegrounds.map((level) => (
          <div
            key={level.id}
            className={`${styles.flexCenter} ${styles.levelsCard}`}
            onClick={() => handleLevelChoice(level)}
          >
            <img src={level.image} alt="saiman" className={styles.levelsCardImg} />

            <div className="info absolute">
              <p className={styles.levelsCardText}>{level.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Levels;
