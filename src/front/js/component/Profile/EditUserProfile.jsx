import React, { useState, useEffect, useContext } from "react";
// Importa React y los hooks useState, useEffect y useContext para gestionar el estado y efectos secundarios.

import { Context } from '../../store/appContext';
// Importa el contexto global de la aplicación.

import { useNavigate } from "react-router-dom";
// Importa el hook useNavigate de react-router-dom para la navegación entre rutas.

import styles from "./EditUserProfile.module.css";
// Importa los estilos CSS específicos para el componente EditUserProfileEco.

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
// Importa componentes de React Bootstrap para la construcción de la interfaz de usuario: Modal y Button.

const EditUserProfileEco = () => {
    const { store, actions } = useContext(Context);
    // Usa el contexto global para acceder al store y las acciones de la aplicación.

    const navigate = useNavigate();
    // Inicializa el hook useNavigate para redirigir al usuario a diferentes rutas.

    const [formData, setFormData] = useState({
        email: "",
        name: "",
        last_name: "",
        username: "",
        password: ""
    });
    // Estado para manejar los datos del formulario: email, nombre, apellido, nombre de usuario y contraseña.

    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
        // Verifica si el usuario está autenticado obteniendo el estado desde localStorage.

        if (!isAuthenticated) {
            navigate("/");
            // Si el usuario no está autenticado, redirige a la página de inicio.
        }
    }, [navigate]);

    useEffect(() => {
        if (store.uploadedUserData) {
            setFormData({
                email: store.uploadedUserData.email || "",
                name: store.uploadedUserData.name || "",
                last_name: store.uploadedUserData.last_name || "",
                username: store.uploadedUserData.username || "",
                password: ""
            });
            // Si los datos del usuario están cargados, los establece en el formulario.
        }
    }, [store.uploadedUserData]);

    const [show, setShow] = useState(false);
    const [confirmShow, setConfirmShow] = useState(false);
    // Estados para manejar la visibilidad de los modales de edición y confirmación.

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleConfirmClose = () => setConfirmShow(false);
    const handleConfirmShow = () => setConfirmShow(true);
    // Funciones para abrir y cerrar los modales.

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Actualiza los datos del formulario cuando el usuario cambia algún campo.
    };

    const [updateMessage, setUpdateMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false);
    // Estados para manejar los mensajes de actualización y su visibilidad.

    const handleSubmit = async () => {
        const updatedData = Object.keys(formData).reduce((acc, key) => {
            if (formData[key] && (formData[key] !== store.uploadedUserData[key] || (key === 'password' && formData[key]))) {
                acc[key] = formData[key];
            }
            return acc;
        }, {});
        // Prepara los datos que han sido modificados por el usuario para ser enviados al servidor.

        try {
            const result = await actions.updateUserData(updatedData);
            // Llama a la acción para actualizar los datos del usuario en el servidor.

            if (result.success) {
                setUpdateMessage("Actualización realizada con éxito");
                setShowMessage(true);
                // Si la actualización es exitosa, muestra un mensaje de éxito.
            } else {
                setUpdateMessage(result.error || "Error al actualizar los datos");
                setShowMessage(true);
                // Si hay un error, muestra el mensaje de error.
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            setUpdateMessage("Error en el sistema: " + error.message);
            setShowMessage(true);
            // Si ocurre un error en la solicitud, muestra un mensaje de error.
        } finally {
            setTimeout(() => {
                setShowMessage(false);
                setUpdateMessage("");
                handleClose();
                // Después de un breve tiempo, cierra el mensaje y el modal.
            }, 2000);
        }
    };

    const handleConfirm = async () => {
        await handleSubmit();
        handleConfirmClose();
        // Maneja la confirmación de los cambios, enviando los datos y cerrando el modal de confirmación.
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow} className={styles.editButton} title="Edit Profile">
                <i className="fa-solid fa-user-pen"></i>
            </Button>

            <Modal show={show} onHide={handleClose} centered className={styles.modal + " modal-centered"}>
                <Modal.Header className={styles.modalHeader}>
                    <Modal.Title className={styles.modalTitle}>Editar Perfil</Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    <div className={styles.messageContainer}>
                        {showMessage && (
                            <h3 className={styles.updateMessage}><strong>{updateMessage}</strong></h3>
                        )}
                        <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
                            <label>Email</label>
                            <input type="text" name="email" placeholder="Email" className="form-control" value={formData.email} onChange={handleChange} />
                            <label>Nombre</label>
                            <input type="text" name="name" placeholder="Nombre" className="form-control" value={formData.name} onChange={handleChange} />
                            <label>Apellido</label>
                            <input type="text" name="last_name" placeholder="Apellido" className="form-control" value={formData.last_name} onChange={handleChange} />
                            <label>Nombre de usuario</label>
                            <input type="text" name="username" placeholder="Nombre de usuario" className="form-control" value={formData.username} onChange={handleChange} />
                            <label>Contraseña nueva</label>
                            <input type="password" name="password" placeholder="Contraseña nueva" className="form-control" value={formData.password} onChange={handleChange} />
                        </form>
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.modalFooter}>
                    <Button variant="secondary" onClick={handleClose} className={styles.closeButton}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handleConfirmShow} className={styles.saveButton}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={confirmShow} onHide={handleConfirmClose} centered className={styles.modal + " modal-centered"}>
                <Modal.Header className={styles.modalHeader}>
                    <Modal.Title className={styles.modalTitle}>Confirmar Cambios</Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    <p>¿Estás seguro de que deseas guardar los cambios?</p>
                </Modal.Body>
                <Modal.Footer className={styles.modalFooter}>
                    <Button variant="secondary" onClick={handleConfirmClose} className={styles.closeButton}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirm} className={styles.saveButton}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default EditUserProfileEco;
