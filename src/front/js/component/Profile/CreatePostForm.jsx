import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../store/appContext";
import styles from "./CreatePostForm.module.css";
import { Button, Form, Row, Col, Modal, Image } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import getCroppedImg from "../cropImage.js";

const CreatePostForm = ({ editingPost, setEditingPost, setShowCreatePostForm }) => {
    const { actions } = useContext(Context);
    const [formData, setFormData] = useState({
        message: "",
        location: "",
        status: "drafted",
    });
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [images, setImages] = useState([]);
    const [croppedAreas, setCroppedAreas] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImages, setCroppedImages] = useState([]);

    useEffect(() => {
        if (editingPost && Object.keys(editingPost).length > 0) {
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
                setImages(imageBlobs.map(blob => URL.createObjectURL(blob)));
                setCroppedImages(imageBlobs);
            };

            if (editingPost.images && editingPost.images.length > 0) {
                fetchImages();
            }
        }
    }, [editingPost]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setImages(imageUrls);
        setCroppedImages([]);  // Reset cropped images
        setCurrentImageIndex(0);
    };

    const handleCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
        const newCroppedAreas = [...croppedAreas];
        newCroppedAreas[currentImageIndex] = croppedAreaPixels;
        setCroppedAreas(newCroppedAreas);
    };

    const handleCropChange = (newCrop) => {
        setCrop(newCrop);
    };

    const handleZoomChange = (newZoom) => {
        setZoom(newZoom);
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
            } catch (error) {
                console.error("Error cropping image:", error);
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.message || croppedImages.length === 0) {
            setModalMessage("Message and image are required.");
            setShowModal(true);
            return;
        }

        const postData = new FormData();
        postData.append("message", formData.message);
        postData.append("location", formData.location);
        postData.append("status", formData.status);

        croppedImages.forEach((image, index) => {
            postData.append("images", image, `image${index}.jpg`);
        });

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
                setShowCreatePostForm(false);  // Cerrar el modal después de crear/editar la publicación
            } else {
                setModalMessage(result ? result.error : "An unknown error occurred");
            }
            setShowModal(true);
        } catch (error) {
            setModalMessage(`Error: ${error.message}`);
            setShowModal(true);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const response = await actions.deletePost(postId);
            if (response && response.success) {
                setModalMessage("Post successfully deleted");
                setEditingPost(null);
                setShowCreatePostForm(false);  // Cerrar el modal después de eliminar la publicación
            } else {
                setModalMessage(response ? response.error : "An unknown error occurred");
            }
            setShowModal(true);
        } catch (error) {
            setModalMessage(`Error deleting post: ${error.message}`);
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalMessage("");
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setFormData({
            message: "",
            location: "",
            status: "drafted",
        });
        setCroppedImages([]);
        setShowCreatePostForm(false);  // Cerrar el modal al cancelar la edición
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
