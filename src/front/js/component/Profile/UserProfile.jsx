import React, { useState, useContext, useEffect } from "react";
import { Context } from '../../store/appContext.js';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from 'react-bootstrap';

import profilePic from '../../../img/profile-circle-svgrepo-gray-com.png';


import PersonalInfo from './PersonalInfo.jsx';
import styles from './UserProfile.module.css';

const UserProfile = () => {
    const { store, actions } = useContext(Context); // Usar useContext para acceder al contexto global
    const { uploadedUserData } = store; // Suponiendo que user contiene el objeto del usuario

    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
        if (!isAuthenticated) {
            navigate("/");
        }
    }, [navigate]);

    const profileImageUrl = store.uploadedUserData.profile_image_url;


    return (
        <>

            <Container className={styles.userProfile}>
                <div className={styles.profileContainer}>
                    <h1><strong>{uploadedUserData.name}</strong></h1>

                    {profileImageUrl ? (
                        <>
                            <img
                                src={profileImageUrl}
                                alt="Photo Profile"
                                className={styles.logo}
                            />

                        </>
                    ) : (
                        <>
                            <img
                                src={profilePic}
                                alt="Photo Profile"
                                className={styles.logo}
                                title='add your Photo'

                            />
                        </>
                    )}
                </div>

                <Row>
                    <Col md={6}>
                        <Card className={styles.card}>
                            <Card.Header>Información Personal</Card.Header>
                            <Card.Body>
                                <PersonalInfo />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>

        </>
    );
};

export default UserProfile;
