import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <Container>
                <Row>
                    <Col className={styles.footerLinks}>
                        <a href="#!">Información</a>
                        <a href="#!">Blog</a>
                        <a href="#!">Empleo</a>
                        <a href="#!">Ayuda</a>
                        <a href="#!">Privacidad</a>
                        <a href="#!">Privacidad de salud del consumidor</a>
                        <a href="#!">Condiciones</a>
                        <a href="#!">Ubicaciones</a>
                        <a href="#!">Instagram sample</a>
                        <a href="#!">Threads</a>
                        <a href="#!">Importación de contactos y no usuarios</a>
                        <a href="#!">Meta Verified</a>
                    </Col>
                </Row>
                <Row className="text-center mt-3">
                    <Col>
                        <p className={styles.footerText}>Español <span>&copy; 2024 Instagram sample from rafael nava</span></p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
