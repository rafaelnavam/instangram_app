from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import LargeBinary
from datetime import datetime
import base64

db = SQLAlchemy()

# Tabla para cargar la imagen de perfil de usuario
class ProfileImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    img_data = db.Column(LargeBinary, nullable=False)

    user = db.relationship('User', back_populates='profile_image', uselist=False)

    @property
    def img_url(self):
        return f"data:image/jpeg;base64,{base64.b64encode(self.img_data).decode('utf-8')}"

    def __repr__(self):
        return '<ProfileImage %r>' % self.id

    def serialize(self):
        return {
            "img_id": self.id,
            "img_url": self.img_url
        }

# Tabla de Usuarios
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True)  # Nullable para permitir usuarios invitados
    password = db.Column(db.String(250), nullable=True)  # Nullable para permitir usuarios invitados
    is_active = db.Column(db.Boolean(), default=False)
    name = db.Column(db.String(80), nullable=True)  # Nullable para permitir usuarios invitados
    google_id = db.Column(db.String(250), nullable=True)
    last_name = db.Column(db.String(80), nullable=True)  # Nullable para permitir usuarios invitados
    username = db.Column(db.String(80), nullable=True)  # Nullable para permitir usuarios invitados
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_update_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    image_url = db.Column(db.String(255), nullable=True)
    profile_image_id = db.Column(db.Integer, db.ForeignKey('profile_image.id'), nullable=True)

    profile_image = db.relationship('ProfileImage', back_populates='user', uselist=False)
    posts = db.relationship('Post', backref='author', lazy=True)
    likes = db.relationship('Likes', backref='user', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "image": self.image_url,
            "username": self.username,
            "is_active": self.is_active,
            "name": self.name,
            "last_name": self.last_name,
            "password": self.password,
            "register_date": self.registration_date.isoformat(),
            "account_update": self.last_update_date.isoformat(),
            "profile_image_url": self.profile_image.img_url if self.profile_image else None,
        }

# Tabla de Imágenes de Publicaciones
class PostImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    img_data = db.Column(LargeBinary, nullable=False)

    @property
    def img_url(self):
        return f"data:image/jpeg;base64,{base64.b64encode(self.img_data).decode('utf-8')}"

    def serialize(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "img_url": self.img_url
        }

# Tabla de Publicaciones
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image = db.Column(db.String(255), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    location = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(10), nullable=False)
    likes = db.relationship('Likes', backref='post', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "image": self.image,
            "message": self.message,
            "author_id": self.author_id,
            "created_at": self.created_at.isoformat(),
            "location": self.location,
            "status": self.status,
            "likes_count": len(self.likes),
        }

# Tabla de Likes
class Likes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
        }