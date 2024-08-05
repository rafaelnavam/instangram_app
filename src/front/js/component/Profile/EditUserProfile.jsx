import React, { useState, useEffect, useContext } from "react";
import { Context } from '../../store/appContext';
import styles from "./EditUserProfile.module.css"; // Importación de estilos CSS
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const EditUserProfileEco = () => {
    const { store, actions } = useContext(Context);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        last_name: "",
        username: "",
        password: ""
    });

    useEffect(() => {
        if (store.uploadedUserData) {
            setFormData({
                email: store.uploadedUserData.email || "",
                name: store.uploadedUserData.name || "",
                last_name: store.uploadedUserData.last_name || "",
                username: store.uploadedUserData.username || "",
                password: ""
            });
        }
    }, [store.uploadedUserData]);

    const [show, setShow] = useState(false);
    const [confirmShow, setConfirmShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleConfirmClose = () => setConfirmShow(false);
    const handleConfirmShow = () => setConfirmShow(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [updateMessage, setUpdateMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false);

    const handleSubmit = async () => {
        const updatedData = Object.keys(formData).reduce((acc, key) => {
            if (formData[key] && (formData[key] !== store.uploadedUserData[key] || key === 'password' && formData[key])) {
                acc[key] = formData[key];
            }
            return acc;
        }, {});

        try {
            const result = await actions.updateUserData(updatedData);
            console.log(result)
            if (result.success) {
                setUpdateMessage("Actualización realizada con éxito");
                setShowMessage(true);
            } else {
                setUpdateMessage(result.error || "Error al actualizar los datos");
                setShowMessage(true);
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            setUpdateMessage("Error en el sistema: " + error.message);
            setShowMessage(true);
        } finally {
            setTimeout(() => {
                setShowMessage(false);
                setUpdateMessage("");
                handleClose();
            }, 2000);
        }
    };

    const handleConfirm = async () => {
        await handleSubmit();
        handleConfirmClose();
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
