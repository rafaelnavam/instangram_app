import React, { useContext, useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Context } from '../../store/appContext';
import styles from './PersonalInfo.module.css';

import EditUserProfile from './EditUserProfile.jsx';
import ProfileImageUpload from './ProfileImageUpload.jsx';

const PersonalInfo = () => {
    const { store, actions } = useContext(Context); // Usar useContext para acceder al contexto global
    const { uploadedUserData } = store; // Suponiendo que user contiene el objeto del usuario

    // Verificar si user contiene datos
    if (!uploadedUserData) {
        return <div className={styles.loading}>Cargando datos del usuario...</div>;
    }

    const FormattedDate = ({ dateTime }) => {
        return <span>{moment(dateTime).format('LL')}</span>;
    };

    useEffect(() => {
        actions.loadUserData(); // Carga los datos del usuario al montar el componente
    }, []);

    // Renderizar los detalles del usuario
    return (
        <>
            <div className={styles.userDetailsContainer}>
                <div className={styles.userDetailsCard}>
                    <div className={styles.headerContainer}>
                        <h2>Detalles del Usuario</h2>
                        <div className={styles.headerActions}>
                            <EditUserProfile />
                            <ProfileImageUpload />
                        </div>
                    </div>
                    <p><strong>Usuario:</strong> {uploadedUserData.username}</p>
                    <p><strong>Email:</strong> {uploadedUserData.email}</p>
                    <p><strong>Nombre:</strong> {uploadedUserData.name} {uploadedUserData.last_name}</p>
                    <p><strong>Teléfono:</strong> {uploadedUserData.phone}</p>
                </div>
            </div>
        </>
    );
};

export default PersonalInfo;
