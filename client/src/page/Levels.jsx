import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles';
import { Alert } from '../components';
import { levels } from '../assets/levels';
import { useGlobalContext } from '../context';

const Levels = () => {
  const navigate = useNavigate();
  const { setLevel, setShowAlert, showAlert } = useGlobalContext();

  const handleLevelChoice = (level) => {
    setLevel(level.id);

    setShowAlert({ status: true, type: 'info', message: `Level ${level.id} is ready!` });

    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  return (
    <div className={`${styles.flexCenter} ${styles.levelsContainer}`}>
      {showAlert.status && <Alert type={showAlert.type} message={showAlert.message} />}

      <h1 className={`${styles.headText} text-center`}>
        Choose your
        <span className="text-siteViolet"> Floor </span>
      </h1>

      <div className={`${styles.flexCenter} ${styles.levelsWrapper}`}>
        {levels.map((level) => (
          level.id === 0 ? null : (
            <div
              key={`floorSelect_${level.id}`}
              className={`${styles.flexCenter} ${styles.levelsCard}`}
              onClick={() => handleLevelChoice(level)}
            >
              <p className={styles.levelsCardText}>{level.id}<br/>{level.difficulty}</p>
            </div>
        )))}
      </div>
    </div>
  );
};

export default Levels;
