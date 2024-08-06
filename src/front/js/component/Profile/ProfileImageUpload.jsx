import React, { useContext, useState } from 'react';
import { Context } from '../../store/appContext';
import { Button, Modal, Form, Dropdown } from 'react-bootstrap';
import styles from './ProfileImageUpload.module.css';

const ProfileImageUploadEco = ({ show, onHide }) => {
    const { store, actions } = useContext(Context);
    const [file, setFile] = useState(null);
    const [modalAction, setModalAction] = useState('');
    const [resultModalVisible, setResultModalVisible] = useState(false);
    const [resultModalMessage, setResultModalMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleResultModalClose = () => {
        setResultModalVisible(false);
    };

    const handleUpload = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const result = await actions.uploadProfileImage(formData);
            if (result.success) {
                setResultModalMessage('Profile image uploaded successfully');
                setResultModalVisible(true);
                onHide();
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setResultModalMessage('Failed to upload profile image: ' + result.message);
                setResultModalVisible(true);
            }
        } else {
            setResultModalMessage('Please select a file');
            setResultModalVisible(true);
        }
    };

    const handleUpdate = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const result = await actions.updateProfileImage(formData);
            if (result.success) {
                setResultModalMessage('Profile image updated successfully');
                setResultModalVisible(true);
                onHide();
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setResultModalMessage('Failed to update profile image: ' + result.message);
                setResultModalVisible(true);
            }
        } else {
            setResultModalMessage('Please select a file');
            setResultModalVisible(true);
        }
    };

    const handleDelete = async () => {
        const result = await actions.deleteProfileImage();
        if (result.success) {
            setResultModalMessage('Profile image deleted successfully');
            setResultModalVisible(true);
            onHide();
            setTimeout(() => window.location.reload(), 2000);
        } else {
            setResultModalMessage('Failed to delete profile image: ' + result.message);
            setResultModalVisible(true);
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
