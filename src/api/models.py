from flask_sqlalchemy import SQLAlchemy  # Importa SQLAlchemy para manejar la base de datos en Flask.
from sqlalchemy import LargeBinary  # Importa LargeBinary para manejar columnas de tipo binario.
from datetime import datetime  # Importa datetime para manejar fechas y horas.
import base64  # Importa base64 para codificar y decodificar datos en base64.

db = SQLAlchemy()  # Inicializa la instancia de SQLAlchemy para manejar la base de datos.

# Tabla para cargar la imagen de perfil de usuario
class ProfileImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Clave primaria para la tabla ProfileImage.
    img_data = db.Column(LargeBinary, nullable=False)  # Columna para almacenar los datos de la imagen en formato binario.

    user = db.relationship('User', back_populates='profile_image', uselist=False)  # Relación uno a uno con la tabla User.

    @property
    def img_url(self):  # Propiedad para obtener la URL de la imagen en formato base64.
        return f"data:image/jpeg;base64,{base64.b64encode(self.img_data).decode('utf-8')}"  # Codifica la imagen en base64 y la convierte en una URL de datos.

    def __repr__(self):  # Define cómo se representará una instancia de ProfileImage.
        return '<ProfileImage %r>' % self.id  # Retorna una representación de cadena con el ID de la imagen de perfil.

    def serialize(self):  # Método para serializar la imagen de perfil a un formato JSON.
        return {
            "img_id": self.id,  # Incluye el ID de la imagen.
            "img_url": self.img_url  # Incluye la URL de la imagen en formato base64.
        }

# Tabla de Usuarios
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Clave primaria para la tabla User.
    email = db.Column(db.String(120), unique=True, nullable=True)  # Columna para el correo electrónico, único pero opcional.
    password = db.Column(db.String(250), nullable=True)  # Columna para la contraseña, opcional.
    is_active = db.Column(db.Boolean(), default=False)  # Columna booleana para indicar si el usuario está activo.
    name = db.Column(db.String(80), nullable=True)  # Columna para el nombre del usuario, opcional.
    google_id = db.Column(db.String(250), nullable=True)  # Columna para almacenar el ID de Google, opcional.
    is_guest = db.Column(db.Boolean(), default=False, nullable=True)
    role = db.Column(db.String(20), nullable=True)
    phone = db.Column(db.String(20), nullable=True)  # Nuevo campo de teléfono
    last_name = db.Column(db.String(80), nullable=True)  # Columna para el apellido del usuario, opcional.
    username = db.Column(db.String(80), nullable=True)  # Columna para el nombre de usuario, opcional.
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)  # Fecha de registro con valor por defecto la fecha actual.
    last_update_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # Última fecha de actualización.
    image_url = db.Column(db.String(255), nullable=True)  # Columna para almacenar la URL de la imagen de perfil, opcional.
    profile_image_id = db.Column(db.Integer, db.ForeignKey('profile_image.id'), nullable=True)  # Clave externa que referencia a la tabla ProfileImage.

    profile_image = db.relationship('ProfileImage', back_populates='user', uselist=False)  # Relación uno a uno con la tabla ProfileImage.
    posts = db.relationship('Post', backref='author', lazy=True)  # Relación uno a muchos con la tabla Post.
    likes = db.relationship('Likes', backref='user', lazy=True)  # Relación uno a muchos con la tabla Likes.

    def serialize(self):  # Método para serializar el usuario a un formato JSON.
        return {
            "id": self.id,  # Incluye el ID del usuario.
            "email": self.email,  # Incluye el correo electrónico del usuario.
            "image": self.image_url,  # Incluye la URL de la imagen del usuario.
            "username": self.username,  # Incluye el nombre de usuario.
            "is_active": self.is_active,  # Incluye si el usuario está activo.
            "name": self.name,  # Incluye el nombre del usuario.
            "last_name": self.last_name,  # Incluye el apellido del usuario.
            "register_date": self.registration_date.isoformat(),  # Incluye la fecha de registro en formato ISO.
            "account_update": self.last_update_date.isoformat(),  # Incluye la última fecha de actualización en formato ISO.
            "profile_image_url": self.profile_image.img_url if self.profile_image else None,  # Incluye la URL de la imagen de perfil si existe.
        }

# Tabla de Imágenes de Publicaciones
class PostImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Clave primaria para la tabla PostImage.
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)  # Clave externa que referencia a la tabla Post.
    img_data = db.Column(LargeBinary, nullable=False)  # Columna para almacenar los datos de la imagen en formato binario.

    @property
    def img_url(self):  # Propiedad para obtener la URL de la imagen en formato base64.
        return f"data:image/jpeg;base64,{base64.b64encode(self.img_data).decode('utf-8')}"  # Codifica la imagen en base64 y la convierte en una URL de datos.

    def serialize(self):  # Método para serializar la imagen de la publicación a un formato JSON.
        return {
            "id": self.id,  # Incluye el ID de la imagen.
            "post_id": self.post_id,  # Incluye el ID de la publicación a la que pertenece la imagen.
            "img_url": self.img_url  # Incluye la URL de la imagen en formato base64.
        }

# Tabla de Publicaciones
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Clave primaria para la tabla Post.
    message = db.Column(db.String(500), nullable=False)  # Columna para el mensaje de la publicación, no puede ser nulo.
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Clave externa que referencia a la tabla User.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Fecha de creación de la publicación con valor por defecto la fecha actual.
    location = db.Column(db.String(30), nullable=False)  # Columna para la ubicación de la publicación, no puede ser nula.
    status = db.Column(db.String(10), nullable=False)  # Columna para el estado de la publicación, no puede ser nula.
    images = db.relationship('PostImage', backref='post', lazy=True)  # Relación uno a muchos con la tabla PostImage.
    likes = db.relationship('Likes', backref='post', lazy=True)  # Relación uno a muchos con la tabla Likes.

    def serialize(self):  # Método para serializar la publicación a un formato JSON.
        return {
            "id": self.id,  # Incluye el ID de la publicación.
            "message": self.message,  # Incluye el mensaje de la publicación.
            "author": self.author.serialize(),  # Incluye la información del autor de la publicación serializada.
            "created_at": self.created_at.isoformat(),  # Incluye la fecha de creación en formato ISO.
            "location": self.location,  # Incluye la ubicación de la publicación.
            "status": self.status,  # Incluye el estado de la publicación.
            "images": [image.img_url for image in self.images],  # Incluye las URLs de las imágenes de la publicación.
            "likes_count": len(self.likes),  # Incluye el número de "me gusta" que ha recibido la publicación.
            "liked_by_user": [like.user_id for like in self.likes],  # Incluye los IDs de los usuarios que dieron "me gusta".
        }

# Tabla de Likes
class Likes(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Clave primaria para la tabla Likes.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Clave externa que referencia a la tabla User.
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)  # Clave externa que referencia a la tabla Post.

    def serialize(self):  # Método para serializar el "me gusta" a un formato JSON.
        return {
            "id": self.id,  # Incluye el ID del "me gusta".
            "user_id": self.user_id,  # Incluye el ID del usuario que dio "me gusta".
            "post_id": self.post_id,  # Incluye el ID de la publicación que recibió el "me gusta".
        }
