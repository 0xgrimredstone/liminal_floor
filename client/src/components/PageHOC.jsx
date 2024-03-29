import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';


import Alert from './Alert';
import { useGlobalContext } from '../context';
import { logo, launchImg } from '../assets';
import styles from '../styles';

const PageHOC = (Component, title, desc) => () => {
  const { showAlert } = useGlobalContext();
  const navigate = useNavigate();

  return (
      <div className={styles.hocContainer}>
      {showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}
        <div className={styles.hocContentBox}>
            <img src={logo} alt="logo" className={styles.hocLogo} onClick={() => navigate('/')} />
            <div className={styles.hocBodyWrapper}>
                <div className="flex flex-row w-full">
                    <h1 className={`flex ${styles.headText} head-text`}>{title}</h1>
                </div>
                <p className={`${styles.normalText} my-10`}>{desc}</p>
                <Component/>
            </div>
            <p className={styles.footerText}>ver 1.0.1 | <a className={styles.infoText} onClick={()=> navigate('/dev')}>Developer's Notes</a></p>
        </div>
    </div>
  );
};

export default PageHOC;