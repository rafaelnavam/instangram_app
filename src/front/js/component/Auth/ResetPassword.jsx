import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../../store/appContext';
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import styles from "./ResetPassword.module.css";



function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
    const navigate = useNavigate();

    const query = useQuery();
    const token = query.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [userId, setUserId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/verify_reset_token/${token}`, { method: 'POST' });
                const result = await response.json();
                if (response.ok) {
                    setUserId(result.user_id);
                } else {
                    setError(result.message);
                }
            } catch (error) {
                console.error('Error verifying token', error);
                setError('Invalid or expired token');
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setTimeout(() => {
                setError("");
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
            });
            const result = await response.json();
            if (response.ok) {
                setMessage(result.message);
                setError('');
                setShowModal(true);

                setTimeout(() => {
                    navigate('/Login');
                }, 1500);

            } else {
                setError(result.error);
                setMessage('');
            }
        } catch (error) {
            console.error('Error reset request', error);
            setError('An error occurred while resetting password');
            setMessage('');
        }
    };

    if (!userId && !error) {
        return <div>Loading...</div>;
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <>

            <div className={styles.container}>
                <div className={styles.resetPassword}>
                    <h2 className={styles.h2}>Reset Password</h2>
                    <Form onSubmit={handleSubmit} className={styles.form}>
                        <Form.Group>
                            <Form.Label className={styles.label}>New Password:</Form.Label>
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
                            <Form.Label className={styles.label}>Confirm Password:</Form.Label>
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
                        <Button variant="primary" type="submit" className={styles.button}>Reset Password</Button>
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
