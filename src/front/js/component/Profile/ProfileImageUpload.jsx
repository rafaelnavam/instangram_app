import React, { useContext, useState } from 'react';
// Importa React junto con los hooks useContext y useState para gestionar el estado y el contexto.

import { Context } from '../../store/appContext';
// Importa el contexto global de la aplicación.

import { Button, Modal, Form, Dropdown } from 'react-bootstrap';
// Importa componentes de React Bootstrap para la construcción de la interfaz de usuario: Button, Modal, Form.

import styles from './ProfileImageUpload.module.css';
// Importa los estilos CSS específicos para el componente ProfileImageUploadEco.

const ProfileImageUploadEco = ({ show, onHide }) => {
    // Componente funcional que recibe dos props: show para controlar la visibilidad del modal y onHide para manejar el cierre del modal.

    const { store, actions } = useContext(Context);
    // Usa el contexto global para acceder al store y las acciones de la aplicación.

    const [file, setFile] = useState(null);
    // Estado para almacenar el archivo de imagen seleccionado por el usuario.

    const [modalAction, setModalAction] = useState('');
    // Estado para determinar la acción que se está realizando (subir, actualizar o eliminar imagen).

    const [resultModalVisible, setResultModalVisible] = useState(false);
    // Estado para controlar la visibilidad del modal de resultados.

    const [resultModalMessage, setResultModalMessage] = useState('');
    // Estado para almacenar el mensaje que se mostrará en el modal de resultados.

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        // Maneja el cambio en la selección del archivo, actualizando el estado con el archivo seleccionado.
    };

    const handleResultModalClose = () => {
        setResultModalVisible(false);
        // Cierra el modal de resultados.
    };

    const handleUpload = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            // Crea un objeto FormData y añade el archivo de imagen seleccionado.

            const result = await actions.uploadProfileImage(formData);
            // Llama a la acción para subir la imagen de perfil.

            if (result.success) {
                setResultModalMessage('Profile image uploaded successfully');
                setResultModalVisible(true);
                onHide();
                setTimeout(() => window.location.reload(), 2000);
                // Si la subida es exitosa, muestra un mensaje de éxito y recarga la página después de 2 segundos.
            } else {
                setResultModalMessage('Failed to upload profile image: ' + result.message);
                setResultModalVisible(true);
                // Si hay un error, muestra un mensaje de error en el modal de resultados.
            }
        } else {
            setResultModalMessage('Please select a file');
            setResultModalVisible(true);
            // Si no se ha seleccionado un archivo, muestra un mensaje solicitando que se seleccione un archivo.
        }
    };

    const handleUpdate = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            // Crea un objeto FormData y añade el archivo de imagen seleccionado.

            const result = await actions.updateProfileImage(formData);
            // Llama a la acción para actualizar la imagen de perfil.

            if (result.success) {
                setResultModalMessage('Profile image updated successfully');
                setResultModalVisible(true);
                onHide();
                setTimeout(() => window.location.reload(), 2000);
                // Si la actualización es exitosa, muestra un mensaje de éxito y recarga la página después de 2 segundos.
            } else {
                setResultModalMessage('Failed to update profile image: ' + result.message);
                setResultModalVisible(true);
                // Si hay un error, muestra un mensaje de error en el modal de resultados.
            }
        } else {
            setResultModalMessage('Please select a file');
            setResultModalVisible(true);
            // Si no se ha seleccionado un archivo, muestra un mensaje solicitando que se seleccione un archivo.
        }
    };

    const handleDelete = async () => {
        const result = await actions.deleteProfileImage();
        // Llama a la acción para eliminar la imagen de perfil.

        if (result.success) {
            setResultModalMessage('Profile image deleted successfully');
            setResultModalVisible(true);
            onHide();
            setTimeout(() => window.location.reload(), 2000);
            // Si la eliminación es exitosa, muestra un mensaje de éxito y recarga la página después de 2 segundos.
        } else {
            setResultModalMessage('Failed to delete profile image: ' + result.message);
            setResultModalVisible(true);
            // Si hay un error, muestra un mensaje de error en el modal de resultados.
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide}>
                <div className={styles.modalProfile}>
                    <Modal.Header className={styles.modalHeader}>
                        <Modal.Title>{modalAction === 'edit' ? 'Edit Profile Image' : 'Upload Profile Image'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modalBody}>
                        <Form>
                            <Form.Group>
                                <Form.Label>Choose file</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className={styles.modalFooter}>
                        <Button className={styles.editButton} onClick={onHide}>Close</Button>
                        <Button className={styles.editButton} onClick={modalAction === 'edit' ? handleUpdate : handleUpload}>
                            {modalAction === 'edit' ? 'Update' : 'Upload'}
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
            <Modal show={resultModalVisible} onHide={handleResultModalClose}>
                <div className={styles.modalProfile}>
                    <Modal.Header className={styles.modalHeader}>
                        <Modal.Title>Result</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modalBody}>
                        <p>{resultModalMessage}</p>
                    </Modal.Body>
                    <Modal.Footer className={styles.modalFooter}>
                        <Button className={styles.editButton} onClick={handleResultModalClose}>Close</Button>
                    </Modal.Footer>
                </div>
            </Modal>
        </>
    );
};

export default ProfileImageUploadEco;
