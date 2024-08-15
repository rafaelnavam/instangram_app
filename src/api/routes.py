"""
Este módulo se encarga de iniciar el servidor API, cargar la base de datos y agregar los puntos finales.
"""

import os
from flask import Flask, request, jsonify, url_for, Blueprint, redirect, url_for, render_template, current_app  # Importación de Flask y funciones relacionadas
from api.models import db, User,ProfileImage, PostImage, Post, Likes# Importación de los modelos de la base de datos
from api.utils import generate_sitemap, APIException  # Importación de funciones de utilidad y excepciones personalizadas
from flask_cors import CORS  # Importación de CORS para permitir solicitudes desde otros dominios
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity   # Importación de JWT para autenticación y autorización basada en tokens
from flask_bcrypt import generate_password_hash, check_password_hash  # Importación de bcrypt para encriptación de contraseñas
from datetime import timedelta  # Importación de timedelta para manejar intervalos de tiempo
from itsdangerous import URLSafeTimedSerializer as Serializer
from flask_mail import Mail, Message
from flask import send_file, jsonify, render_template, render_template_string
from io import BytesIO
from sqlalchemy import func, create_engine
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from sqlalchemy.orm import joinedload
import base64
import re #biblioteca estándar de Python para trabajar con expresiones regulares
import json
import random
import hashlib
import hmac
import time
import secrets
import string
import requests




from .booking_service import generate_confirmation_token_email, confirm_token_email, send_email, allowed_file, optimize_image,  process_file


#------------------verificar con david --------------------------------
#Configura la aplicación para permitir cargas de archivos
from werkzeug.utils import secure_filename # importacion de secure_filename para manejar imagen





#------------------INICIALIZACION DE LA API----------------------------------------------------------------------------------

api = Blueprint('api', __name__)  # Creación de un Blueprint para agrupar las rutas relacionadas con la API
# Un Blueprint es una forma de organizar y estructurar las rutas de una aplicación Flask en grupos lógicos y modularizados. 
# Es una característica que permite dividir la aplicación en componentes más pequeños y reutilizables, 
# lo que facilita la gestión y mantenimiento del código.

# Allow CORS requests to this API
CORS(api)  # Habilitar CORS para permitir solicitudes cruzadas desde el frontend hacia la API

#-------ENCRIPTACION JWT------
#la inicialización de JWTManager está en la carpeta app.py despues de la declaración del servidor Flask
jwt = JWTManager()  # Inicialización del JWTManager para manejar la generación y verificación de tokens JWT



#------------------OBTENER USUARIOS----------------------------------------------------------------------------------

@api.route('/user', methods=['GET'])  # Define una ruta de la API para obtener la información del usuario, permitiendo solo el método GET.
@jwt_required()  # Requiere autenticación JWT para acceder a esta ruta.
def get_user_by_email():
    # Define la función que manejará las solicitudes a esta ruta.

    try:
        current_user_id = get_jwt_identity()  # Obtiene el ID del usuario a partir del token JWT.
        user = User.query.get(current_user_id)  # Busca al usuario en la base de datos utilizando el ID obtenido del JWT.
        
        if not user:
            return jsonify({'message': 'User not found'}), 404  # Si el usuario no existe, responde con un error 404.
        
        return jsonify(user.serialize()), 200  # Devuelve los datos del usuario encontrado en formato JSON.
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.

    
#------------------CREACION DE USUARIO----------------------------------------------------------------------------------

"""CREACION DE USUARIO CON GOOGLE ACCOUNT"""
@api.route('/signup/user', methods=['POST'])  # Define una ruta de la API para registrar nuevos usuarios, permitiendo solo el método POST.
def create_new_normal_user():
    # Define la función que manejará las solicitudes a esta ruta.

    try:
        data = request.json  # Obtiene los datos en formato JSON enviados en la solicitud.
        if not data:
            return jsonify({'error': 'No data provided'}), 400  # Si no se proporcionan datos, responde con un error 400.

        if 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400  # Si no se proporciona el email, responde con un error 400.

        if 'username' not in data:
            return jsonify({'error': 'Username is required'}), 400  # Si no se proporciona el nombre de usuario, responde con un error 400.

        if 'googleId' in data:
            # Si se proporciona un googleId, se registra a través de Google, no es necesario verificar el correo.

            password_hash = None  # No se necesita un hash de contraseña para el registro con Google.
            user = User.query.filter_by(email=data['email']).first()  # Busca si ya existe un usuario con ese email.
            if user:
                return jsonify({'error': 'Email already exists.'}), 409  # Si el email ya existe, responde con un error 409.

            new_user = User(
                email=data['email'],  # Establece el email del nuevo usuario.
                google_id=data['googleId'],  # Establece el googleId del nuevo usuario.
                password=password_hash,  # No se establece una contraseña.
                username=data['username'],  # Establece el nombre de usuario.
                name=data.get('name'),  # Establece el nombre (opcional).
                last_name=data.get('last_name'),  # Establece el apellido (opcional).
                is_active=True  # Activa la cuenta directamente.
            )

            db.session.add(new_user)  # Añade el nuevo usuario a la sesión de la base de datos.
            db.session.commit()  # Confirma los cambios en la base de datos.
            return jsonify({'message': 'User created successfully', 'create': True}), 201  # Responde con un mensaje de éxito.

        if 'password' not in data:
            return jsonify({'error': 'Password is required'}), 400  # Si no se proporciona la contraseña, responde con un error 400.

        existing_user = User.query.filter_by(email=data['email']).first()  # Busca si ya existe un usuario con ese email.
        if existing_user:
            return jsonify({'error': 'Email already exists.'}), 409  # Si el email ya existe, responde con un error 409.

        existing_username = User.query.filter_by(username=data['username']).first()  # Busca si ya existe un usuario con ese nombre de usuario.
        if existing_username:  
            return jsonify({'error': 'Username already exists.'}), 409  # Si el nombre de usuario ya existe, responde con un error 409.

        password_hash = generate_password_hash(data['password']).decode('utf-8')  # Genera un hash de la contraseña.

        new_user = User(
            email=data['email'],  # Establece el email del nuevo usuario.
            password=password_hash,  # Establece el hash de la contraseña.
            username=data['username'],  # Establece el nombre de usuario.
            name=data.get('name'),  # Establece el nombre (opcional).
            last_name=data.get('last_name')  # Establece el apellido (opcional).
        )

        token = generate_confirmation_token_email(new_user.email)  # Genera un token para la confirmación del correo.
        BASE_URL_FRONT = os.getenv('FRONTEND_URL')  # Obtiene la URL del frontend desde las variables de entorno.
        confirm_url = url_for('api.confirm_email', token=token, _external=True)  # Genera la URL de confirmación del correo.
        confirm_url = f"{BASE_URL_FRONT}/ConfirmEmail?token={token}"  # Combina la URL base con la URL de confirmación.
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body>
            <div style="margin: 0 auto; width: 80%; padding: 20px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 3px #ccc;">
                <h1 style="color: #333;">Confirm Your Email</h1>
                <p>Thank you for registering! Please click the button below to activate your account:</p>
                <a href="{confirm_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Activate Account</a>
            </div>
        </body>
        </html>"""  # HTML del correo electrónico de confirmación.

        send_email('Confirm Your Email', new_user.email, html)  # Envía el correo electrónico de confirmación al usuario.

        db.session.add(new_user)  # Añade el nuevo usuario a la sesión de la base de datos.
        db.session.commit()  # Confirma los cambios en la base de datos.

        return jsonify({'message': 'Please confirm your email address to complete the registration', 'create': True}), 201  # Responde solicitando la confirmación del correo.

    except Exception as e:
        return jsonify({'error': 'Error in user creation: ' + str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.

    
#------------------VERIFICAR SI EL USUARIO EXISTE----------------------------------------------------------------------------------

@api.route('/user/exists', methods=['POST'])  # Define una ruta de la API para verificar si un usuario existe, permitiendo solo el método POST.
def check_user_exists():
    # Define la función que manejará las solicitudes a esta ruta.

    data = request.json  # Obtiene los datos en formato JSON enviados en la solicitud.
    email = data.get('email')  # Extrae el email de los datos recibidos.

    if not email:
        return jsonify({'exists': False, 'error': 'Email is required'}), 400  # Si no se proporciona el email, responde con un error 400.

    user = User.query.filter_by(email=email).first()  # Busca un usuario en la base de datos que coincida con el email proporcionado.
    if user:
        return jsonify({'exists': True}), 200  # Si el usuario existe, responde con un indicador de existencia y código 200.
    else:
        return jsonify({'exists': False}), 200  # Si el usuario no existe, responde con un indicador de no existencia y código 200.

    

#-----------------------------------------------------actualizar el usuario-----------------------------------------------------------

@api.route('/user', methods=['PUT'])  # Define una ruta de la API para actualizar datos de usuario, permitiendo solo el método PUT.
@jwt_required()  # Requiere autenticación JWT para acceder a esta ruta.
def update_data_user():
    # Define la función que manejará las solicitudes a esta ruta.

    try:
        user_id = get_jwt_identity()  # Obtiene el ID del usuario a partir del token JWT.
        data = request.json  # Intenta obtener los datos en formato JSON enviados en la solicitud.
        if not data:
            return jsonify({'error': 'No data provided'}), 400  # Si no se proporcionan datos, responde con un error 400.
        
        user = User.query.get(user_id)  # Busca al usuario en la base de datos utilizando el ID obtenido del JWT.
        if not user:
            return jsonify({'error': 'User not found'}), 404  # Si el usuario no existe, responde con un error 404.

        for key, value in data.items():  # Itera sobre los pares clave-valor de los datos proporcionados.
            if hasattr(user, key):  # Verifica si el usuario tiene un atributo con el nombre de la clave.
                if key == 'password' and value:  # Si la clave es 'password' y tiene un valor:
                    password_hash = generate_password_hash(value).decode('utf-8')  # Genera un hash de la contraseña.
                    setattr(user, key, password_hash)  # Establece la contraseña hash en el usuario.
                else:
                    setattr(user, key, value)  # Establece el valor proporcionado en el atributo correspondiente del usuario.

        db.session.commit()  # Confirma los cambios en la base de datos.
        return jsonify({'message': 'User updated successfully'})  # Responde con un mensaje de éxito.
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.

    


#--------------------- activacion de cuenta via email----------------
@api.route('/confirm/<string:token>', methods=['POST'])  # Define un endpoint para confirmar un email usando un token. El método permitido es POST.
def confirm_email(token):  # Función que maneja la solicitud POST para confirmar el email.
    try:  # Inicia un bloque try para manejar posibles excepciones.
        email = confirm_token_email(token)  # Intenta decodificar el token para obtener el email.
        if not email:  # Verifica si el email no se pudo obtener (i.e., token inválido o vacío).
            raise ValueError("El email no puede estar vacío")  # Lanza un ValueError si el email está vacío.

        user = User.query.filter_by(email=email).first_or_404()  # Busca al usuario por email en la base de datos; devuelve 404 si no se encuentra.
        if user.is_active:  # Verifica si la cuenta del usuario ya está activa.
            return jsonify(message='Account already confirmed. Please login.'), 400  # Devuelve un mensaje indicando que la cuenta ya está confirmada y un código de estado HTTP 400.

        else:  # Si la cuenta del usuario no está activa:
            user.is_active = True  # Establece el estado de la cuenta del usuario a activo.
            db.session.commit()  # Guarda los cambios en la base de datos.
            return jsonify({'message':'You have confirmed your account. Thanks!', 'confirm_email':True}), 200  # Devuelve un mensaje de éxito y confirma que el email ha sido verificado, con un código de estado HTTP 200.
    
    except:  # Bloque except que captura cualquier excepción no manejada en el bloque try.
        return jsonify(message='The confirmation link is invalid or has expired.'), 400  # Devuelve un mensaje indicando que el enlace de confirmación es inválido o ha expirado, con un código de estado HTTP 400.


#-------------------VALIDAR TOKEN  --------------------------------------------------------------------------

@api.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    try:
        user_id = get_jwt_identity()  # Obtiene el ID del usuario desde el token
        user = User.query.get(user_id)  # Busca al usuario por su ID

        if not user:
            return jsonify({'error': 'User not found'}), 404  # Si el usuario no existe, devuelve error

        # Devuelve la información básica del usuario para confirmar que el token es válido
        user_info = {
            'id': user.id,
            'email': user.email
        }
        return jsonify({'message': 'Token is valid', 'user': user_info}), 200  # Devuelve un mensaje de éxito y la información del usuario

    except Exception as e:
        return jsonify({'error': str(e)}), 500  # En caso de error, devuelve un error interno del servidor

#-------------------CREAR  TOKEN LOGIN--------------------------------------------------------------------------

"""CREACION DE TOKEN CON GOOGLE ACCOUNT"""
@api.route('/token', methods=['POST'])  # Define una ruta de la API para la creación de tokens de usuario, permitiendo solo el método POST.
def create_normal_user_token():
    # Define la función que manejará las solicitudes a esta ruta.

    try:
        data = request.json  # Intenta obtener los datos en formato JSON enviados en la solicitud.
        if not data:
            return jsonify({'error': 'No data provided'}), 400  # Si no se proporcionan datos, responde con un error 400.

        email = data.get('email')  # Extrae el email de los datos recibidos.
        google_id = data.get('googleId')  # Extrae el google_id de los datos recibidos.
        password = data.get('password')  # Extrae el password de los datos recibidos.

        if not email:
            return jsonify({'error': 'Email is required'}), 400  # Si no se proporciona el email, responde con un error 400.

        existing_user = User.query.filter_by(email=email).first()  # Busca un usuario en la base de datos que coincida con el email proporcionado.
        if not existing_user:
            return jsonify({'error': 'Email does not exist.'}), 400  # Si no existe un usuario con ese email, responde con un error 400.

        if not existing_user.is_active:
            return jsonify({'error': 'Account deleted or not active'}), 400  # Si la cuenta del usuario no está activa, responde con un error 400.

        if google_id:  # Si se proporciona un google_id, intenta autenticación con Google.
            if existing_user.google_id == google_id:  # Si el google_id coincide con el registrado en la base de datos para ese usuario:
                expires = timedelta(hours=1)  # Define la expiración del token en una hora.
                user_id = existing_user.id  # Obtén el ID del usuario.
                access_token = create_access_token(identity=user_id, expires_delta=expires)  # Crea un token de acceso utilizando el ID del usuario.
                return jsonify({'access_token': access_token, 'login': True, 'user_id': user_id}), 200  # Responde con el token de acceso y un indicador de que el login fue exitoso.
            else:
                return jsonify({'error': 'Google ID does not match'}), 400  # Si el google_id no coincide, responde con un error 400.

        elif password:  # Si se proporciona una contraseña, intenta autenticación normal.
            password_user_db = existing_user.password  # Obtén la contraseña almacenada en la base de datos.
            true_o_false = check_password_hash(password_user_db, password)  # Verifica si la contraseña proporcionada coincide con la almacenada.

            if true_o_false:
                expires = timedelta(hours=1)  # Define la expiración del token en una hora.
                user_id = existing_user.id  # Obtén el ID del usuario.
                access_token = create_access_token(identity=user_id, expires_delta=expires)  # Crea un token de acceso utilizando el ID del usuario.
                return jsonify({'access_token': access_token, 'login': True, 'user_id': user_id}), 200  # Responde con el token de acceso y un indicador de que el login fue exitoso.
            else:
                return jsonify({'error': 'Incorrect password'}), 400  # Si la contraseña no coincide, responde con un error 400.

        else:
            return jsonify({'error': 'Password or Google ID is required'}), 400  # Si no se proporciona ni contraseña ni google_id, responde con un error 400.

    except Exception as e:
        return jsonify({'error': 'Error login user: ' + str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.


#-------------------CREAR  TOKEN recuperar contraseña--------------------------------------------------------------------------

@api.route('/tokenLoginHelp', methods=['POST'])  # Define un endpoint para crear un token de ayuda para el inicio de sesión.
def create_token_login_help():  # Define la función que manejará la solicitud POST.
    try:
        data = request.json  # Obtiene los datos JSON enviados en la solicitud.
        if not data or 'email' not in data:  # Verifica si no se proporcionaron datos o si falta el email.
            return jsonify({'error': 'Email is required'}), 400  # Devuelve un error si el email no está presente en los datos.

        existing_user = User.query.filter_by(email=data['email']).first()  # Busca un usuario en la base de datos con el email proporcionado.
        if existing_user:  # Si existe un usuario con ese email:
            expires = timedelta(hours=1)  # Define el tiempo de expiración del token a 1 hora.
            email = existing_user.email  # Obtiene el email del usuario existente.
            access_token = generate_confirmation_token_email(email)  # Genera un token de acceso para el usuario.

            # Enviar email con el token
            reset_url = url_for('api.verify_reset_token', token=access_token, _external=True)  # Genera la URL de restablecimiento de contraseña.
            BASE_URL_FRONT = os.getenv('FRONTEND_URL')  # Obtiene la URL base del frontend desde las variables de entorno.
            reset_url = f"{BASE_URL_FRONT}/reset-password?token={access_token}"  # Construye la URL completa de restablecimiento de contraseña.
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
            </head>
            <body>
                <div style="margin: 0 auto; width: 80%; padding: 20px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 3px #ccc;">
                    <h1 style="color: #333;">Reset Your Password</h1>
                    <p>Please click the button below to reset your password:</p>
                    <a href="{reset_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a>
                </div>
            </body>
            </html>"""  # Plantilla HTML para el email de restablecimiento de contraseña.

            send_email('Password Reset Request', data['email'], html)  # Envía el email de restablecimiento de contraseña al usuario.

            return jsonify({'message': 'Password reset email sent', 'login': True}), 200  # Devuelve un mensaje de éxito si se envió el email.
        else:
            return jsonify({'error': 'Email does not exist.'}), 400  # Devuelve un error si el email no existe en la base de datos.
    
    except Exception as e:  # Captura cualquier excepción que ocurra.
        return jsonify({'error': 'Error email user: ' + str(e)}), 500  # Devuelve un mensaje de error si ocurre un problema.

@api.route('/verify_reset_token/<string:token>', methods=['POST'])  # Define un endpoint para verificar el token de restablecimiento de contraseña.
def verify_reset_token(token):  # Define la función que manejará la solicitud POST.
    try:
        email = confirm_token_email(token)  # Valida el token y obtiene el email del usuario.
        if not email:  # Si el email no se pudo obtener:
            raise ValueError("Invalid token")  # Lanza un error indicando que el token es inválido.
        user = User.query.filter_by(email=email).first()  # Busca al usuario en la base de datos por su email.
        if not user:  # Si el usuario no existe:
            return jsonify({'error': 'User not found'}), 404  # Devuelve un error indicando que el usuario no fue encontrado.

        return jsonify({'user_id': user.id}), 200  # Devuelve el ID del usuario si se encuentra.
    except Exception as e:  # Captura cualquier excepción que ocurra.
        return jsonify(message=str(e)), 400  # Devuelve un mensaje de error si ocurre un problema.


# endpoint para cambiar contraseña con token de email
@api.route('/reset_password', methods=['PUT'])  # Define un endpoint para restablecer la contraseña del usuario.
def reset_password():  # Define la función que manejará la solicitud PUT.
    try:
        data = request.json  # Obtiene los datos JSON enviados en la solicitud.
        if not data or 'user_id' not in data or 'password' not in data:  # Verifica si no se proporcionaron datos, o si faltan el ID del usuario o la contraseña.
            return jsonify({'error': 'User ID and password must be provided'}), 400  # Devuelve un error si faltan datos.

        user_id = data['user_id']  # Obtiene el ID del usuario de los datos.
        user = User.query.get(user_id)  # Busca al usuario en la base de datos por su ID.

        if not user:  # Si el usuario no existe:
            return jsonify({'error': 'User not found'}), 404  # Devuelve un error indicando que el usuario no fue encontrado.

        password_hash = generate_password_hash(data['password']).decode('utf-8')  # Genera el hash de la nueva contraseña.
        user.password = password_hash  # Actualiza la contraseña del usuario.
        db.session.commit()  # Guarda los cambios en la base de datos.
        return jsonify({'message': 'Password updated successfully'}), 200  # Devuelve un mensaje de éxito si la contraseña se actualizó correctamente.

    except Exception as e:  # Captura cualquier excepción que ocurra.
        return jsonify({'error': str(e)}), 500  # Devuelve un mensaje de error si ocurre un problema.

#-------------------------------------------------ENPOINT PARA LA CARGA DE IMAGEN DE PERFIL-----------------------------------------------------------

# Define una ruta de API para subir imágenes utilizando el método POST
@api.route('/upload_img_profile', methods=['POST'])
@jwt_required()  # Decorador para requerir autenticación con JWT
def upload_img_profile():
    try:
        # Verifica si el archivo está presente en la solicitud
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']  # Obtiene el archivo de la solicitud
        
        if file.filename == '':  # Verifica si no se seleccionó ningún archivo
            return jsonify({'error': 'No selected file'}), 400
        
        user_id = get_jwt_identity()  # Obtiene el ID del usuario desde el token
        user = User.query.get(user_id)  # Busca al usuario por su ID
        if not user:
            return jsonify({'error': 'User not found'}), 404  # Si el usuario no existe, devuelve error
        
        if file and allowed_file(file.filename):  # Verifica si el archivo está presente y tiene un formato permitido
            file_data = file.read()  # Lee los datos del archivo
            
            new_img = ProfileImage(img_data=file_data)  # Crea un nuevo registro en la base de datos con los datos del archivo
            db.session.add(new_img)
            user.profile_image = new_img
            db.session.commit()  # Guarda los cambios en la base de datos
            
            return jsonify({'message': 'File uploaded successfully'}), 200
        
        return jsonify({'error': 'Invalid file format'}), 400  # Si el archivo no tiene un formato permitido, retorna un mensaje de error
    except Exception as e:
        db.session.rollback()  # Realiza un rollback en la base de datos para evitar inconsistencias debido al error
        return jsonify({'error': str(e)}), 500  # Retorna un mensaje de error con el código de estado HTTP 500

# Define una ruta de API para actualizar imágenes utilizando el método PUT
@api.route('/update_profile_image', methods=['PUT'])
@jwt_required()  # Decorador para requerir autenticación con JWT
def update_profile_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        user_id = get_jwt_identity()  # Obtiene el ID del usuario desde el token
        user = User.query.get(user_id)  # Busca al usuario por su ID
        if not user:
            return jsonify({'error': 'User not found'}), 404  # Si el usuario no existe, devuelve error
        
        if file and allowed_file(file.filename):  # Verifica si el archivo está presente y tiene un formato permitido
            file_data = file.read()  # Lee los datos del archivo

        if user.profile_image:
            user.profile_image.img_data = file_data
        else:
            new_image = ProfileImage(img_data=file_data)
            db.session.add(new_image)
            user.profile_image = new_image
        db.session.commit()  # Guarda los cambios en la base de datos
        return jsonify({'message': 'Profile image updated successfully'}), 200
    except Exception as e:
        db.session.rollback()  # Realiza un rollback en la base de datos para evitar inconsistencias debido al error
        return jsonify({'error': str(e)}), 500  # Retorna un mensaje de error con el código de estado HTTP 500

# Define una ruta de API para eliminar imágenes utilizando el método DELETE
@api.route('/delete_profile_image', methods=['DELETE'])
@jwt_required()  # Decorador para requerir autenticación con JWT
def delete_profile_image():
    try:
        user_id = get_jwt_identity()  # Obtiene el ID del usuario desde el token
        user = User.query.get(user_id)  # Busca al usuario por su ID
        if not user:
            return jsonify({'error': 'User not found'}), 404  # Si el usuario no existe, devuelve error
        
        if user.profile_image:
            db.session.delete(user.profile_image)
            db.session.commit()  # Guarda los cambios en la base de datos
        return jsonify({'message': 'Profile image deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()  # Realiza un rollback en la base de datos para evitar inconsistencias debido al error
        return jsonify({'error': str(e)}), 500  # Retorna un mensaje de error con el código de estado HTTP 500

#-------------------------------------------------ENPOINT PARA LA GESTION DE POSTS-----------------------------------------------------------
"""CREAR POSTS"""
@api.route('/posts', methods=['POST'])  # Define una ruta de la API para crear publicaciones, permitiendo solo el método POST.
@jwt_required()  # Requiere autenticación JWT para acceder a esta ruta.
def create_post():
    # Define la función que manejará las solicitudes a esta ruta.

    try:
        data = request.form  # Obtiene los datos del formulario enviados en la solicitud.
        if not data:
            return jsonify({'error': 'No data provided'}), 400  # Si no se proporcionan datos, responde con un error 400.

        current_user_id = get_jwt_identity()  # Obtiene el ID del usuario actual a partir del token JWT.
        
        new_post = Post(
            message=data['message'],  # Establece el mensaje de la nueva publicación.
            author_id=current_user_id,  # Establece el ID del autor como el ID del usuario actual.
            location=data['location'],  # Establece la ubicación de la publicación.
            status=data['status']  # Establece el estado de la publicación.
        )
        db.session.add(new_post)  # Añade la nueva publicación a la sesión de la base de datos.
        db.session.commit()  # Confirma los cambios en la base de datos.

        # Subir imágenes
        files = request.files.getlist('images')  # Obtiene la lista de archivos de imágenes del formulario.
        for file in files:
            new_image = PostImage(post_id=new_post.id, img_data=file.read())  # Crea una nueva imagen asociada a la publicación.
            db.session.add(new_image)  # Añade la imagen a la sesión de la base de datos.
        db.session.commit()  # Confirma los cambios en la base de datos.

        return jsonify({'message': 'Post created successfully', 'post': new_post.serialize()}), 201  # Responde con un mensaje de éxito y los datos de la publicación.
    
    except Exception as e:
        db.session.rollback()  # Si ocurre un error, deshace cualquier cambio realizado en la sesión de la base de datos.
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.




"""EDITAR POSTS"""
@api.route('/posts/<int:post_id>', methods=['PUT'])  # Define una ruta de la API para editar una publicación específica, permitiendo solo el método PUT.
@jwt_required()  # Requiere autenticación JWT para acceder a esta ruta.
def edit_post(post_id):
    # Define la función que manejará las solicitudes a esta ruta.

    try:
        data = request.form  # Obtiene los datos del formulario enviados en la solicitud.
        if not data:
            return jsonify({'error': 'No data provided'}), 400  # Si no se proporcionan datos, responde con un error 400.

        current_user_id = get_jwt_identity()  # Obtiene el ID del usuario actual a partir del token JWT.
        post = Post.query.filter_by(id=post_id, author_id=current_user_id).first()  # Busca la publicación por su ID y el ID del autor.
        if not post:
            return jsonify({'error': 'Post not found or not authorized'}), 404  # Si la publicación no se encuentra o el usuario no está autorizado, responde con un error 404.

        post.message = data.get('message', post.message)  # Actualiza el mensaje de la publicación si se proporciona, o deja el actual.
        post.location = data.get('location', post.location)  # Actualiza la ubicación de la publicación si se proporciona, o deja la actual.
        post.status = data.get('status', post.status)  # Actualiza el estado de la publicación si se proporciona, o deja el actual.

        # Subir nuevas imágenes
        files = request.files.getlist('images')  # Obtiene la lista de archivos de imágenes del formulario.
        if files:
            # Borrar las imágenes antiguas
            for image in post.images:  # Itera sobre las imágenes actuales de la publicación.
                db.session.delete(image)  # Elimina cada imagen de la base de datos.

            # Subir nuevas imágenes
            for file in files:  # Itera sobre los nuevos archivos de imágenes proporcionados.
                new_image = PostImage(post_id=post.id, img_data=file.read())  # Crea una nueva imagen asociada a la publicación.
                db.session.add(new_image)  # Añade la nueva imagen a la sesión de la base de datos.
        
        db.session.commit()  # Confirma los cambios en la base de datos.
        return jsonify({'message': 'Post updated successfully', 'post': post.serialize()}), 200  # Responde con un mensaje de éxito y los datos de la publicación actualizada.
    
    except Exception as e:
        db.session.rollback()  # Si ocurre un error, deshace cualquier cambio realizado en la sesión de la base de datos.
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.



"""ELIMINAR POSTS"""
@api.route('/posts/<int:post_id>', methods=['DELETE'])  # Define una ruta de la API para eliminar (marcar como eliminado) una publicación específica, permitiendo solo el método DELETE.
@jwt_required()  # Requiere autenticación JWT para acceder a esta ruta.
def delete_post(post_id):
    # Define la función que manejará las solicitudes a esta ruta.

    try:
        current_user_id = get_jwt_identity()  # Obtiene el ID del usuario actual a partir del token JWT.
        post = Post.query.filter_by(id=post_id, author_id=current_user_id).first()  # Busca la publicación por su ID y el ID del autor.
        if not post:
            return jsonify({'error': 'Post not found or not authorized'}), 404  # Si la publicación no se encuentra o el usuario no está autorizado, responde con un error 404.

        post.status = 'deleted'  # Cambia el estado de la publicación a 'deleted' en lugar de eliminarla físicamente.
        db.session.commit()  # Confirma los cambios en la base de datos.
        return jsonify({'message': 'Post marked as deleted successfully'}), 200  # Responde con un mensaje de éxito indicando que la publicación ha sido marcada como eliminada.
    
    except Exception as e:
        db.session.rollback()  # Si ocurre un error, deshace cualquier cambio realizado en la sesión de la base de datos.
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.




"""OBTENER POSTS DE USER"""
@api.route('/user/posts', methods=['GET'])  # Define una ruta de la API para obtener todas las publicaciones de un usuario, permitiendo solo el método GET.
@jwt_required()  # Requiere autenticación JWT para acceder a esta ruta.
def get_user_posts():
    user_id = get_jwt_identity()  # Obtiene el ID del usuario actual a partir del token JWT.
    
    try:
        # Filtrar publicaciones por autor y estado diferente de 'deleted'
        posts = Post.query.filter_by(author_id=user_id).filter(Post.status != 'deleted').order_by(Post.created_at.desc()).all()  
        # Obtiene todas las publicaciones del usuario actual que no estén marcadas como 'deleted', ordenadas por fecha de creación de forma descendente.
        
        return jsonify([post.serialize() for post in posts]), 200  # Devuelve la lista de publicaciones serializadas en formato JSON.
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.

    
"""OBTENER TODOS LOS POSTS"""
@api.route('/allposts', methods=['GET'])  # Define una ruta de la API para obtener todas las publicaciones, permitiendo solo el método GET.
def get_all_posts():
    try:
        # Filtrar publicaciones por estado diferente de 'deleted'
        posts = Post.query.filter(Post.status != 'deleted').order_by(Post.created_at.desc()).all()  
        # Obtiene todas las publicaciones cuyo estado no sea 'deleted', ordenadas por fecha de creación de forma descendente.
        
        return jsonify([post.serialize() for post in posts]), 200  # Devuelve la lista de publicaciones serializadas en formato JSON.
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.


"""Dar y Quitar Likes"""
@api.route('/post/<int:post_id>/like', methods=['POST'])  # Define una ruta de la API para dar o quitar un like en una publicación específica, permitiendo solo el método POST.
@jwt_required()  # Requiere autenticación JWT para acceder a esta ruta.
def toggle_like(post_id):
    try:
        user_id = get_jwt_identity()  # Obtiene el ID del usuario actual a partir del token JWT.
        post = Post.query.get(post_id)  # Busca la publicación por su ID.
        if not post:
            return jsonify({'error': 'Post not found'}), 404  # Si la publicación no se encuentra, responde con un error 404.

        like = Likes.query.filter_by(user_id=user_id, post_id=post_id).first()  # Busca si el usuario actual ya ha dado like a la publicación.

        if like:
            db.session.delete(like)  # Si el like existe, lo elimina.
            db.session.commit()  # Confirma los cambios en la base de datos.
            message = 'Like removed'  # Establece el mensaje de respuesta indicando que el like ha sido eliminado.
        else:
            new_like = Likes(user_id=user_id, post_id=post_id)  # Si el like no existe, crea un nuevo like.
            db.session.add(new_like)  # Añade el nuevo like a la sesión de la base de datos.
            db.session.commit()  # Confirma los cambios en la base de datos.
            message = 'Like added'  # Establece el mensaje de respuesta indicando que el like ha sido añadido.

        # Obtener la lista de IDs de los usuarios que han dado like
        liked_by_user = [like.user_id for like in Likes.query.filter_by(post_id=post_id).all()]  # Obtiene los IDs de los usuarios que han dado like a la publicación.

        # Contar el número total de likes
        likes_count = len(liked_by_user)  # Cuenta el número total de likes en la publicación.

        return jsonify({
            'message': message,
            'liked_by_user': liked_by_user,
            'likes_count': likes_count
        }), 200  # Devuelve un mensaje indicando si el like fue añadido o eliminado, junto con los datos actualizados de la publicación.
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.

"""
Obtener usuario especifico
"""
@api.route('/user/profile/<string:username>', methods=['GET'])  # Define una ruta de la API para obtener el perfil de un usuario específico, permitiendo solo el método GET.
@jwt_required()  # Requiere autenticación JWT para acceder a esta ruta.
def get_other_user_profile(username):
    try:
        user = User.query.filter_by(username=username).first()  # Busca al usuario por su nombre de usuario.
        if not user:
            return jsonify({'error': 'User not found'}), 404  # Si el usuario no se encuentra, responde con un error 404.

        posts = Post.query.filter_by(author_id=user.id).filter(Post.status != 'deleted').order_by(Post.created_at.desc()).all()  
        # Obtiene todas las publicaciones del usuario cuyo estado no sea 'deleted', ordenadas por fecha de creación de forma descendente.
        
        user_data = user.serialize()  # Serializa los datos del usuario.
        user_posts = [post.serialize() for post in posts]  # Serializa las publicaciones del usuario.

        return jsonify({
            'user': user_data,
            'posts': user_posts
        }), 200  # Devuelve los datos del usuario y sus publicaciones en formato JSON.
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Captura cualquier excepción y responde con un error 500, incluyendo el mensaje de error.


"""
Búsqueda de Usuarios
"""
@api.route('/users/search', methods=['GET'])  # Define una ruta de la API para buscar usuarios, permitiendo solo el método GET.
def search_users():
    query = request.args.get('query', '')  # Obtiene el parámetro de búsqueda enviado en la URL.
    
    users = User.query.filter(
        db.or_(
            User.name.ilike(f'%{query}%'),  # Busca coincidencias en el nombre del usuario, ignorando mayúsculas y minúsculas.
            User.last_name.ilike(f'%{query}%'),  # Busca coincidencias en el apellido del usuario, ignorando mayúsculas y minúsculas.
            User.username.ilike(f'%{query}%')  # Busca coincidencias en el nombre de usuario, ignorando mayúsculas y minúsculas.
        )
    ).all()  # Devuelve todos los usuarios que coinciden con la búsqueda.
    
    response = [user.serialize() for user in users]  # Serializa los datos de los usuarios encontrados.
    return jsonify(response), 200  # Devuelve la lista de usuarios encontrados en formato JSON.


