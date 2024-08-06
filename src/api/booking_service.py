import os
from .models import db, User, Post, ProfileImage, PostImage, Likes
from datetime import datetime, timedelta  # Importación del módulo datetime para trabajar con fechas y horas
from flask import current_app as app
from flask_mail import Message, Mail
from itsdangerous import URLSafeTimedSerializer as Serializer
from werkzeug.utils import secure_filename # importacion de secure_filename para manejar imagen
import base64, json
from flask_jwt_extended import get_jwt_identity
from functools import wraps
from flask import jsonify, render_template, render_template_string
import io
from PIL import Image
import PyPDF2
from sqlalchemy.exc import SQLAlchemyError


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}


mail = Mail()


#Funciones de Servicio
#para facilitar la data de los enpoint



#--------------------------------------------------------FUNCION PARA EL ENVIO DE EMAIL ACTIVACION USUARIO------------------------------


#funciones para el envio de email de configuracion
def generate_confirmation_token_email(email):
    serializer = Serializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])

# def send_email(subject, recipient, html):
#     msg = Message(subject, sender=app.config['MAIL_USERNAME'], recipients=[recipient])
#     msg.html = html
#     mail.send(msg)

def send_email(subject, recipient, html, attachment=None):
    # Crea un objeto Message que será usado para enviar el correo.
    # Configura el asunto, el remitente (extraído de la configuración de la app) y los destinatarios.
    msg = Message(subject, sender=app.config['MAIL_USERNAME'], recipients=[recipient])
    
    # Establece el contenido HTML del mensaje.
    msg.html = html
    
    if attachment:
        filename, file_content_type, file_data = attachment
        msg.attach(filename, file_content_type, file_data)

    # Utiliza el objeto 'mail' para enviar el mensaje. 'mail' debe ser configurado previamente en la app.
    try:
        mail.send(msg)
    except Exception as e:
        # Manejo de errores al intentar enviar el correo, podría loggearse o manejar de otra manera según las necesidades.
        print(f"Error sending email: {e}")


def confirm_token_email(token, expiration=3600):
    # Configura el serializador con la clave secreta de la aplicación.
    serializer = Serializer(app.config['SECRET_KEY'])
    
    try:
        # Intenta decodificar el token para extraer el email.
        # Utiliza una sal específica y un tiempo de expiración (por defecto 3600 segundos, o 1 hora).
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=expiration)
    except:
        # Si ocurre un error al decodificar (por ejemplo, token malformado, expirado, etc.), retorna False.
        return False
    
    # Retorna el email decodificado si el token es válido y no ha expirado.
    return email



#--------------------------------------------------------FUNCION PARA LA VERIFICACION DEL TIPO DE ARCHIVO A CARGAR------------------------------
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def process_file(file_stream, filename):
    """
    Procesa el archivo dependiendo de si es una imagen o un PDF.
    """
    extension = filename.rsplit('.', 1)[1].lower()
    if extension in {'png', 'jpg', 'jpeg', 'gif'}:
        return optimize_image(file_stream)
    elif extension == 'pdf':
        return optimize_pdf(file_stream)


def optimize_image(file_stream):
    """
    Reduce el tamaño y la calidad de la imagen para optimización web.
    """
    # Carga la imagen desde el archivo subido
    image = Image.open(file_stream)
    
    # Convertir a RGB si es necesario (por ejemplo, si es un archivo PNG con transparencia)
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
    
    # Redimensionar la imagen manteniendo el aspecto
    max_size = (800, 800)  # Puedes ajustar esto a lo que mejor se adapte a tus necesidades
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # Guardar la imagen optimizada en un objeto de tipo bytes
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG', quality=85)  # Ajusta la calidad al 85%
    img_byte_arr = img_byte_arr.getvalue()
    
    return img_byte_arr

def optimize_pdf(file_stream):
    """
    Procesa y potencialmente optimiza el PDF. Esta función simplemente lo lee y lo devuelve como bytes.
    Podrías expandir esta función para comprimir el PDF si es necesario.
    """
    pdf_reader = PyPDF2.PdfReader(file_stream)
    pdf_writer = PyPDF2.PdfWriter()

    for page in range(len(pdf_reader.pages)):
        pdf_writer.add_page(pdf_reader.pages[page])

    pdf_byte_arr = io.BytesIO()
    pdf_writer.write(pdf_byte_arr)
    return pdf_byte_arr.getvalue()
