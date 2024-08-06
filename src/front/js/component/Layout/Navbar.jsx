import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Form, FormControl, InputGroup, Button, Dropdown, Modal } from 'react-bootstrap';
import { Context } from '../../store/appContext';
import styles from './Navbar.module.css';
import logoRojo from '../../../img/insta-svgrepo-com.png';
import profilePic from '../../../img/profile-circle-svgrepo-com.png';

const NavigationBar = () => {
    const { store, actions } = useContext(Context);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showLoginMessage, setShowLoginMessage] = useState(false);

    const navigate = useNavigate();
    const { uploadedUserData } = store;

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const result = await actions.validateToken(token);
            }
        };
        checkAuthStatus();
    }, [navigate]);

    useEffect(() => {
        const authStatus = JSON.parse(localStorage.getItem("isAuthenticated"));
        setIsAuthenticated(authStatus);

        if (authStatus) {
            actions.loadUserData();
        }
    }, [navigate]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                actions.searchUsers(searchQuery);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setIsDropdownOpen(true);
    };

    const handleUserClick = (username) => {
        if (!isAuthenticated) {
            setShowLoginMessage(true);
            setSearchQuery(''); // Borrar la búsqueda
            setIsDropdownOpen(false); // Cerrar el dropdown
        } else {
            setIsDropdownOpen(false);
            navigate(`/profile/${username}`);
        }
    };

    const handleLogout = async () => {
        await actions.closeSession();
        window.location.reload();
        navigate('/');
    };

    const profileImageUrl = uploadedUserData.profile_image_url || profilePic;

    return (
        <>
            <Navbar expand="lg" className={styles.topNavbar}>
                <Container className={styles.navContainer}>
                    <Link to="/" className={styles.logoContainer}>
                        <img
                            src={logoRojo}
                            alt="store"
                            className={`${styles.logo} ${styles.logoAnimation}`}
                        />
                    </Link>
                    <Form className={`${styles.searchContainer}`} onSubmit={e => e.preventDefault()}>
                        <InputGroup className={styles.searchGroup}>
                            <FormControl
                                type="search"
                                placeholder="Buscar usuarios"
                                className={`${styles.searchInput}`}
                                aria-label="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`}></i>
                        </InputGroup>
                        {searchQuery && store.searchResults.length > 0 && isDropdownOpen && (
                            <Dropdown.Menu show className={styles.searchResultsDropdown}>
                                {store.searchResults.map(user => (
                                    <Dropdown.Item key={user.id} onClick={() => handleUserClick(user.username)} className={styles.searchResultItem}>
                                        <img src={user.profile_image_url || profilePic} alt={user.username} className={styles.searchResultImage} />
                                        <div className={styles.searchResultDetails}>
                                            <div className={styles.searchResultName}>{user.username}</div>
                                            <div className={styles.searchResultFullName}>{user.name} {user.last_name}</div>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        )}
                    </Form>
                    <div className={styles.actionsContainer}>
                        {isAuthenticated ? (
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-light" className={styles.profileButton}>
                                    {uploadedUserData.name}
                                    <img src={profileImageUrl} alt="User" className={styles.profileImage} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="right">
                                    <Dropdown.Item as={Link} to="/my-account">Perfil</Dropdown.Item>
                                    <Dropdown.Item onClick={handleLogout}>Cerrar sesión</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Button variant="outline-light" className={styles.loginButton} as={Link} to="/login-Register">
                                Acceder / Registrarse
                            </Button>
                        )}
                    </div>
                </Container>
            </Navbar>
            <Modal show={showLoginMessage} onHide={() => setShowLoginMessage(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Acción requerida</Modal.Title>
                </Modal.Header>
                <Modal.Body>Debes iniciar sesión para ver el perfil de usuario.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => {
                        setShowLoginMessage(false);
                        navigate('/login-Register');
                    }}>
                        Iniciar sesión
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default NavigationBar;
