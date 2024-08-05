import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container, Form, FormControl, InputGroup, Button, Dropdown } from 'react-bootstrap';
import { Context } from '../../store/appContext';
import styles from './Navbar.module.css';
import logoRojo from '../../../img/logorojo.png';
import profilePic from '../../../img/profile-circle-svgrepo-gray-com.png';

const NavigationBar = () => {
    const { store, actions } = useContext(Context);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);


    const navigate = useNavigate();
    const { uploadedUserData } = store;

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const result = await actions.validateToken(token);
                //     // console.log(result);
                //     if (!result.isAuthenticated) {
                //         navigate('/');
                //     }
                // } else {
            }
        };
        checkAuthStatus();
    }, []);

    useEffect(() => {
        const authStatus = JSON.parse(localStorage.getItem("isAuthenticated"));
        setIsAuthenticated(authStatus);

        if (authStatus) {
            actions.loadUserData(); // Asegúrate de cargar los datos del usuario
        }

    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                actions.searchProducts(searchQuery);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setIsDropdownOpen(true); // Mostrar el menú desplegable cuando el usuario empieza a buscar
    };

    // const handleBuyNowClick = (product) => {
    //     const categoryName = product.product_category.toLowerCase().replace(/ /g, "-");
    //     const subcategoryName = product.product_subcategory.toLowerCase().replace(/ /g, "-");
    //     const productName = product.product_name.toLowerCase().replace(/ /g, "-");
    //     setIsDropdownOpen(false); // Cerrar el menú desplegable
    //     navigate(`/${categoryName}/${subcategoryName}/${productName}`);
    // };



    const handleLogout = async () => {
        await actions.closeSession();
        window.location.reload();
        navigate('/Home');
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
                                placeholder="¿Qué estás buscando?"
                                className={`${styles.searchInput}`}
                                aria-label="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`}></i>
                        </InputGroup>
                        {searchQuery && store.searchResults.length > 0 && isDropdownOpen && (
                            <Dropdown.Menu show className={styles.searchResultsDropdown}>
                                {store.searchResults.map(product => (
                                    <Dropdown.Item key={product.product_id} onClick={() => handleBuyNowClick(product)} className={styles.searchResultItem}>
                                        <img src={product.product_images[0]} alt={product.product_name} className={styles.searchResultImage} />
                                        <div className={styles.searchResultDetails}>
                                            <div className={styles.searchResultName}>{product.product_name}</div>
                                            <div className={styles.searchResultPrice}>${product.product_price}</div>
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
                        {/* <div className={styles.cartContainer}>
                            <i className={`fa fa-shopping-cart ${styles.cartIcon}`} onClick={toggleCart}></i>
                            <span className={styles.cartCount}>{store.cartItems.length}</span>
                        </div> */}
                    </div>
                </Container>
            </Navbar>
            {/* <Navbar expand="lg" className={styles.categoryNavbar}>
                <Container className={styles.navContainer}>
                    <Navbar.Toggle aria-controls="category-navbar-nav" className={styles.navbarToggler} />
                    <Navbar.Collapse id="category-navbar-nav">
                        <Nav className="me-auto">
                            {store.categories.map(category => (
                                <NavDropdown
                                    key={category.category_id}
                                    title={category.category_name}
                                    id={`nav-dropdown-${category.category_id}`}
                                    className={styles.navDropdown}
                                >
                                    {store.subcategories
                                        .filter(sub => sub.category_id === category.category_id)
                                        .map(sub => (
                                            <NavDropdown.Item
                                                key={sub.subcategory_id}
                                                as={Link}
                                                to={`/${category.category_name}/${sub.subcategory_name}`}
                                                className={styles.navDropdownItem}
                                            >
                                                {sub.subcategory_name}
                                            </NavDropdown.Item>
                                        ))
                                    }
                                </NavDropdown>
                            ))}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar> */}
        </>
    );
};

export default NavigationBar;
