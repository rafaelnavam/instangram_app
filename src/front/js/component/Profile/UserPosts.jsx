import React, { useEffect, useState, useContext } from 'react';
// Importa React junto con los hooks useEffect, useState y useContext para gestionar efectos secundarios, estado y contexto.

import { Context } from '../../store/appContext';
// Importa el contexto global de la aplicación.

import styles from './UserPosts.module.css';
// Importa los estilos CSS específicos para el componente UserPosts.

import { Container, Row, Col, Card, Image, Carousel, Dropdown, DropdownButton } from 'react-bootstrap';
// Importa componentes de React Bootstrap para construir la interfaz de usuario: Container, Row, Col, Card, Image, Carousel, Dropdown, DropdownButton.

import UserPic from '../../../img/profile-circle-svgrepo-com.png';
// Importa una imagen predeterminada para el perfil del usuario.

const UserPosts = ({ setEditingPost, setShowCreatePostForm }) => {
    // Componente funcional que recibe dos props: setEditingPost y setShowCreatePostForm para manejar la edición de publicaciones y la visualización del formulario de creación.

    const { actions, store } = useContext(Context);
    // Usa el contexto global para acceder a las acciones y el store de la aplicación.

    const [selectedPost, setSelectedPost] = useState(null);
    // Estado para manejar la publicación seleccionada que se mostrará en detalle.

    const [userId, setUserId] = useState(null);
    // Estado para almacenar el ID del usuario autenticado.

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Estado para verificar si el usuario está autenticado.

    const [showLoginMessage, setShowLoginMessage] = useState(false);
    // Estado para manejar la visibilidad del mensaje que solicita iniciar sesión.

    useEffect(() => {
        const fetchPosts = async () => {
            await actions.getUserPosts();
            // Llama a la acción para obtener las publicaciones del usuario.
        };

        fetchPosts();
    }, [actions]);

    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
        if (isAuthenticated) {
            const user_id = JSON.parse(localStorage.getItem("user_id"));
            setUserId(user_id);
            setIsAuthenticated(true);
            // Si el usuario está autenticado, obtiene su ID y actualiza el estado de autenticación.
        } else {
            setIsAuthenticated(false);
            // Si el usuario no está autenticado, actualiza el estado de autenticación a falso.
        }
    }, []);

    const handlePostClick = (post) => {
        setSelectedPost(post);
        // Establece la publicación seleccionada para mostrar en detalle.
    };

    const handleBackClick = () => {
        setSelectedPost(null);
        setEditingPost(null);
        // Restablece la vista de publicaciones y cierra la vista de edición.
    };

    const handleLikeClick = async (post) => {
        if (!isAuthenticated) {
            setShowLoginMessage(true);
            setTimeout(() => setShowLoginMessage(false), 3000);
            return;
            // Si el usuario no está autenticado, muestra un mensaje solicitando iniciar sesión y no permite dar "me gusta".
        }

        const response = await actions.toggleLike(post.id);
        if (response.success) {
            // Actualizar el estado localmente
            const updatedPosts = store.posts.map(p => {
                if (p.id === post.id) {
                    return { ...p, liked_by_user: response.liked_by_user || [], likes_count: response.likes_count };
                    // Actualiza la publicación con los nuevos datos de "me gusta".
                }
                return p;
            });
            setSelectedPost(updatedPosts.find(p => p.id === post.id));
            // Actualiza la publicación seleccionada en detalle con los nuevos datos.
        }
    };

    const handleEditClick = (post) => {
        setEditingPost(post);
        setShowCreatePostForm(true);
        setSelectedPost(null);  // Asegúrate de cerrar la vista de detalles si se está editando
        // Maneja la edición de la publicación, abriendo el formulario de edición y cerrando la vista de detalles.
    };

    const handleDeleteClick = async (post) => {
        const response = await actions.deletePost(post.id);
        if (response && response.success) {
            setSelectedPost(null);
            setEditingPost(null);
            actions.getUserPosts(); // Volver a cargar los posts después de eliminar
            // Si la eliminación es exitosa, restablece la vista y recarga las publicaciones.
        } else {
            console.error(response.error);
            // Si hay un error, lo muestra en la consola.
        }
    };

    const getRandomUsername = (likedBy) => {
        if (likedBy.length === 0) return "alguien";
        const randomUser = likedBy[Math.floor(Math.random() * likedBy.length)];
        return store.users.find(user => user.id === randomUser)?.username || "alguien";
        // Devuelve un nombre de usuario aleatorio de la lista de usuarios que han dado "me gusta" a la publicación.
    };

    return (
        <Container className={styles.postsContainer}>
            {!selectedPost ? (
                <>
                    <Row>
                        {store.posts.map((post) => (
                            <Col key={post.id} md={4} className={styles.postCard} onClick={() => handlePostClick(post)}>
                                <Card>
                                    <Card.Img variant="top" src={post.images[0]} className={styles.allpostCard} />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            ) : (
                <div className={styles.singlePostContainer}>
                    <button onClick={handleBackClick} className={styles.backButton}><i className="fa-solid fa-chevron-left"></i></button>
                    <Card className={styles.singlePostCard}>
                        <Card.Header className={styles.cardHeader}>
                            <div className={styles.authorInfo}>
                                <Image src={store.uploadedUserData.profile_image_url || UserPic} roundedCircle className={styles.authorAvatar} />
                                <div>
                                    <div className={styles.authorName}>Author Name</div>
                                    <div className={styles.postLocation}>
                                        <i className="fa-solid fa-location-dot"></i> {selectedPost.location}
                                    </div>
                                </div>
                            </div>
                            <DropdownButton
                                id="dropdown-basic-button"
                                title={<i className="fa-solid fa-ellipsis-vertical"></i>}
                                variant="link"
                                className={styles.postOptions}
                            >
                                <Dropdown.Item onClick={() => handleEditClick(selectedPost)}>Edit</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleDeleteClick(selectedPost)}>Delete</Dropdown.Item>
                            </DropdownButton>
                        </Card.Header>
                        <Card.Body className={styles.cardBody}>
                            {selectedPost.images.length > 1 ? (
                                <Carousel className={styles.carousel}>
                                    {selectedPost.images.map((image, index) => (
                                        <Carousel.Item key={index}>
                                            <Image src={image} className={styles.carouselImage} />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            ) : (
                                <Image src={selectedPost.images[0]} className={styles.singlePostImage} />
                            )}
                            <div className={styles.postActions}>
                                <div className={styles.likeContainer}>
                                    <i
                                        className={`fa${selectedPost.liked_by_user?.includes(userId) ? ' fa-solid' : '-regular'} fa-heart ${selectedPost.liked_by_user?.includes(userId) ? styles.liked : ''}`}
                                        onClick={() => handleLikeClick(selectedPost)}
                                    ></i>
                                    {showLoginMessage && (
                                        <div className={styles.loginMessage}>Debes iniciar sesión para dar like</div>
                                    )}
                                </div>
                                <i className="fa fa-comment-o"></i>
                                <i className="fa fa-paper-plane-o"></i>
                            </div>
                            <Card.Text className={styles.likes}>
                                Les gusta a <span className={styles.boldText}>{getRandomUsername(selectedPost.liked_by_user || [])}</span> y <span className={styles.boldText}>otros ({selectedPost.likes_count})</span>
                            </Card.Text>
                            <Card.Text className={styles.date}>{new Date(selectedPost.created_at).toLocaleDateString()}</Card.Text>
                        </Card.Body>
                    </Card>
                    <div className={styles.otherPosts}>
                        <Row>
                            {store.posts.filter(post => post.id !== selectedPost.id).map((post) => (
                                <Col key={post.id} md={4} className={styles.postCard} onClick={() => handlePostClick(post)}>
                                    <Card>
                                        <Card.Img variant="top" src={post.images[0]} />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default UserPosts;
