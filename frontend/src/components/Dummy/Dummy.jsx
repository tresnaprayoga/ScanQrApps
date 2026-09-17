import React from 'react';
import styles from './Dummy.module.css';

const Dummy = ({ title }) => {
  return (
    <div className={styles.dummyContainer}>
      <h3 className={styles.dummyTitle}>{title || 'Dummy Component'}</h3>
      <p>This is a dummy component testing CSS Modules.</p>
    </div>
  );
};

export default Dummy;
