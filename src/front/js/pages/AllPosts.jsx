import React, { useEffect, useContext, useState } from 'react';
// Importa React junto con los hooks useEffect, useContext y useState para gestionar el estado y los efectos secundarios.

import { Context } from '../store/appContext.js';
// Importa el contexto global de la aplicación.

import { Container, Card, Image, Carousel, Alert } from 'react-bootstrap';
// Importa componentes de React Bootstrap para construir la interfaz de usuario: Container, Card, Image, Carousel.

import { BounceLoader } from 'react-spinners';

import { useNavigate } from 'react-router-dom';
// Importa el hook useNavigate de react-router-dom para la navegación.

import Skeleton from 'react-loading-skeleton';
// Importa el componente Skeleton para mostrar un efecto de carga.

import 'react-loading-skeleton/dist/skeleton.css';
// Importa los estilos CSS de Skeleton.

import styles from './AllPosts.module.css';
// Importa los estilos CSS específicos para el componente AllPosts.

import UserPic from '../../../front/img/profile-circle-svgrepo-com.png';
// Importa una imagen predeterminada para el perfil del usuario.

const AllPosts = () => {
    const { actions, store } = useContext(Context);
    // Usa el contexto global para acceder a las acciones y el store de la aplicación.

    const [userId, setUserId] = useState(null);
    // Estado para almacenar el ID del usuario autenticado.

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Estado para verificar si el usuario está autenticado.

    const [showLoginMessageRedirec, setShowLoginMessageRedirec] = useState(false);
    // Estado para manejar la visibilidad del mensaje que solicita iniciar sesión antes de redirigir al perfil de un usuario.

    const [showLoginMessage, setShowLoginMessage] = useState(false);
    // Estado para manejar la visibilidad del mensaje que solicita iniciar sesión antes de dar "me gusta".

    const [carouselIndex, setCarouselIndex] = useState({});
    // Estado para manejar el índice activo de los carruseles de imágenes en las publicaciones.

    const [showModal, setShowModal] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setShowModal(false);
        }, 5000);
    }, []);

    const navigate = useNavigate();
    // Inicializa el hook useNavigate para redirigir al usuario a diferentes rutas.

    useEffect(() => {
        const fetchPosts = async () => {
            await actions.getAllPosts();
            // Llama a la acción para obtener todas las publicaciones.
        };

        fetchPosts();
    }, [navigate]);

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

    const handleLikeClick = async (post) => {
        if (!isAuthenticated) {
            setShowLoginMessage(true);
            setTimeout(() => setShowLoginMessage(false), 4000);
            return;
            // Si el usuario no está autenticado, muestra un mensaje solicitando iniciar sesión y no permite dar "me gusta".
        }

        const response = await actions.toggleLike(post.id);
        if (response.success) {
            actions.getAllPosts();
            // Si la acción de "me gusta" tiene éxito, vuelve a cargar las publicaciones para reflejar el cambio.
        }
    };

    const getRandomUsername = (likedBy) => {
        if (likedBy.length === 0) return "alguien";
        const randomUser = likedBy[Math.floor(Math.random() * likedBy.length)];
        return store.users.find(user => user.id === randomUser)?.username || "alguien";
        // Devuelve un nombre de usuario aleatorio de la lista de usuarios que han dado "me gusta" a la publicación.
    };

    const handleSelect = (selectedIndex, postId) => {
        setCarouselIndex(prevState => ({
            ...prevState,
            [postId]: selectedIndex
        }));
        // Maneja el cambio de imagen en el carrusel actualizando el índice activo para la publicación dada.
    };

    const handleProfileClick = (username) => {
        if (!isAuthenticated) {
            setShowLoginMessageRedirec(true);
            setTimeout(() => setShowLoginMessageRedirec(false), 4000);
            return;
            // Si el usuario no está autenticado, muestra un mensaje solicitando iniciar sesión antes de redirigir al perfil.
        }
        navigate(`/profile/${username}`);
        // Redirige al perfil del usuario cuyo nombre se ha hecho clic.
    };

    const renderLoadingModal = () => (
        <div className={styles["custom-modal-body"]}>
            {showModal && (
                <div id={styles["custom-overlay"]} className={styles["custom-overlay-context"]}>
                    <div className={styles["custom-modal"]}>
                        <BounceLoader
                            color="#0094f6a3"
                            cssOverride={{}}
                            size={300}
                            className={styles.BounceLoader}

                        />
                        <div className={styles.divMessage}>
                            <h5 className={styles.message}>La data puede demorar algunos segundos en cargar. Por favor, no se vaya.</h5>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );

    if (!store.allposts.length) {
        return (
            <Container className={styles.postsContainer}>
                <div className={styles.scrollContainer}>
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <Card key={index} className={styles.postCard}>
                            <Card.Header className={styles.cardHeader}>
                                <div className={styles.authorInfo}>
                                    <Skeleton height={40} width={40} />
                                    <div>
                                        <Skeleton height={20} width={100} />
                                        <Skeleton height={20} width={100} />
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className={styles.cardBody}>
                                <Skeleton height={200} width={300} />
                                <Skeleton height={20} width={200} />
                                <div className={styles.postActions}>
                                    <Skeleton height={20} width={20} />
                                    <Skeleton height={20} width={20} />
                                    <Skeleton height={20} width={20} />
                                </div>
                                <Skeleton height={20} width={200} />
                                <Skeleton height={20} width={200} />
                            </Card.Body>
                        </Card>
                    ))}
                </div>
                {showModal && renderLoadingModal()}
            </Container>
        );
    }

    return (
        <Container className={styles.postsContainer}>
            <div className={styles.scrollContainer}>
                {store.allposts.map((post) => (
                    <Card key={post.id} className={styles.postCard}>
                        <Card.Header className={styles.cardHeader}>
                            <div className={styles.authorInfo}>
                                <Image
                                    src={post.author.profile_image_url || UserPic}
                                    roundedCircle
                                    className={styles.authorAvatar}
                                    onClick={() => handleProfileClick(post.author.username)}
                                />
                                {showLoginMessageRedirec && (
                                    <div className={styles.loginMessageRedirec}>Debes iniciar sesión para ver el perfil</div>
                                )}
                                <div>
                                    <div className={styles.authorName} onClick={() => handleProfileClick(post.author.username)}>{post.author.username}</div>
                                    <div className={styles.postLocation}>
                                        <i className="fa-solid fa-location-dot"></i> {post.location}
                                    </div>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className={styles.cardBody}>
                            {post.images.length > 1 ? (
                                <div className={styles.carouselContainer}>
                                    <Carousel
                                        activeIndex={carouselIndex[post.id] || 0}
                                        onSelect={(selectedIndex) => handleSelect(selectedIndex, post.id)}
                                        className={styles.carousel}
                                    >
                                        {post.images.map((image, index) => (
                                            <Carousel.Item key={index}>
                                                <Image src={image} className={styles.postImage} />
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                    <div className={styles.carouselCounter}>
                                        {((carouselIndex[post.id] || 0) + 1)}/{post.images.length}
                                    </div>
                                </div>
                            ) : (
                                <Image src={post.images[0]} className={styles.postImage} />
                            )}
                            <Card.Text className={styles.likes}>{post.message}</Card.Text>
                            <div className={styles.postActions}>
                                <div className={styles.likeContainer}>
                                    <i
                                        className={`fa${post.liked_by_user.includes(userId) ? ' fa-solid' : '-regular'} fa-heart ${post.liked_by_user.includes(userId) ? styles.liked : ''}`}
                                        onClick={() => handleLikeClick(post)}
                                    ></i>
                                    {showLoginMessage && (
                                        <div className={styles.loginMessage}>Debes iniciar sesión para dar like</div>
                                    )}
                                </div>
                                <i className="fa fa-comment-o"></i>
                                <i className="fa fa-paper-plane-o"></i>
                            </div>
                            <Card.Text className={styles.likes}>
                                Les gusta a <span className={styles.boldText}>{getRandomUsername(post.liked_by_user)}</span> y <span className={styles.boldText}>otros ({post.likes_count})</span>
                            </Card.Text>
                            <Card.Text className={styles.date}>{new Date(post.created_at).toLocaleDateString()}</Card.Text>
                        </Card.Body>
                    </Card>
                ))}
            </div>
            {showModal && renderLoadingModal()}
        </Container>
    );
};

export default AllPosts;
