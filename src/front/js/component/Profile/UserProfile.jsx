import React, { useState, useContext, useEffect } from "react";
import { Context } from '../../store/appContext.js';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Image, Button } from 'react-bootstrap';

import PersonalInfo from './PersonalInfo.jsx';
import styles from './UserProfile.module.css';
import UserPosts from "./UserPosts.jsx";
import ProfileImageUploadEco from "./ProfileImageUpload.jsx";
import CreatePostForm from "./CreatePostForm.jsx";

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
        const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
        if (!isAuthenticated) {
            navigate("/");
        }
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

    return (
        <Container className={styles.userProfile}>
            <Row className={styles.profileHeader}>
                <Col xs={3} onClick={handleImageClick} className={styles.profilePicContainer}>
                    <Image src={profileImageUrl || "default-profile-pic-url"} roundedCircle className={styles.profilePic} />
                </Col>
                <Col xs={9}>
                    <h2 className={styles.username}>{uploadedUserData.username}</h2>
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
