import React, { useContext, useEffect, useState } from 'react';
// Importa React junto con useContext, useEffect y useState hooks para gestionar estado y efectos secundarios.

import { Context } from '../../store/appContext.js';
// Importa el contexto global de la aplicación.

import { useNavigate } from "react-router-dom";
// Importa el hook useNavigate para la navegación entre rutas.

import { Modal, Button, Form, Alert } from 'react-bootstrap';
// Importa componentes de React Bootstrap para construir la interfaz de usuario.

import styles from "./PasswordResetRequest.module.css";
// Importa los estilos CSS específicos para el componente PasswordResetRequest.

const PasswordResetRequest = () => {
    const navigate = useNavigate();
    // Inicializa el hook useNavigate para redirigir al usuario a diferentes rutas.

    const [email, setEmail] = useState('');
    // Define el estado para manejar el valor del campo de email.

    const [message, setMessage] = useState('');
    // Define el estado para manejar los mensajes de éxito.

    const [error, setError] = useState('');
    // Define el estado para manejar los mensajes de error.

    const [showModal, setShowModal] = useState(false);
    // Define el estado para manejar la visibilidad del modal.

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Previene el comportamiento predeterminado del formulario, que es recargar la página.

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/tokenLoginHelp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
                // Realiza una petición POST al backend con el email del usuario como cuerpo de la solicitud.
            });

            const result = await response.json();
            // Convierte la respuesta del servidor en un objeto JSON.

            if (response.ok) {
                setMessage(result.message);
                // Si la respuesta del servidor es positiva (status 200), actualiza el estado con el mensaje de éxito.

                setError('');
                // Limpia cualquier mensaje de error previo.

                setShowModal(true);
                // Muestra el modal confirmando que el correo de restablecimiento de contraseña fue enviado.

                setTimeout(() => {
                    navigate('/login-Register');
                    // Redirige al usuario a la página de login/register después de 3 segundos.
                }, 3000);
            } else {
                setError(result.error);
                // Si la respuesta no es positiva, muestra el mensaje de error recibido del servidor.

                setMessage('');
                // Limpia cualquier mensaje de éxito previo.
            }
        } catch (error) {
            //console.error('Error reset request', error);
            // Maneja cualquier error que ocurra durante la solicitud y lo registra en la consola.

            setError('An error occurred while requesting password reset');
            // Actualiza el estado de error con un mensaje de error genérico.

            setMessage('');
            // Limpia cualquier mensaje de éxito previo.
        }
    };

    return (
        <>

            <div className={styles.container}>
                <div className={styles['password-reset-request']}>
                    <h2 className={styles.h2}>Forgot Password</h2>
                    <Form onSubmit={handleSubmit} className={styles.form}>
                        <Form.Group>
                            <Form.Label className={styles.label}>Email:</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className={styles.button}>Send Reset Email</Button>
                    </Form>
                    {message && <Alert variant="success" className={styles.message}>{message}</Alert>}
                    {error && <Alert variant="danger" className={styles.error}>{error}</Alert>}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <div className={styles.modalNotification}>
                            <Modal.Header closeButton>
                                <Modal.Title>Password Reset Email Sent</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>{message}</p>
                            </Modal.Body>
                            <Modal.Footer>
                                {/* <Button variant="primary" onClick={() => setShowModal(false)}>
                                        Close
                                    </Button> */}
                            </Modal.Footer>
                        </div>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default PasswordResetRequest; 
