import React, { useState, useContext, useEffect } from "react";
import { Context } from '../../store/appContext.js';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import UserPic from '../../../img/profile-circle-svgrepo-com.png'

import PersonalInfo from './PersonalInfo.jsx';
import styles from './UserProfile.module.css';
import UserPosts from "./UserPosts.jsx";
import ProfileImageUploadEco from "./ProfileImageUpload.jsx";
import CreatePostForm from "./CreatePostForm.jsx";
import EditUserProfileEco from "./EditUserProfile.jsx";

const UserProfile = () => {
    const { store, actions } = useContext(Context);
    const { uploadedUserData } = store;
    const navigate = useNavigate();
    const [showImageUploadModal, setShowImageUploadModal] = useState(false);
    const [showCreatePostForm, setShowCreatePostForm] = useState(false);
    const [editingPost, setEditingPost] = useState(null); // Añadir estado para editar publicaciones

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const verificarAutenticacion = async () => {
            const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
            if (!isAuthenticated) {
                navigate("/");
            } else {
                await actions.loadUserData();
            }
        };
        verificarAutenticacion();
    }, [navigate]);

    const profileImageUrl = uploadedUserData.profile_image_url;

    const handleImageClick = () => {
        setShowImageUploadModal(true);
    };

    const handleCreatePostClick = () => {
        setShowCreatePostForm(true);
        setEditingPost(null); // Asegúrate de que no estamos editando ninguna publicación existente
    };

    const handleCloseCreatePostForm = () => {
        setShowCreatePostForm(false);
    };

    if (!uploadedUserData) {
        return (
            <Container className={styles.userProfile}>
                <Row className={styles.profileHeader}>
                    <Col xs={3} className={styles.profilePicContainer}>
                        <Skeleton height={100} width={100} />
                    </Col>
                    <Col xs={9}>
                        <div className={styles.userInfo}>
                            <Skeleton height={20} width={200} />
                            <Skeleton height={20} width={150} />
                        </div>
                        <div className={styles.profileStats}>
                            <Skeleton height={20} width={100} />

                        </div>
                        <div className={styles.profileActions}>

                            <Skeleton height={20} width={100} />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} className={styles.profileInfo}>
                        <Skeleton height={20} width={200} />
                    </Col>
                </Row>
                <Row className={styles.postsContainer}>
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <Col key={index} xs={12} md={4} className={styles.postCard}>
                            <Skeleton height={200} width={300} />
                        </Col>
                    ))}
                </Row>
            </Container>
        );
    }

    return (
        <Container className={styles.userProfile}>
            <Row className={styles.profileHeader}>
                <Col xs={3} onClick={handleImageClick} className={styles.profilePicContainer}>
                    <Image src={profileImageUrl || UserPic} roundedCircle className={styles.profilePic} />
                </Col>
                <Col xs={9}>
                    <div className={styles.userInfo}>
                        <h2 className={styles.username}>{uploadedUserData.username}</h2>
                        <EditUserProfileEco />
                    </div>
                    <div className={styles.profileStats}>
                        <span><strong>{store.posts.length}</strong> publicaciones</span>
                        {/* <span><strong>3030</strong> seguidores</span>
                        <span><strong>645</strong> seguidos</span> */}
                    </div>
                    <div className={styles.profileActions}>
                        {/* <Button variant="outline-dark" className={styles.followButton}>Siguiendo</Button>
                        <Button variant="outline-dark" className={styles.messageButton}>Mensaje</Button> */}
                        <Button variant="outline-primary" className={styles.newPostButton} onClick={handleCreatePostClick}>
                            <i className="fa fa-plus"></i> Crear Publicación
                        </Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className={styles.profileInfo}>
                    <h3>{uploadedUserData.name}</h3>
                </Col>
            </Row>
            <Row className={styles.postsContainer}>
                <UserPosts setEditingPost={setEditingPost} setShowCreatePostForm={setShowCreatePostForm} />
            </Row>
            <ProfileImageUploadEco show={showImageUploadModal} onHide={() => setShowImageUploadModal(false)} />
            {showCreatePostForm && (
                <CreatePostForm
                    editingPost={editingPost}
                    setEditingPost={setEditingPost}
                    setShowCreatePostForm={setShowCreatePostForm}
                />
            )}
        </Container>
    );
};

export default UserProfile;
