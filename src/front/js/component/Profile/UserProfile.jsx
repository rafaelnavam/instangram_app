import React, { useState, useContext, useEffect } from "react";
// Importa React junto con los hooks useState, useContext y useEffect para gestionar el estado y los efectos secundarios.

import { Context } from '../../store/appContext.js';
// Importa el contexto global de la aplicación.

import { useNavigate } from "react-router-dom";
// Importa el hook useNavigate de react-router-dom para la navegación.

import { Container, Row, Col, Image, Button } from 'react-bootstrap';
// Importa componentes de React Bootstrap para construir la interfaz de usuario: Container, Row, Col, Image, Button.

import Skeleton from 'react-loading-skeleton';
// Importa el componente Skeleton para mostrar un efecto de carga.

import 'react-loading-skeleton/dist/skeleton.css';
// Importa los estilos CSS de Skeleton.

import UserPic from '../../../img/profile-circle-svgrepo-com.png';
// Importa una imagen predeterminada para el perfil del usuario.

import PersonalInfo from './PersonalInfo.jsx';
// Importa un componente para mostrar la información personal del usuario (no utilizado en este fragmento).

import styles from './UserProfile.module.css';
// Importa los estilos CSS específicos para el componente UserProfile.

import UserPosts from "./UserPosts.jsx";
// Importa el componente UserPosts para mostrar las publicaciones del usuario.

import ProfileImageUploadEco from "./ProfileImageUpload.jsx";
// Importa el componente ProfileImageUploadEco para manejar la subida de la imagen de perfil.

import CreatePostForm from "./CreatePostForm.jsx";
// Importa el componente CreatePostForm para manejar la creación de nuevas publicaciones.

import EditUserProfileEco from "./EditUserProfile.jsx";
// Importa el componente EditUserProfileEco para manejar la edición del perfil del usuario.

const UserProfile = () => {
    const { store, actions } = useContext(Context);
    // Usa el contexto global para acceder al store y las acciones de la aplicación.

    const { uploadedUserData } = store;
    // Extrae los datos del usuario cargado desde el store.

    const navigate = useNavigate();
    // Inicializa el hook useNavigate para redirigir al usuario a diferentes rutas.

    const [showImageUploadModal, setShowImageUploadModal] = useState(false);
    // Estado para manejar la visibilidad del modal de subida de imagen de perfil.

    const [showCreatePostForm, setShowCreatePostForm] = useState(false);
    // Estado para manejar la visibilidad del formulario de creación de publicaciones.

    const [editingPost, setEditingPost] = useState(null);
    // Estado para manejar la publicación que se está editando.

    useEffect(() => {
        window.scrollTo(0, 0);
        // Desplaza la ventana al inicio cuando se carga el componente.
    }, []);

    useEffect(() => {
        const verificarAutenticacion = async () => {
            const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
            // Verifica si el usuario está autenticado obteniendo el estado desde localStorage.

            if (!isAuthenticated) {
                navigate("/");
                // Si el usuario no está autenticado, redirige a la página de inicio.
            } else {
                await actions.loadUserData();
                // Si el usuario está autenticado, carga los datos del usuario.
            }
        };
        verificarAutenticacion();
    }, [navigate]);

    const profileImageUrl = uploadedUserData?.profile_image_url;
    // Almacena la URL de la imagen de perfil del usuario o undefined si no está disponible.

    const handleImageClick = () => {
        setShowImageUploadModal(true);
        // Muestra el modal para subir la imagen de perfil cuando se hace clic en la imagen de perfil.
    };

    const handleCreatePostClick = () => {
        setShowCreatePostForm(true);
        setEditingPost(null);
        // Muestra el formulario para crear una nueva publicación y asegura que no se esté editando ninguna publicación existente.
    };

    const handleCloseCreatePostForm = () => {
        setShowCreatePostForm(false);
        // Cierra el formulario de creación de publicaciones.
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
