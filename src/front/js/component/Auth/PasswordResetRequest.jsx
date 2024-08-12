import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../../store/appContext.js';
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import styles from "./PasswordResetRequest.module.css";


const PasswordResetRequest = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/tokenLoginHelp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const result = await response.json();
            if (response.ok) {
                setMessage(result.message);
                setError('');
                setShowModal(true);

                setTimeout(() => {
                    navigate('/login-Register');
                }, 3000);
            } else {
                setError(result.error);
                setMessage('');
            }
        } catch (error) {
            console.error('Error reset request', error);
            setError('An error occurred while requesting password reset');
            setMessage('');
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
