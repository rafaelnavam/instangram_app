// Importa las dependencias necesarias de React y otros módulos
import React, { useContext, useEffect, useState } from 'react';
// Importa el contexto global
import { Context } from '../../store/appContext';
// Importa componentes de React Bootstrap
import { Form, Button, Row, Col, Container, Modal } from 'react-bootstrap';
// Importa utilidades de React Router
import { Link, useNavigate } from 'react-router-dom';
// Importa la configuración de Firebase y los métodos de autenticación
import { auth, provider } from './firebase'; // Asegúrate de que la ruta es correcta
import { signInWithPopup } from "firebase/auth";
// Importa los estilos CSS específicos del componente
import styles from './LoginRegister.module.css';
// Importa el logo de Google
import googleLogo from '../../../../../public/images/google-color-svgrepo-com.png';


// Define el componente funcional LoginRegister
const LoginRegister = () => {
    // Usa el contexto global
    const { actions, store } = useContext(Context);
    // Hook para la navegación
    const navigate = useNavigate();

    // Hook de efecto para desplazarse al inicio de la página al cargar
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [errorMessageRegister, messageRegister, errorMessageLogin, messageLogin]);

    // Estado para los datos del formulario de login
    const [formDataLogin, setFormDataLogin] = useState({
        usernameOrEmail: '',
        password: '',
    });

    // Estado para los datos del formulario de registro
    const [formDataRegister, setFormDataRegister] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        name: '',
        last_name: ''
    });

    // Estado para los mensajes de error
    const [errorMessageRegister, setErrorMessageRegister] = useState("");
    const [messageRegister, setMessageRegister] = useState("");
    const [errorMessageLogin, setErrorMessageLogin] = useState("");
    const [messageLogin, setMessageLogin] = useState("");

    // Estado para mostrar u ocultar la contraseña
    const [showPassword, setShowPassword] = useState(false);

    // Maneja los cambios en el formulario de login
    const handleChangeLogin = (e) => {
        setFormDataLogin({ ...formDataLogin, [e.target.name]: e.target.value });
    };

    // Maneja los cambios en el formulario de registro
    const handleChangeRegister = (e) => {
        setFormDataRegister({ ...formDataRegister, [e.target.name]: e.target.value });
    };

    // Maneja el envío del formulario de login
    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        await actions.loginUserV2(formDataLogin.usernameOrEmail, formDataLogin.password);
        await actions.loadUserData();

        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated'));
        if (isAuthenticated) {
            navigate('/my-account');
        } else {
            setErrorMessageLogin("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
            setTimeout(() => {
                setErrorMessageLogin("");
            }, 4000);
        }
    };

    // Maneja el envío del formulario de registro
    const handleSubmitRegister = async (e) => {
        e.preventDefault();

        // Validación del email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formDataRegister.email)) {
            setErrorMessageRegister("Por favor, introduce una dirección de correo electrónico válida.");
            setTimeout(() => {
                setErrorMessageRegister("")
            }, 5000);
            return;
        }

        // // Validación de la contraseña
        // const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%^&+=*])(?=.*[0-9a-zA-Z]).{8,}$/;
        // if (!passwordRegex.test(formDataRegister.password)) {
        //     setErrorMessageRegister("Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character (#, @, $, %, ^, &, +, =, *).");
        //     setTimeout(() => {
        //         setErrorMessageRegister("")
        //     }, 5000);
        //     return;
        // }

        // Verifica si las contraseñas coinciden
        if (formDataRegister.password !== formDataRegister.confirmPassword) {
            setErrorMessageRegister("Las contraseñas no coinciden.");
            setTimeout(() => {
                setErrorMessageRegister("");
            }, 3000);
            return;
        }

        // Detalles del nuevo usuario
        const newUserDetails = {
            email: formDataRegister.email,
            password: formDataRegister.password,
            username: formDataRegister.username,
            name: formDataRegister.name,
            last_name: formDataRegister.last_name
        };

        // Crea el nuevo usuario
        const result = await actions.createUser(newUserDetails);
        if (result) {
            setMessageRegister("Registro exitoso. Por favor, revisa tu correo electrónico para activar tu cuenta.");
            setFormDataRegister({ email: '', password: '', confirmPassword: '', username: '', name: '', last_name: '' });

            setTimeout(() => {
                setMessageRegister("");
            }, 3000);
        } else {
            setErrorMessageRegister(store.creationState.error);

            setTimeout(() => {
                setErrorMessageRegister("");
            }, 3000);
        }
    };

    // Cierra el modal
    const handleModalClose = () => {
        setModalVisible(false);
        if (store.creationState.message) {
            navigate("/my-account");
        }
    };

    // Alterna la visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Hook de efecto para verificar la autenticación del usuario al cargar
    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated'));
        if (isAuthenticated) {
            navigate('/my-account');
        }
    }, [navigate]);

    // Maneja el inicio de sesión con Google para login
    const handleGoogleSignInForLogin = () => {
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                // Verifica si el usuario ya existe en la base de datos
                const userExists = await actions.checkIfUserExists(user.email);

                if (userExists) {
                    // Si el usuario ya existe, iniciar sesión
                    const loginResult = await actions.loginUserWithGoogle(user.email, user.uid);
                    if (loginResult) {
                        setMessageLogin("Tus datos son correctos.");

                        setTimeout(() => {
                            navigate("/my-profile");
                            setMessageLogin("");
                        }, 2000);
                    } else {
                        setErrorMessageLogin("Error al iniciar sesión con Google. Inténtalo de nuevo.");
                        setTimeout(() => {
                            setErrorMessageLogin("");
                        }, 2000);
                    }
                } else {
                    setErrorMessageLogin("No se encontró una cuenta con este correo electrónico. Regístrate primero.");
                    setTimeout(() => {
                        setErrorMessageLogin("");
                    }, 2000);
                }
            })
            .catch((error) => {
                setErrorMessageLogin("Error al autenticar con Google. Inténtalo de nuevo.");
                setTimeout(() => {
                    setErrorMessageLogin("");
                }, 2000);
            });
    };

    // Maneja el registro con Google
    const handleGoogleSignInForRegister = () => {
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                // Verifica si el usuario ya existe en la base de datos
                const userExists = await actions.checkIfUserExists(user.email);

                if (!userExists) {
                    // Si el usuario no existe, crearlo
                    const newUserDetails = {
                        email: user.email,
                        username: `${user.displayName}${Math.floor(Math.random() * 9000) + 1000}`,
                        name: user.displayName,
                        googleId: user.uid,
                        is_active: true
                    };

                    const registrationResult = await actions.createUser(newUserDetails);
                    if (registrationResult) {
                        setMessageRegister("Registro exitoso. Bienvenido!");
                        setTimeout(() => {
                            setMessageRegister("");
                        }, 2500);
                    } else {
                        setErrorMessageRegister("Error al registrar el usuario. Inténtalo de nuevo.");
                        setTimeout(() => {
                            setErrorMessageRegister("");
                        }, 2000);
                    }
                } else {
                    setErrorMessageRegister("Ya existe una cuenta con este correo electrónico. Inicia sesión en su lugar.");
                    setTimeout(() => {
                        setErrorMessageRegister("");
                    }, 5000);
                }
            })
            .catch((error) => {
                setErrorMessageRegister("Error al autenticar con Google. Inténtalo de nuevo.");
                setTimeout(() => {
                    setErrorMessageRegister("");
                }, 3000);
            });
    };

    const renderMessagesLogin = () => {
        if (errorMessageLogin) {
            return (
                <div className="alert alert-danger" role="alert">
                    <p>{errorMessageLogin}</p>
                </div>
            );
        } else if (messageLogin) {
            return (
                <div className="alert alert-success" role="alert">
                    <p>{messageLogin}</p>
                </div>
            );
        }
    };

    const renderMessagesRegister = () => {
        if (errorMessageRegister) {
            return (
                <div className="alert alert-danger" role="alert">
                    <p>{errorMessageRegister}</p>
                </div>
            );
        } else if (messageRegister) {
            return (
                <div className="alert alert-success" role="alert">
                    <p>{messageRegister}</p>
                </div>
            );
        }
    };

    return (
        <>
            <Container className={styles.loginRegisterContainer}>
                <Row className={styles.headerRow}>
                    <Col>
                        <h2 className={styles.header}>MI CUENTA</h2>
                    </Col>
                </Row>
                <Row>
                    {/* Formulario de login */}
                    <Col md={6} className={styles.formContainer}>
                        <h3 className={styles.subHeader}>ACCEDER</h3>
                        <Form onSubmit={handleSubmitLogin} className={styles.form}>
                            {renderMessagesLogin()}
                            <Form.Group controlId="formLoginUsernameOrEmail">
                                <Form.Label>Correo electrónico *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="usernameOrEmail"
                                    value={formDataLogin.usernameOrEmail}
                                    onChange={handleChangeLogin}
                                    className={styles.input}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formLoginPassword">
                                <Form.Label>Contraseña *</Form.Label>
                                <div className={styles.passwordContainer}>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formDataLogin.password}
                                        onChange={handleChangeLogin}
                                        className={styles.input}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={togglePasswordVisibility}
                                    >
                                        <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                                    </button>
                                </div>
                            </Form.Group>
                            <Form.Group controlId="formLoginRememberMe">
                                <Form.Check type="checkbox" label="Recuérdame" />
                            </Form.Group>
                            <Button type="submit" className={styles.loginButton}>
                                ACCEDER
                            </Button>
                            <Link to="/forgot-password" className={styles.forgotPassword}>
                                ¿Olvidaste la contraseña?
                            </Link>
                            <div className={styles.socialLoginButtons}>
                                <Button className={styles.googleButton} onClick={handleGoogleSignInForLogin}>
                                    <img src={googleLogo} alt="google account" className={styles.googleLogo} />
                                    Iniciar sesión con Google
                                </Button>
                            </div>
                        </Form>
                    </Col>
                    {/* Formulario de registro */}
                    <Col md={6} className={styles.formContainer}>
                        <h3 className={styles.subHeader}>REGISTRARSE</h3>
                        <Form onSubmit={handleSubmitRegister} className={styles.form}>
                            {renderMessagesRegister()}
                            <Form.Group controlId="formRegisterEmail">
                                <Form.Label>Correo electrónico *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formDataRegister.email}
                                    onChange={handleChangeRegister}
                                    className={styles.input}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formRegisterUsername">
                                <Form.Label>Nombre de usuario *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={formDataRegister.username}
                                    onChange={handleChangeRegister}
                                    className={styles.input}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formRegisterName">
                                <Form.Label>Nombre *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formDataRegister.name}
                                    onChange={handleChangeRegister}
                                    className={styles.input}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formRegisterLastName">
                                <Form.Label>Apellido *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="last_name"
                                    value={formDataRegister.last_name}
                                    onChange={handleChangeRegister}
                                    className={styles.input}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formRegisterPassword">
                                <Form.Label>Contraseña *</Form.Label>
                                <div className={styles.passwordContainer}>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formDataRegister.password}
                                        onChange={handleChangeRegister}
                                        className={styles.input}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={togglePasswordVisibility}
                                    >
                                        <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                                    </button>
                                </div>
                            </Form.Group>
                            <Form.Group controlId="formRegisterConfirmPassword">
                                <Form.Label>Confirmar Contraseña *</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirmPassword"
                                    value={formDataRegister.confirmPassword}
                                    onChange={handleChangeRegister}
                                    className={styles.input}
                                    required
                                />
                            </Form.Group>
                            <Button type="submit" className={styles.registerButton}>
                                REGISTRARSE
                            </Button>
                            <div className={styles.socialLoginButtons}>
                                <Button className={styles.googleButton} onClick={handleGoogleSignInForRegister}>
                                    <img src={googleLogo} alt="google account" className={styles.googleLogo} />
                                    Registrarse con Google
                                </Button>
                            </div>
                            <p className={styles.privacyPolicy}>
                                Sus datos personales se utilizarán para respaldar su experiencia en este sitio web, para administrar el acceso a su cuenta y para otros fines descritos en nuestra <Link to="/privacy-policy">política de privacidad</Link>.
                            </p>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default LoginRegister;
