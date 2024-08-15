// Importa las dependencias necesarias de React y otros módulos
import React, { useContext, useEffect, useState } from 'react';
// Importa el contexto global desde el store de la aplicación
import { Context } from '../../store/appContext';
// Importa componentes de la biblioteca React Bootstrap para diseñar la UI
import { Form, Button, Row, Col, Container, Modal } from 'react-bootstrap';
// Importa utilidades de React Router para navegación y enlaces
import { Link, useNavigate } from 'react-router-dom';
// Importa la configuración de Firebase y los métodos de autenticación
import { auth, provider } from './firebase'; // Asegúrate de que la ruta es correcta
import { signInWithPopup } from "firebase/auth";
// Importa los estilos CSS específicos del componente
import styles from './LoginRegister.module.css';
// Importa el logo de Google para el botón de inicio de sesión con Google
import googleLogo from '../../../../../public/images/google-color-svgrepo-com.png';

// Define el componente funcional LoginRegister
const LoginRegister = () => {
    // Usa el contexto global para acceder a las acciones y el store
    const { actions, store } = useContext(Context);
    // Hook para la navegación entre rutas
    const navigate = useNavigate();

    // Hook de efecto para desplazar la ventana al inicio de la página al cargar el componente
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [errorMessageRegister, messageRegister, errorMessageLogin, messageLogin]);

    // Estado para manejar los datos del formulario de login
    const [formDataLogin, setFormDataLogin] = useState({
        usernameOrEmail: '', // Campo para el nombre de usuario o correo electrónico
        password: '', // Campo para la contraseña
    });

    // Estado para manejar los datos del formulario de registro
    const [formDataRegister, setFormDataRegister] = useState({
        email: '', // Campo para el correo electrónico
        password: '', // Campo para la contraseña
        confirmPassword: '', // Campo para confirmar la contraseña
        username: '', // Campo para el nombre de usuario
        name: '', // Campo para el nombre
        last_name: '' // Campo para el apellido
    });

    // Estado para manejar los mensajes de error y éxito en el registro y login
    const [errorMessageRegister, setErrorMessageRegister] = useState("");
    const [messageRegister, setMessageRegister] = useState("");
    const [errorMessageLogin, setErrorMessageLogin] = useState("");
    const [messageLogin, setMessageLogin] = useState("");

    // Estado para mostrar u ocultar la contraseña en los formularios
    const [showPassword, setShowPassword] = useState(false);

    // Maneja los cambios en los campos del formulario de login
    const handleChangeLogin = (e) => {
        setFormDataLogin({ ...formDataLogin, [e.target.name]: e.target.value });
        // Actualiza el estado con los valores actuales del formulario
    };

    // Maneja los cambios en los campos del formulario de registro
    const handleChangeRegister = (e) => {
        setFormDataRegister({ ...formDataRegister, [e.target.name]: e.target.value });
        // Actualiza el estado con los valores actuales del formulario
    };

    // Maneja el envío del formulario de login
    const handleSubmitLogin = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        await actions.loginUserV2(formDataLogin.usernameOrEmail, formDataLogin.password);
        // Llama a la acción para iniciar sesión con el nombre de usuario o email y contraseña
        await actions.loadUserData();
        // Carga los datos del usuario después de iniciar sesión

        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated'));
        // Verifica si el usuario está autenticado revisando el valor en localStorage
        if (isAuthenticated) {
            navigate('/my-account'); // Si está autenticado, redirige a la página de la cuenta del usuario
        } else {
            setErrorMessageLogin("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
            // Si las credenciales son incorrectas, muestra un mensaje de error
            setTimeout(() => {
                setErrorMessageLogin(""); // Limpia el mensaje de error después de 4 segundos
            }, 4000);
        }
    };

    // Maneja el envío del formulario de registro
    const handleSubmitRegister = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario

        // Validación del email usando una expresión regular
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formDataRegister.email)) {
            setErrorMessageRegister("Por favor, introduce una dirección de correo electrónico válida.");
            // Muestra un mensaje de error si el email no es válido
            setTimeout(() => {
                setErrorMessageRegister(""); // Limpia el mensaje de error después de 5 segundos
            }, 5000);
            return; // Sale de la función para prevenir el envío del formulario
        }

        // Validación de la contraseña
        const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%^&+=*])(?=.*[0-9a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(formDataRegister.password)) {
            setErrorMessageRegister("Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character (#, @, $, %, ^, &, +, =, *).");
            setTimeout(() => {
                setErrorMessageRegister("")
            }, 5000);
            return;
        }

        // Verifica si las contraseñas coinciden
        if (formDataRegister.password !== formDataRegister.confirmPassword) {
            setErrorMessageRegister("Las contraseñas no coinciden.");
            // Muestra un mensaje de error si las contraseñas no coinciden
            setTimeout(() => {
                setErrorMessageRegister(""); // Limpia el mensaje de error después de 3 segundos
            }, 3000);
            return; // Sale de la función para prevenir el envío del formulario
        }

        // Detalles del nuevo usuario que se enviarán para crear la cuenta
        const newUserDetails = {
            email: formDataRegister.email,
            password: formDataRegister.password,
            username: formDataRegister.username,
            name: formDataRegister.name,
            last_name: formDataRegister.last_name
        };

        // Crea el nuevo usuario llamando a la acción correspondiente
        const result = await actions.createUser(newUserDetails);
        if (result) {
            setMessageRegister("Registro exitoso. Por favor, revisa tu correo electrónico para activar tu cuenta.");
            // Muestra un mensaje de éxito y resetea los campos del formulario
            setFormDataRegister({ email: '', password: '', confirmPassword: '', username: '', name: '', last_name: '' });

            setTimeout(() => {
                setMessageRegister(""); // Limpia el mensaje de éxito después de 3 segundos
            }, 3000);
        } else {
            setErrorMessageRegister(store.creationState.error);
            // Muestra el mensaje de error almacenado en el estado global si la creación falla

            setTimeout(() => {
                setErrorMessageRegister(""); // Limpia el mensaje de error después de 3 segundos
            }, 3000);
        }
    };

    // Cierra el modal que podría estar mostrando mensajes o formularios
    const handleModalClose = () => {
        setModalVisible(false); // Cambia el estado para cerrar el modal
        if (store.creationState.message) {
            navigate("/my-account"); // Navega a la cuenta del usuario si hay un mensaje de éxito
        }
    };

    // Alterna la visibilidad de la contraseña en los formularios
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword); // Invierte el estado para mostrar u ocultar la contraseña
    };

    // Hook de efecto para verificar la autenticación del usuario cuando se carga el componente
    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated'));
        if (isAuthenticated) {
            navigate('/my-account'); // Redirige a la cuenta del usuario si está autenticado
        }
    }, [navigate]); // El efecto depende de navigate

    // Maneja el inicio de sesión con Google para login
    const handleGoogleSignInForLogin = () => {
        signInWithPopup(auth, provider) // Usa Firebase para autenticar con Google a través de un popup
            .then(async (result) => {
                const user = result.user;
                // Verifica si el usuario ya existe en la base de datos
                const userExists = await actions.checkIfUserExists(user.email);

                if (userExists) {
                    // Si el usuario ya existe, iniciar sesión
                    const loginResult = await actions.loginUserWithGoogle(user.email, user.uid);
                    if (loginResult) {
                        setMessageLogin("Tus datos son correctos."); // Muestra un mensaje de éxito

                        setTimeout(() => {
                            navigate("/my-account"); // Redirige a la cuenta del usuario después de 2 segundos
                            setMessageLogin(""); // Limpia el mensaje de éxito
                        }, 2000);
                    } else {
                        setErrorMessageLogin("Error al iniciar sesión con Google. Inténtalo de nuevo.");
                        setTimeout(() => {
                            setErrorMessageLogin(""); // Limpia el mensaje de error después de 2 segundos
                        }, 2000);
                    }
                } else {
                    setErrorMessageLogin("No se encontró una cuenta con este correo electrónico. Regístrate primero.");
                    setTimeout(() => {
                        setErrorMessageLogin(""); // Limpia el mensaje de error después de 2 segundos
                    }, 2000);
                }
            })
            .catch((error) => {
                setErrorMessageLogin("Error al autenticar con Google. Inténtalo de nuevo.");
                setTimeout(() => {
                    setErrorMessageLogin(""); // Limpia el mensaje de error después de 2 segundos
                }, 2000);
            });
    };

    // Maneja el registro con Google
    const handleGoogleSignInForRegister = () => {
        signInWithPopup(auth, provider) // Usa Firebase para autenticar con Google a través de un popup
            .then(async (result) => {
                const user = result.user;
                // Verifica si el usuario ya existe en la base de datos
                const userExists = await actions.checkIfUserExists(user.email);

                if (!userExists) {
                    // Si el usuario no existe, crearlo
                    const newUserDetails = {
                        email: user.email,
                        username: `${user.displayName}${Math.floor(Math.random() * 9000) + 1000}`,
                        // Genera un nombre de usuario único usando el displayName y un número aleatorio
                        name: user.displayName,
                        googleId: user.uid,
                        is_active: true // Marca el usuario como activo
                    };

                    const registrationResult = await actions.createUser(newUserDetails);
                    if (registrationResult) {
                        setMessageRegister("Registro exitoso. Bienvenido!");
                        setTimeout(() => {
                            setMessageRegister(""); // Limpia el mensaje de éxito después de 2.5 segundos
                        }, 2500);
                    } else {
                        setErrorMessageRegister("Error al registrar el usuario. Inténtalo de nuevo.");
                        setTimeout(() => {
                            setErrorMessageRegister(""); // Limpia el mensaje de error después de 2 segundos
                        }, 2000);
                    }
                } else {
                    setErrorMessageRegister("Ya existe una cuenta con este correo electrónico. Inicia sesión en su lugar.");
                    setTimeout(() => {
                        setErrorMessageRegister(""); // Limpia el mensaje de error después de 5 segundos
                    }, 5000);
                }
            })
            .catch((error) => {
                setErrorMessageRegister("Error al autenticar con Google. Inténtalo de nuevo.");
                setTimeout(() => {
                    setErrorMessageRegister(""); // Limpia el mensaje de error después de 3 segundos
                }, 3000);
            });
    };

    // Renderiza los mensajes de error o éxito para el login
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

    // Renderiza los mensajes de error o éxito para el registro
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
                                Es posible que las personas que usan nuestro servicio hayan subido tu información de contacto a Instagram sample.
                            </p>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default LoginRegister;
