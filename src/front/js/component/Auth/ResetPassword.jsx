import React, { useContext, useEffect, useState } from 'react';
// Importa React junto con los hooks useContext, useEffect y useState para gestionar el estado y efectos secundarios.

import { Context } from '../../store/appContext';
// Importa el contexto global de la aplicación.

import { useNavigate, useLocation } from "react-router-dom";
// Importa los hooks useNavigate para la navegación y useLocation para obtener la ubicación actual en la URL.

import { Modal, Button, Form, Alert } from 'react-bootstrap';
// Importa componentes de React Bootstrap para la interfaz de usuario: Modal, Button, Form y Alert.

import styles from "./ResetPassword.module.css";
// Importa los estilos CSS específicos para el componente ResetPassword.

import PasswordStrengthMeter from './PasswordStrengthMeter.jsx';


function useQuery() {
    return new URLSearchParams(useLocation().search);
    // Esta función personalizada utiliza useLocation para obtener la búsqueda actual de la URL (lo que viene después del signo "?").
    // Luego, crea y retorna un objeto URLSearchParams que permite acceder a los parámetros de la URL, como 'token'.
}

const ResetPassword = () => {
    const navigate = useNavigate();
    // Inicializa el hook useNavigate para redirigir al usuario a diferentes rutas.

    const query = useQuery();
    const token = query.get('token');
    // Obtiene el valor del parámetro 'token' de la URL usando el objeto URLSearchParams.

    const [password, setPassword] = useState('');
    // Estado para manejar el valor del campo de la nueva contraseña.

    const [confirmPassword, setConfirmPassword] = useState('');
    // Estado para manejar el valor del campo de confirmación de la nueva contraseña.

    const [message, setMessage] = useState('');
    // Estado para manejar los mensajes de éxito.

    const [error, setError] = useState('');
    // Estado para manejar los mensajes de error.

    const [showModal, setShowModal] = useState(false);
    // Estado para manejar la visibilidad del modal.

    const [userId, setUserId] = useState(null);
    // Estado para almacenar el ID del usuario que se obtiene tras la verificación del token.

    const [showPassword, setShowPassword] = useState(false);
    // Estado para mostrar u ocultar la nueva contraseña.

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Estado para mostrar u ocultar la confirmación de la nueva contraseña.

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/verify_reset_token/${token}`, { method: 'POST' });
                // Realiza una petición POST al backend para verificar el token de restablecimiento de contraseña.

                const result = await response.json();
                // Convierte la respuesta del servidor en un objeto JSON.

                if (response.ok) {
                    setUserId(result.user_id);
                    // Si la respuesta es positiva (status 200), almacena el ID del usuario en el estado.
                } else {
                    setError(result.message);
                    // Si la verificación falla, muestra el mensaje de error recibido del servidor.
                }
            } catch (error) {
                //console.error('Error verifying token', error);
                // Registra cualquier error que ocurra durante la verificación del token en la consola.

                setError('Invalid or expired token');
                // Muestra un mensaje de error genérico si ocurre un problema durante la verificación.
            }
        };
        verifyToken();
        // Llama a la función verifyToken al montar el componente para verificar el token.
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Previene el comportamiento predeterminado del formulario, que es recargar la página.

        // Validación de la contraseña
        const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%^&+=*])(?=.*[0-9a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character (#, @, $, %, ^, &, +, =, *).');
            setTimeout(() => {
                setError("")
            }, 5000);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            // Si las contraseñas no coinciden, muestra un mensaje de error.

            setTimeout(() => {
                setError("");
                // Limpia el mensaje de error después de 3 segundos.
            }, 3000);
            return;
        }

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/reset_password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId, password })
                // Realiza una petición PUT al backend con el ID del usuario y la nueva contraseña como cuerpo de la solicitud.
            });

            const result = await response.json();
            // Convierte la respuesta del servidor en un objeto JSON.

            if (response.ok) {
                setMessage(result.message);
                // Si la respuesta es positiva, actualiza el estado con el mensaje de éxito.

                setError('');
                // Limpia cualquier mensaje de error previo.

                setShowModal(true);
                // Muestra el modal confirmando que la contraseña fue restablecida.

                setTimeout(() => {
                    navigate('/login-register');
                    // Redirige al usuario a la página de login/register después de 1.5 segundos.
                }, 1500);

            } else {
                setError(result.error);
                // Si la solicitud falla, muestra el mensaje de error recibido del servidor.

                setMessage('');
                // Limpia cualquier mensaje de éxito previo.
            }
        } catch (error) {
            //console.error('Error reset request', error);
            // Maneja cualquier error que ocurra durante la solicitud de restablecimiento y lo registra en la consola.

            setError('An error occurred while resetting password');
            // Actualiza el estado de error con un mensaje genérico.

            setMessage('');
            // Limpia cualquier mensaje de éxito previo.
        }
    };

    if (!userId && !error) {
        return <div>Loading...</div>;
        // Si no hay ID de usuario y no hay error, muestra un mensaje de "Cargando..." mientras se verifica el token.
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        // Alterna la visibilidad de la nueva contraseña.
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
        // Alterna la visibilidad de la confirmación de la nueva contraseña.
    };

    return (
        <>

            <div className={styles.container}>
                <div className={styles.resetPassword}>
                    <h2 className={styles.h2}>Reinicio de Contraseña</h2>
                    <Form onSubmit={handleSubmit} className={styles.form}>
                        <PasswordStrengthMeter password={password} />

                        <Form.Group>
                            <Form.Label className={styles.label}>Nueva Contraseña</Form.Label>
                            <div className={styles.passwordContainer}>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        <Form.Group>
                            <Form.Label className={styles.label}>Confirmar Contraseña:</Form.Label>
                            <div className={styles.passwordContainer}>
                                <Form.Control
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    <i className={showConfirmPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                                </button>
                            </div>
                        </Form.Group>
                        <Button variant="primary" type="submit" className={styles.button}>Enviar nueva contraseña</Button>
                    </Form>
                    {message && <Alert variant="success" className={styles.message}>{message}</Alert>}
                    {error && <Alert variant="danger" className={styles.error}>{error}</Alert>}
                    <Modal show={showModal} onHide={() => setShowModal(false)} className={styles.modal}>
                        <div className={styles.modalNotification}>
                            <Modal.Header closeButton>
                                <Modal.Title>Password Reset Successful</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>{message}</p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" onClick={() => setShowModal(false)}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </div>
                    </Modal>
                </div>
            </div>

        </>
    );
};

export default ResetPassword; 
