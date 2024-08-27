import React, { useContext, useEffect, useState } from 'react';
// Importa React junto con los hooks useContext, useEffect y useState para gestionar estado y efectos secundarios.

import { Link, useNavigate } from "react-router-dom";
// Importa el componente Link y el hook useNavigate de react-router-dom para la navegación entre rutas.

import { Navbar, Container, Form, FormControl, InputGroup, Button, Dropdown, Modal } from 'react-bootstrap';
// Importa componentes de React Bootstrap para construir la interfaz de usuario: Navbar, Container, Form, FormControl, InputGroup, Button, Dropdown, y Modal.

import { Context } from '../../store/appContext';
// Importa el contexto global de la aplicación.

import styles from './Navbar.module.css';
// Importa los estilos CSS específicos para el componente Navbar.

import logoRojo from '../../../img/insta-svgrepo-com.png';
// Importa el logo de la aplicación.

import profilePic from '../../../img/profile-circle-svgrepo-com.png';
// Importa una imagen predeterminada para el perfil del usuario.

const NavigationBar = () => {
    const { store, actions } = useContext(Context);
    // Usa el contexto global para acceder al store y las acciones de la aplicación.

    const [searchQuery, setSearchQuery] = useState('');
    // Estado para manejar el valor de la búsqueda de usuarios.

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Estado para verificar si el usuario está autenticado.

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // Estado para manejar la visibilidad del dropdown de resultados de búsqueda.

    const [showLoginMessage, setShowLoginMessage] = useState(false);
    // Estado para manejar la visibilidad del modal que solicita iniciar sesión.

    const navigate = useNavigate();
    // Inicializa el hook useNavigate para redirigir al usuario a diferentes rutas.

    const { uploadedUserData } = store;
    // Extrae los datos del usuario cargados del store global.

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            // Verifica si hay un token de autenticación almacenado en localStorage.

            if (token) {
                const result = await actions.validateToken(token);
                // Valida el token llamando a una acción que lo verifique en el backend.
            }
        };
        checkAuthStatus();
        // Llama a la función checkAuthStatus al montar el componente para verificar el estado de autenticación.
    }, [navigate]);

    useEffect(() => {
        const authStatus = JSON.parse(localStorage.getItem("isAuthenticated"));
        // Obtiene el estado de autenticación desde localStorage.

        setIsAuthenticated(authStatus);
        // Actualiza el estado de autenticación en el componente.

        if (authStatus) {
            actions.loadUserData();
            // Si el usuario está autenticado, carga los datos del usuario desde el backend.
        }
    }, [navigate]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                actions.searchUsers(searchQuery);
                // Si hay una consulta de búsqueda, llama a la acción para buscar usuarios después de un pequeño retraso.
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
        // Limpia el temporizador al desmontar el componente o cambiar la consulta de búsqueda.
    }, [searchQuery]);

    const validateSearchQuery = (query) => {
        const regex = /^([a-zA-Z0-9\s-_\.]*)$/; // permitir cadenas vacías
        return regex.test(query);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        if (validateSearchQuery(query)) {
            setSearchQuery(query);
            setIsDropdownOpen(true);
        } else {
            // handle invalid input, e.g., display an error message
        }
    };

    const handleUserClick = (username) => {
        if (!isAuthenticated) {
            setShowLoginMessage(true);
            // Si el usuario no está autenticado, muestra el modal que solicita iniciar sesión.

            setSearchQuery(''); // Limpia la búsqueda.
            setIsDropdownOpen(false); // Cierra el dropdown.
        } else {
            setIsDropdownOpen(false);
            navigate(`/profile/${username}`);
            // Si el usuario está autenticado, redirige al perfil del usuario seleccionado.
        }
    };

    const handleLogout = async () => {
        await actions.closeSession();
        // Llama a la acción para cerrar la sesión del usuario.

        window.location.reload();
        // Recarga la página para limpiar cualquier estado residual.

        navigate('/');
        // Redirige al usuario a la página de inicio.
    };

    const profileImageUrl = uploadedUserData.profile_image_url || profilePic;
    // Define la URL de la imagen de perfil del usuario. Si no hay una imagen cargada, usa la imagen predeterminada.

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
