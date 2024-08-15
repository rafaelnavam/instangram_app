import React, { useState, useContext, useEffect } from "react";
// Importa React y los hooks useState, useContext y useEffect para gestionar el estado y efectos secundarios.

import { Context } from "../../store/appContext";
// Importa el contexto global de la aplicación.

import styles from "./CreatePostForm.module.css";
// Importa los estilos CSS específicos para el componente CreatePostForm.

import { Button, Form, Row, Col, Modal, Image } from 'react-bootstrap';
// Importa componentes de React Bootstrap para la construcción de la interfaz de usuario.

import Cropper from 'react-easy-crop';
// Importa el componente Cropper para recortar imágenes.

import getCroppedImg from "../cropImage.js";
// Importa una función personalizada para obtener la imagen recortada.

const CreatePostForm = ({ editingPost, setEditingPost, setShowCreatePostForm }) => {
    // Componente funcional que recibe props para manejar el estado de edición de un post y la visibilidad del formulario.

    const { actions } = useContext(Context);
    // Usa el contexto global para acceder a las acciones de la aplicación.

    const [formData, setFormData] = useState({
        message: "",
        location: "",
        status: "drafted",
    });
    // Estado para manejar los datos del formulario: mensaje, ubicación y estado del post.

    const [showModal, setShowModal] = useState(false);
    // Estado para manejar la visibilidad del modal de mensajes.

    const [modalMessage, setModalMessage] = useState("");
    // Estado para almacenar el mensaje que se muestra en el modal.

    const [images, setImages] = useState([]);
    // Estado para almacenar las imágenes cargadas por el usuario.

    const [croppedAreas, setCroppedAreas] = useState([]);
    // Estado para almacenar las áreas recortadas de las imágenes.

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Estado para manejar el índice de la imagen actualmente seleccionada para recortar.

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    // Estado para manejar la posición de recorte.

    const [zoom, setZoom] = useState(1);
    // Estado para manejar el nivel de zoom del recorte.

    const [croppedImages, setCroppedImages] = useState([]);
    // Estado para almacenar las imágenes recortadas.

    useEffect(() => {
        if (editingPost && Object.keys(editingPost).length > 0) {
            // Si se está editando un post existente, inicializa los datos del formulario con los valores actuales del post.

            setFormData({
                message: editingPost.message || "",
                location: editingPost.location || "",
                status: editingPost.status || "drafted",
            });

            const fetchImages = async () => {
                const imageBlobs = await Promise.all(
                    editingPost.images.map(async (imageUrl) => {
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        return new File([blob], "image.jpg", { type: blob.type });
                    })
                );
                // Descarga y convierte las imágenes del post editado en blobs de archivos.

                setImages(imageBlobs.map(blob => URL.createObjectURL(blob)));
                // Crea URLs de las imágenes descargadas para mostrarlas en el formulario.

                setCroppedImages(imageBlobs);
                // Establece las imágenes recortadas iniciales como las imágenes descargadas.
            };

            if (editingPost.images && editingPost.images.length > 0) {
                fetchImages();
                // Llama a la función para obtener las imágenes si el post tiene alguna.
            }
        }
    }, [editingPost]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Actualiza los datos del formulario cuando el usuario cambia algún campo.
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setImages(imageUrls);
        setCroppedImages([]);
        setCurrentImageIndex(0);
        // Maneja el cambio de imágenes seleccionadas por el usuario. Convierte los archivos en URLs y resetea las imágenes recortadas.
    };

    const handleCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
        const newCroppedAreas = [...croppedAreas];
        newCroppedAreas[currentImageIndex] = croppedAreaPixels;
        setCroppedAreas(newCroppedAreas);
        // Guarda las coordenadas del área recortada para la imagen actual.
    };

    const handleCropChange = (newCrop) => {
        setCrop(newCrop);
        // Actualiza el estado de recorte con la nueva posición de recorte.
    };

    const handleZoomChange = (newZoom) => {
        setZoom(newZoom);
        // Actualiza el nivel de zoom del recorte.
    };

    const handleCropAccept = async () => {
        if (images[currentImageIndex] && croppedAreas[currentImageIndex]) {
            try {
                const croppedImg = await getCroppedImg(images[currentImageIndex], croppedAreas[currentImageIndex]);
                const newCroppedImages = [...croppedImages];
                newCroppedImages[currentImageIndex] = croppedImg;
                setCroppedImages(newCroppedImages);

                if (currentImageIndex + 1 < images.length) {
                    setCurrentImageIndex(currentImageIndex + 1);
                } else {
                    setCurrentImageIndex(0);
                    setImages([]);
                }
                // Recorta la imagen actual usando las coordenadas almacenadas y guarda el resultado.
            } catch (error) {
                console.error("Error cropping image:", error);
                // Muestra un error en la consola si ocurre un problema durante el recorte.
            }
        }
    };

    const handleCropCancel = () => {
        const newImages = images.filter((_, index) => index !== currentImageIndex);
        setImages(newImages);
        if (currentImageIndex + 1 < images.length) {
            setCurrentImageIndex(currentImageIndex + 1);
        } else {
            setCurrentImageIndex(0);
        }
        // Cancela el recorte de la imagen actual y la elimina de la lista.
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.message || croppedImages.length === 0) {
            setModalMessage("Message and image are required.");
            setShowModal(true);
            return;
            // Si el mensaje o las imágenes recortadas están vacíos, muestra un mensaje de error y no permite enviar el formulario.
        }

        const postData = new FormData();
        postData.append("message", formData.message);
        postData.append("location", formData.location);
        postData.append("status", formData.status);

        croppedImages.forEach((image, index) => {
            postData.append("images", image, `image${index}.jpg`);
        });
        // Crea un objeto FormData para enviar el mensaje, ubicación, estado e imágenes recortadas al backend.

        try {
            const result = editingPost && Object.keys(editingPost).length > 0
                ? await actions.editPost(editingPost.id, postData)
                : await actions.createPost(postData);

            if (result && result.success) {
                setModalMessage(editingPost ? "Post edited successfully" : "Post created successfully");
                setFormData({
                    message: "",
                    location: "",
                    status: "drafted",
                });
                setCroppedImages([]);
                setEditingPost(null);
                setShowCreatePostForm(false);
                // Si la creación/edición es exitosa, muestra un mensaje de éxito, resetea el formulario y cierra el modal.
            } else {
                setModalMessage(result ? result.error : "An unknown error occurred");
                // Si hay un error, muestra el mensaje de error.
            }
            setShowModal(true);
        } catch (error) {
            setModalMessage(`Error: ${error.message}`);
            setShowModal(true);
            // Si ocurre un error en la solicitud, muestra un mensaje de error en el modal.
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const response = await actions.deletePost(postId);
            if (response && response.success) {
                setModalMessage("Post successfully deleted");
                setEditingPost(null);
                setShowCreatePostForm(false);
                // Si la eliminación del post es exitosa, muestra un mensaje de éxito y cierra el modal.
            } else {
                setModalMessage(response ? response.error : "An unknown error occurred");
                // Si hay un error al eliminar, muestra un mensaje de error.
            }
            setShowModal(true);
        } catch (error) {
            setModalMessage(`Error deleting post: ${error.message}`);
            setShowModal(true);
            // Si ocurre un error al eliminar el post, muestra un mensaje de error en el modal.
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalMessage("");
        // Cierra el modal y limpia el mensaje del modal.
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setFormData({
            message: "",
            location: "",
            status: "drafted",
        });
        setCroppedImages([]);
        setShowCreatePostForm(false);
        // Cancela la edición del post, resetea el formulario y cierra el modal.
    };

    return (
        <Modal show={true} onHide={handleCancelEdit} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{editingPost && Object.keys(editingPost).length > 0 ? 'Edit Post' : 'Create Post'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className={styles.label}>Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className={styles.label}>Message</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    placeholder="Write your message..."
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className={styles.label}>Post Image</Form.Label>
                                <div className={styles.uploadContainer}>
                                    <Form.Label htmlFor="post-image-upload" className={styles.uploadIcon}>
                                        <i className="fa-solid fa-upload"></i>
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        id="post-image-upload"
                                        onChange={handleImageChange}
                                        className={styles.uploadInput}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    {images.length > 0 && currentImageIndex < images.length && (
                        <>
                            <Row className="mb-3">
                                <Col>
                                    <div className={styles.cropContainer}>
                                        <Cropper
                                            image={images[currentImageIndex]}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={4 / 3}
                                            onCropChange={handleCropChange}
                                            onCropComplete={handleCropComplete}
                                            onZoomChange={handleZoomChange}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col className="d-flex justify-content-center">
                                    <Button onClick={handleCropAccept} variant="success" className="mr-2">Accept</Button>
                                    <Button onClick={handleCropCancel} variant="danger">Cancel</Button>
                                </Col>
                            </Row>
                        </>
                    )}
                    {croppedImages.length > 0 && (
                        <Row className="mb-3">
                            <Col className="text-center">
                                {croppedImages.map((croppedImage, index) => (
                                    <img key={index} src={URL.createObjectURL(croppedImage)} alt={`Cropped ${index}`} className={styles.croppedImage} />
                                ))}
                            </Col>
                        </Row>
                    )}
                    <div className={styles.buttonContainer}>
                        <Button variant="primary" type="submit" className={styles.button}>
                            {editingPost && Object.keys(editingPost).length > 0 ? 'Edit Post' : 'Create Post'}
                        </Button>
                        {editingPost && Object.keys(editingPost).length > 0 && (
                            <>
                                <Button variant="danger" onClick={() => handleDeletePost(editingPost.id)} className={styles.buttonDelete}>
                                    Delete Post
                                </Button>
                                <Button variant="secondary" onClick={handleCancelEdit} className={styles.buttonCancelEdit}>
                                    Cancel Edit
                                </Button>
                            </>
                        )}
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreatePostForm;
