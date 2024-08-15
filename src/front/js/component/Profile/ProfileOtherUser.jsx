import React, { useState, useContext, useEffect } from "react";
// Importa React junto con los hooks useState, useContext y useEffect para gestionar el estado y los efectos secundarios.

import { Context } from '../../store/appContext.js';
// Importa el contexto global de la aplicación.

import { useNavigate, useParams } from "react-router-dom";
// Importa los hooks useNavigate y useParams de react-router-dom para la navegación y obtención de parámetros de la URL.

import { Container, Row, Col, Image, Button, Card, Carousel } from 'react-bootstrap';
// Importa componentes de React Bootstrap para la construcción de la interfaz de usuario: Container, Row, Col, Image, Button, Card, Carousel.

import Skeleton from 'react-loading-skeleton';
// Importa el componente Skeleton para mostrar un efecto de carga.

import 'react-loading-skeleton/dist/skeleton.css';
// Importa los estilos CSS del componente Skeleton.

import styles from './ProfileOtherUser.module.css';
// Importa los estilos CSS específicos para el componente ProfileOtherUser.

import UserPic from '../../../img/profile-circle-svgrepo-com.png';
// Importa una imagen predeterminada para el perfil del usuario.

const ProfileOtherUser = () => {
    const { store, actions } = useContext(Context);
    // Usa el contexto global para acceder al store y las acciones de la aplicación.

    const { username } = useParams();
    // Obtiene el parámetro `username` de la URL usando useParams.

    const navigate = useNavigate();
    // Inicializa el hook useNavigate para redirigir al usuario a diferentes rutas.

    const [userData, setUserData] = useState(null);
    // Estado para almacenar los datos del usuario cuyo perfil se está visualizando.

    const [userPosts, setUserPosts] = useState([]);
    // Estado para almacenar las publicaciones del usuario.

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Estado para verificar si el usuario actual está autenticado.

    const [showLoginMessage, setShowLoginMessage] = useState(false);
    // Estado para manejar la visibilidad del mensaje que solicita iniciar sesión.

    const [selectedPost, setSelectedPost] = useState(null);
    // Estado para manejar la publicación seleccionada para mostrar en detalle.

    const [userId, setUserId] = useState(null);
    // Estado para almacenar el ID del usuario actual.

    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
        setIsAuthenticated(isAuthenticated);
        // Verifica si el usuario está autenticado obteniendo el estado desde localStorage.

        if (!isAuthenticated) {
            navigate("/");
            // Si el usuario no está autenticado, redirige a la página de inicio.
        } else {
            const user_id = JSON.parse(localStorage.getItem("user_id"));
            setUserId(user_id);
            // Si el usuario está autenticado, obtiene y almacena su ID.
        }
    }, [navigate, selectedPost]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const response = await actions.getOtherUserProfile(username);
            // Llama a la acción para obtener el perfil y las publicaciones del usuario.

            if (response.success) {
                setUserData(response.user);
                setUserPosts(response.posts);
                // Si la solicitud es exitosa, almacena los datos del usuario y sus publicaciones en los estados correspondientes.
            } else {
                //console.error(response.error);
                // Si hay un error, lo muestra en la consola.
            }
        };
        fetchUserProfile();
    }, [username, actions]);

    const handleLikeClick = async (post) => {
        if (!isAuthenticated) {
            setShowLoginMessage(true);
            setTimeout(() => setShowLoginMessage(false), 3000);
            return;
            // Si el usuario no está autenticado, muestra un mensaje solicitando iniciar sesión y no permite dar "me gusta".
        }

        const response = await actions.toggleLike(post.id);
        // Llama a la acción para alternar el "me gusta" en una publicación.

        if (response.success) {
            setUserPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p.id === post.id
                        ? { ...p, liked_by_user: response.liked_by_user, likes_count: response.likes_count }
                        : p
                )
            );
            // Actualiza el estado de las publicaciones para reflejar el cambio en los "me gusta".

            if (selectedPost && selectedPost.id === post.id) {
                setSelectedPost({
                    ...selectedPost,
                    liked_by_user: response.liked_by_user,
                    likes_count: response.likes_count
                });
                // Si la publicación seleccionada es la misma que se ha actualizado, también actualiza su estado.
            }
        }
    };

    const getRandomUsername = (likedBy) => {
        if (likedBy.length === 0) return "alguien";
        const randomUser = likedBy[Math.floor(Math.random() * likedBy.length)];
        return store.users.find(user => user.id === randomUser)?.username || "alguien";
        // Devuelve un nombre de usuario aleatorio de la lista de usuarios que han dado "me gusta" a la publicación.
    };

    const handlePostClick = (post) => {
        setSelectedPost(post);
        // Establece la publicación seleccionada para mostrar en detalle.
    };

    const handleBackClick = () => {
        setSelectedPost(null);
        // Restablece la vista de publicaciones para mostrar todas las publicaciones en lugar de una sola.
    };

    if (!userData || !userPosts.length) {
        return (
            <Container className={styles.userProfile}>
                <Row className={styles.profileHeader}>
                    <Col xs={3} className={styles.profilePicContainer}>
                        <Skeleton height={100} width={100} />
                    </Col>
                    <Col xs={9}>
                        <Skeleton height={30} width={200} />
                        <Skeleton height={20} width={150} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} className={styles.profileInfo}>
                        <Skeleton height={20} width={200} />
                    </Col>
                </Row>
                <Row className={styles.postsContainer}>
                    {[1, 2, 3].map((_, index) => (
                        <Col key={index} xs={12} md={4} className={styles.postCard}>
                            <Skeleton height={200} width={200} />
                        </Col>
                    ))}
                </Row>
            </Container>
        );
    }

    return (
        <Container className={styles.userProfile}>
            <Row className={styles.profileHeader}>
                <Col xs={3} className={styles.profilePicContainer}>
                    <Image src={userData.profile_image_url || UserPic} roundedCircle className={styles.profilePic} />
                </Col>
                <Col xs={9}>
                    <h2 className={styles.username}>{userData.username}</h2>
                    <div className={styles.profileStats}>
                        <span><strong>{userPosts.length}</strong> publicaciones</span>
                        <span><strong>3030</strong> seguidores</span>
                        <span><strong>645</strong> seguidos</span>
                    </div>
                    <div className={styles.profileActions}>
                        <Button variant="outline-dark" className={styles.followButton}>Seguir</Button>
                        <Button variant="outline-dark" className={styles.messageButton}>Mensaje</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className={styles.profileInfo}>
                    <h3>{userData.name}</h3>
                </Col>
            </Row>
            <Row className={styles.postsContainer}>
                {selectedPost ? (
                    <div className={styles.singlePostContainer}>
                        <button onClick={handleBackClick} className={styles.backButton}><i className="fa-solid fa-chevron-left"></i></button>
                        <Card className={styles.singlePostCard}>
                            <Card.Header className={styles.cardHeader}>
                                <div className={styles.authorInfo}>
                                    <Image src={userData.profile_image_url || UserPic} roundedCircle className={styles.authorAvatar} />
                                    <div>
                                        <div className={styles.authorName}>{userData.username}</div>
                                        <div className={styles.postLocation}>
                                            <i className="fa-solid fa-location-dot"></i> {selectedPost.location}
                                        </div>
                                    </div>
                                </div>
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
                                <Card.Text>{selectedPost.message}</Card.Text>
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
                                </div>
                                <Card.Text className={styles.likes}>
                                    Les gusta a <span className={styles.boldText}>{getRandomUsername(selectedPost.liked_by_user)}</span> y <span className={styles.boldText}>otros ({selectedPost.likes_count})</span>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                        <div className={styles.otherPosts}>
                            <Row>
                                {userPosts.filter(post => post.id !== selectedPost.id).map((post) => (
                                    <Col key={post.id} xs={12} md={4} className={styles.postCard} onClick={() => handlePostClick(post)}>
                                        <Card>
                                            <Card.Img variant="top" src={post.images[0]} className={styles.postImage} />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </div>
                ) : (
                    userPosts.map((post) => (
                        <Col key={post.id} xs={12} md={4} className={styles.postCard} onClick={() => handlePostClick(post)}>
                            <Card>
                                {post.images.length > 1 ? (
                                    <Carousel>
                                        {post.images.map((image, index) => (
                                            <Carousel.Item key={index}>
                                                <Image src={image} className={styles.postImage} />
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                ) : (
                                    <Card.Img variant="top" src={post.images[0]} className={styles.postImage} />
                                )}
                                <Card.Body>
                                    <Card.Text>{post.message}</Card.Text>
                                    <div className={styles.postActions}>
                                        <i
                                            className={`fa${post.liked_by_user.includes(userId) ? ' fa-solid' : '-regular'} fa-heart ${post.liked_by_user.includes(userId) ? styles.liked : ''}`}
                                            onClick={() => handleLikeClick(post)}
                                        ></i>
                                        {showLoginMessage && (
                                            <div className={styles.loginMessage}>Debes iniciar sesión para dar like</div>
                                        )}
                                        <i className="fa fa-comment-o"></i>
                                        <i className="fa fa-paper-plane-o"></i>
                                    </div>

                                    <Card.Text className={styles.likes}>
                                        Les gusta a <span className={styles.boldText}>{getRandomUsername(post.liked_by_user)}</span> y <span className={styles.boldText}>otros ({post.likes_count})</span>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
};

export default ProfileOtherUser;
