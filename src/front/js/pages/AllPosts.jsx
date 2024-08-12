import React, { useEffect, useContext, useState } from 'react';
import { Context } from '../store/appContext.js';
import { Container, Card, Image, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './AllPosts.module.css';
import UserPic from '../../../front/img/profile-circle-svgrepo-com.png'


const AllPosts = () => {
    const { actions, store } = useContext(Context);
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginMessageRedirec, setShowLoginMessageRedirec] = useState(false);
    const [showLoginMessage, setShowLoginMessage] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            await actions.getAllPosts();
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
        if (isAuthenticated) {
            const user_id = JSON.parse(localStorage.getItem("user_id"));
            setUserId(user_id);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const handleLikeClick = async (post) => {
        if (!isAuthenticated) {
            setShowLoginMessage(true);
            setTimeout(() => setShowLoginMessage(false), 4000);
            return;
        }

        const response = await actions.toggleLike(post.id);
        if (response.success) {
            actions.getAllPosts(); // Actualizar los posts para reflejar los cambios en los likes
        }
    };

    const getRandomUsername = (likedBy) => {
        if (likedBy.length === 0) return "alguien";
        const randomUser = likedBy[Math.floor(Math.random() * likedBy.length)];
        return store.users.find(user => user.id === randomUser)?.username || "alguien";
    };

    const handleSelect = (selectedIndex, postId) => {
        setCarouselIndex(prevState => ({
            ...prevState,
            [postId]: selectedIndex
        }));
    };

    const handleProfileClick = (username) => {
        if (!isAuthenticated) {
            setShowLoginMessageRedirec(true);
            setTimeout(() => setShowLoginMessageRedirec(false), 4000);
            return;
        }
        navigate(`/profile/${username}`);
    };

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
        </Container>
    );
};

export default AllPosts;
