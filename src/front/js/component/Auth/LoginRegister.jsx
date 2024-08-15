// Importa las dependencias necesarias de React y otros módulos
import React, { useContext, useEffect, useState } from 'react'; // Importa React junto con los hooks useContext, useEffect y useState para gestionar el contexto, efectos secundarios y estado.

import { Context } from '../../store/appContext'; // Importa el contexto global de la aplicación desde appContext.

import { Form, Button, Row, Col, Container, Modal } from 'react-bootstrap'; // Importa componentes de React Bootstrap para construir la interfaz de usuario: Form, Button, Row, Col, Container, Modal.

import { Link, useNavigate } from 'react-router-dom'; // Importa utilidades de React Router para el enlace (Link) y la navegación (useNavigate).

import { auth, provider } from './firebase'; // Importa la configuración de Firebase y los métodos de autenticación desde el archivo firebase.
import { signInWithPopup } from "firebase/auth"; // Importa el método signInWithPopup para la autenticación con ventanas emergentes.

import styles from './LoginRegister.module.css'; // Importa los estilos CSS específicos del componente desde LoginRegister.module.css.

import googleLogo from '../../../../../public/images/google-color-svgrepo-com.png'; // Importa el logo de Google para usarlo en los botones de autenticación.

const LoginRegister = () => { // Define el componente funcional LoginRegister.
    const { actions, store } = useContext(Context); // Usa el contexto global para acceder a las acciones y el store de la aplicación.
    const navigate = useNavigate(); // Hook para la navegación entre rutas.

    useEffect(() => { // Hook de efecto para desplazarse al inicio de la página al cargar.
        window.scrollTo(0, 0); // Desplaza la ventana al inicio.
    }, [errorMessageRegister, messageRegister, errorMessageLogin, messageLogin, navigate]); // El efecto se ejecuta cuando alguno de estos estados cambia.

    const [formDataLogin, setFormDataLogin] = useState({ // Estado para los datos del formulario de login.
        usernameOrEmail: '', // Campo para el nombre de usuario o correo electrónico.
        password: '', // Campo para la contraseña.
    });

    const [formDataRegister, setFormDataRegister] = useState({ // Estado para los datos del formulario de registro.
        email: '', // Campo para el correo electrónico.
        password: '', // Campo para la contraseña.
        confirmPassword: '', // Campo para confirmar la contraseña.
        username: '', // Campo para el nombre de usuario.
        name: '', // Campo para el nombre.
        last_name: '' // Campo para el apellido.
    });

    const [errorMessageRegister, setErrorMessageRegister] = useState(""); // Estado para los mensajes de error en el registro.
    const [messageRegister, setMessageRegister] = useState(""); // Estado para los mensajes exitosos en el registro.
    const [errorMessageLogin, setErrorMessageLogin] = useState(""); // Estado para los mensajes de error en el login.
    const [messageLogin, setMessageLogin] = useState(""); // Estado para los mensajes exitosos en el login.

    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar u ocultar la contraseña.

    const handleChangeLogin = (e) => { // Maneja los cambios en el formulario de login.
        setFormDataLogin({ ...formDataLogin, [e.target.name]: e.target.value }); // Actualiza el estado con el valor ingresado.
    };

    const handleChangeRegister = (e) => { // Maneja los cambios en el formulario de registro.
        setFormDataRegister({ ...formDataRegister, [e.target.name]: e.target.value }); // Actualiza el estado con el valor ingresado.
    };

    const handleSubmitLogin = async (e) => { // Maneja el envío del formulario de login.
        e.preventDefault(); // Previene la acción por defecto del formulario.
        await actions.loginUserV2(formDataLogin.usernameOrEmail, formDataLogin.password); // Llama a la acción para iniciar sesión con el nombre de usuario o correo y contraseña.
        await actions.loadUserData(); // Carga los datos del usuario.

        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated')); // Verifica si el usuario está autenticado leyendo del localStorage.
        if (isAuthenticated) { // Si está autenticado, navega a la página de la cuenta.
            navigate('/my-account');
        } else { // Si no, muestra un mensaje de error.
            setErrorMessageLogin("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
            setTimeout(() => {
                setErrorMessageLogin(""); // Limpia el mensaje de error después de 4 segundos.
            }, 4000);
        }
    };

    const handleSubmitRegister = async (e) => { // Maneja el envío del formulario de registro.
        e.preventDefault(); // Previene la acción por defecto del formulario.

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar el formato del email.
        if (!emailRegex.test(formDataRegister.email)) { // Si el email no es válido, muestra un mensaje de error.
            setErrorMessageRegister("Por favor, introduce una dirección de correo electrónico válida.");
            setTimeout(() => {
                setErrorMessageRegister(""); // Limpia el mensaje de error después de 5 segundos.
            }, 5000);
            return; // Detiene el proceso de registro.
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

        if (formDataRegister.password !== formDataRegister.confirmPassword) { // Verifica si las contraseñas coinciden.
            setErrorMessageRegister("Las contraseñas no coinciden.");
            setTimeout(() => {
                setErrorMessageRegister(""); // Limpia el mensaje de error después de 3 segundos.
            }, 3000);
            return; // Detiene el proceso de registro.
        }

        const newUserDetails = { // Crea un objeto con los detalles del nuevo usuario.
            email: formDataRegister.email, // Email del usuario.
            password: formDataRegister.password, // Contraseña del usuario.
            username: formDataRegister.username, // Nombre de usuario.
            name: formDataRegister.name, // Nombre del usuario.
            last_name: formDataRegister.last_name // Apellido del usuario.
        };

        const result = await actions.createUser(newUserDetails); // Llama a la acción para crear un nuevo usuario.
        if (result) { // Si la creación fue exitosa, muestra un mensaje de éxito.
            setMessageRegister("Registro exitoso. Por favor, revisa tu correo electrónico para activar tu cuenta.");
            setFormDataRegister({ email: '', password: '', confirmPassword: '', username: '', name: '', last_name: '' }); // Limpia el formulario.

            setTimeout(() => {
                setMessageRegister(""); // Limpia el mensaje de éxito después de 3 segundos.
            }, 3000);
        } else { // Si hubo un error, muestra el mensaje de error.
            setErrorMessageRegister(store.creationState.error);

            setTimeout(() => {
                setErrorMessageRegister(""); // Limpia el mensaje de error después de 3 segundos.
            }, 3000);
        }
    };

    const handleModalClose = () => { // Cierra el modal.
        setModalVisible(false); // Oculta el modal.
        if (store.creationState.message) { // Si hay un mensaje de éxito, navega a la página de la cuenta.
            navigate("/my-account");
        }
    };

    const togglePasswordVisibility = () => { // Alterna la visibilidad de la contraseña.
        setShowPassword(!showPassword); // Cambia el estado entre mostrar y ocultar la contraseña.
    };

    useEffect(() => { // Hook de efecto para verificar la autenticación del usuario al cargar el componente.
        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated')); // Verifica si el usuario está autenticado leyendo del localStorage.
        if (isAuthenticated) { // Si está autenticado, navega a la página de la cuenta.
            navigate('/my-account');
        }
    }, [navigate]); // El efecto se ejecuta cuando el valor de navigate cambia.

    const handleGoogleSignInForLogin = () => { // Maneja el inicio de sesión con Google para el login.
        signInWithPopup(auth, provider) // Abre una ventana emergente para iniciar sesión con Google.
            .then(async (result) => { // Si la autenticación es exitosa, obtiene el usuario.
                const user = result.user; // Obtiene el usuario autenticado.

                const userExists = await actions.checkIfUserExists(user.email); // Verifica si el usuario ya existe en la base de datos.

                if (userExists) { // Si el usuario existe, inicia sesión.
                    const loginResult = await actions.loginUserWithGoogle(user.email, user.uid); // Inicia sesión con Google.

                    if (loginResult) { // Si el inicio de sesión es exitoso, muestra un mensaje de éxito.
                        setMessageLogin("Tus datos son correctos.");

                        setTimeout(() => { // Navega a la página de la cuenta después de 2 segundos.
                            navigate("/my-account");
                            setMessageLogin(""); // Limpia el mensaje de éxito.
                        }, 2000);
                    } else { // Si hay un error al iniciar sesión, muestra un mensaje de error.
                        setErrorMessageLogin("Error al iniciar sesión con Google. Inténtalo de nuevo.");
                        setTimeout(() => {
                            setErrorMessageLogin(""); // Limpia el mensaje de error después de 2 segundos.
                        }, 2000);
                    }
                } else { // Si el usuario no existe, muestra un mensaje de error.
                    setErrorMessageLogin("No se encontró una cuenta con este correo electrónico. Regístrate primero.");
                    setTimeout(() => {
                        setErrorMessageLogin(""); // Limpia el mensaje de error después de 2 segundos.
                    }, 2000);
                }
            })
            .catch((error) => { // Si hay un error durante la autenticación, muestra un mensaje de error.
                setErrorMessageLogin("Error al autenticar con Google. Inténtalo de nuevo.");
                setTimeout(() => {
                    setErrorMessageLogin(""); // Limpia el mensaje de error después de 2 segundos.
                }, 2000);
            });
    };

    const handleGoogleSignInForRegister = () => { // Maneja el registro con Google.
        signInWithPopup(auth, provider) // Abre una ventana emergente para registrarse con Google.
            .then(async (result) => { // Si la autenticación es exitosa, obtiene el usuario.
                const user = result.user; // Obtiene el usuario autenticado.

                const userExists = await actions.checkIfUserExists(user.email); // Verifica si el usuario ya existe en la base de datos.

                if (!userExists) { // Si el usuario no existe, lo crea.
                    const newUserDetails = { // Crea un objeto con los detalles del nuevo usuario.
                        email: user.email, // Email del usuario.
                        username: `${user.displayName}${Math.floor(Math.random() * 9000) + 1000}`, // Nombre de usuario único.
                        name: user.displayName, // Nombre del usuario.
                        googleId: user.uid, // ID de Google del usuario.
                        is_active: true // Activa la cuenta directamente.
                    };

                    const registrationResult = await actions.createUser(newUserDetails); // Llama a la acción para crear un nuevo usuario.

                    if (registrationResult) { // Si la creación fue exitosa, muestra un mensaje de éxito.
                        setMessageRegister("Registro exitoso. Bienvenido!");
                        setTimeout(() => {
                            setMessageRegister(""); // Limpia el mensaje de éxito después de 2.5 segundos.
                        }, 2500);
                    } else { // Si hubo un error, muestra un mensaje de error.
                        setErrorMessageRegister("Error al registrar el usuario. Inténtalo de nuevo.");
                        setTimeout(() => {
                            setErrorMessageRegister(""); // Limpia el mensaje de error después de 2 segundos.
                        }, 2000);
                    }
                } else { // Si el usuario ya existe, muestra un mensaje de error.
                    setErrorMessageRegister("Ya existe una cuenta con este correo electrónico. Inicia sesión en su lugar.");
                    setTimeout(() => {
                        setErrorMessageRegister(""); // Limpia el mensaje de error después de 5 segundos.
                    }, 5000);
                }
            })
            .catch((error) => { // Si hay un error durante la autenticación, muestra un mensaje de error.
                setErrorMessageRegister("Error al autenticar con Google. Inténtalo de nuevo.");
                setTimeout(() => {
                    setErrorMessageRegister(""); // Limpia el mensaje de error después de 3 segundos.
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
