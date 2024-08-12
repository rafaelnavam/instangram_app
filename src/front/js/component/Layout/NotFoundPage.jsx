import React from 'react';
import notFoundErrorAlert from './../../../img/not-found-error-alert-svgrepo-com.png';
import styles from "./NotFoundPage.module.css";

const NotFound = () => {
    return (
        <div className={styles.notFoundContainer}>
            <div className={styles.notFoundContent}>
                <img src={notFoundErrorAlert} alt="Not Found Error Alert" />
                <h1 className={styles.notFoundTitle}>Página no encontrada</h1>
                <p className={styles.notFoundMessage}>
                    Lo sentimos, la página que estás buscando no existe. Intente buscar algo más o regrese a la página de inicio.                </p>
            </div>
        </div>
    );
};

export default NotFound;