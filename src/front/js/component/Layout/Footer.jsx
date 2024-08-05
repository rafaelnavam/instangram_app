import React, { useContext, useEffect, useState } from 'react'; // Importa las funciones necesarias de React.
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';
import facebookIcon from '../../../../../public/images/facebook-color-svgrepo-com.png';
import instagramIcon from '../../../../../public/images/instagram-2016-logo-svgrepo-com.png';
import emailIcon from '../../../../../public/images/email-svgrepo-com.png';
import paypalIcon from '../../../../../public/images/paypal-3-svgrepo-com.png';
import binanceIcon from '../../../../../public/images/binance-svgrepo-com.png';
import transferBank from '../../../../../public/images/bbva-svgrepo-com.png';


const Footer = () => {

    return (
        <footer className={styles.footer}>
            <Container>
                <Row>
                    <Col xs={12} md={4} className="mb-4 mb-md-0">
                        <h5 className={styles.title}>ACERCA DE NOSOTROS</h5>
                        <ul className={styles.list}>
                            <li>Nuestra Empresa</li>
                            <li>Visión</li>
                            <li>Marcas</li>
                            <li>#entrenocomounpro</li>
                            <li>Redes sociales:</li>
                        </ul>
                        <div className={styles.socialIcons}>
                            <img src={facebookIcon} alt="Facebook" className={styles.socialIcon} />
                            <img src={instagramIcon} alt="Instagram" className={styles.socialIcon} />
                            <img src={emailIcon} alt="Email" className={styles.socialIcon} />
                        </div>
                    </Col>
                    <Col xs={12} md={4} className="mb-4 mb-md-0">
                        <h5 className={styles.title}>SERVICIO AL CLIENTE</h5>
                        <ul className={styles.list}>
                            <li className={styles.liActive} onClick={() => setShowContactForm(true)}>Contacto</li>
                            <Link to="/Check-order">
                                <li className={styles.liActive}>Ver status de compra</li>
                            </Link>
                            <li>Dirección de Tiendas</li>
                            <li>Preguntas Frecuentes</li>
                            <Link to="/terms-and-conditions">
                                <li className={styles.liActive}>Términos y Condiciones</li>
                            </Link>
                            <Link to="/privacy-policy">
                                <li className={styles.liActive}>Política de Privacidad</li>
                            </Link>
                        </ul>
                    </Col>
                    <Col xs={12} md={4}>
                        <h5 className={styles.title}>SUSCRÍBETE A NUESTRO NEWSLETTER</h5>
                        <p>Infórmate de lo último de nuestra tienda. Nuestras ofertas, nuevos productos y novedades directamente en tu e-mail.</p>
                        <Form className={styles.newsletterForm}>
                            <Form.Control type="email" placeholder="Ingresa tu email" className={styles.newsletterInput} />
                            <Button variant="danger" className={styles.subscribeButton}>SUSCRÍBETE</Button>
                        </Form>
                        <div className={styles.paymentIcons}>
                            <img src={paypalIcon} alt="PayPal" className={styles.icon} />
                            <img src={binanceIcon} alt="Binance" className={styles.icon} />
                            <img src={transferBank} alt="Transfer Bank" className={styles.icon} />
                        </div>
                    </Col>
                </Row>
                <Row className="text-center mt-3">
                    <Col>
                        <p>Todos los derechos reservados 2024 © <strong>Momentum Store</strong></p>
                    </Col>
                </Row>


            </Container>
        </footer>
    );
};

export default Footer;
