import click  # Importa la biblioteca click que se utiliza para crear comandos en la CLI.
from api.models import db, User, Post, PostImage, Likes, ProfileImage  # Importa los modelos de la base de datos desde el archivo models.
from flask import Flask  # Importa Flask para crear la aplicación.
from faker import Faker  # Importa Faker para generar datos falsos.
import requests  # Importa requests para hacer peticiones HTTP.

fake = Faker()  # Crea una instancia de Faker para generar datos falsos.

"""
COMANDO PARA REINICIAR MIGRACIONES:

rm -R -f ./migrations &&
pipenv run init &&
dropdb -h localhost -U postgres facebook_app_db || true &&
createdb -h localhost -U postgres facebook_app_db || true &&
psql -h localhost postgres -U facebook_app_db -c 'CREATE EXTENSION unaccent;' || true &&
pipenv run migrate &&
pipenv run upgrade

cambia >>>>> facebook_app_db <<<<<< por el nombre de tu base de datos

LUEGO DE BORRAR LA BASE DE DATOS CORRE EL ENTORNO VIRTUAL:
pipenv shell

SI DA ERROR VERIFICA SI TIENES pipenv install flask-migrate INSTALADO. SI NO, INSTÁLALO.
pipenv install Flask

flask insert-test-data 10 5 15

                user/posts/likes

"""

def setup_commands(app):  # Define una función para configurar comandos personalizados en la aplicación Flask.

    @app.cli.command("insert-test-users")  # Define un nuevo comando CLI llamado "insert-test-users".
    @click.argument("count")  # Define un argumento CLI que acepta un número, "count".
    def insert_test_users(count):  # Define la función que se ejecutará cuando se invoque el comando.
        print("Creating test users")  # Imprime un mensaje indicando que se están creando usuarios de prueba.
        for x in range(1, int(count) + 1):  # Itera desde 1 hasta el valor de "count" para crear múltiples usuarios.
            user = User(
                email=f"test_user{x}@test.com",  # Genera un correo electrónico para el usuario.
                password="123456",  # Asigna una contraseña por defecto.
                is_active=True,  # Establece el usuario como activo.
                username=f"testuser{x}",  # Genera un nombre de usuario único.
                name=fake.first_name(),  # Genera un nombre falso.
                last_name=fake.last_name(),  # Genera un apellido falso.
                image_url=fake.image_url(),  # Genera una URL de imagen falsa.
                role="user"  # Asigna un valor predeterminado para el campo 'role'.
            )
            db.session.add(user)  # Agrega el nuevo usuario a la sesión de la base de datos.
        db.session.commit()  # Confirma la transacción en la base de datos.
        print("All test users created")  # Imprime un mensaje indicando que todos los usuarios han sido creados.

    @app.cli.command("insert-test-data")  # Define un nuevo comando CLI llamado "insert-test-data".
    @click.argument("user_count")  # Define un argumento CLI para el número de usuarios a crear.
    @click.argument("post_count")  # Define un argumento CLI para el número de publicaciones a crear.
    @click.argument("likes_count")  # Define un argumento CLI para el número de "me gusta" a crear.
    def insert_test_data(user_count, post_count, likes_count):  # Define la función que se ejecutará cuando se invoque el comando.
        insert_users(int(user_count))  # Llama a la función para insertar usuarios con el número especificado.
        insert_posts(int(post_count))  # Llama a la función para insertar publicaciones con el número especificado.
        insert_likes(int(likes_count))  # Llama a la función para insertar "me gusta" con el número especificado.

    def insert_users(count):  # Define una función para crear usuarios de prueba.
        print("Creating test users")  # Imprime un mensaje indicando que se están creando usuarios de prueba.
        for _ in range(count):  # Itera la cantidad de veces especificada en "count".
            user = User(
                email=fake.email(),  # Genera un correo electrónico falso.
                password="123456",  # Asigna una contraseña por defecto.
                is_active=True,  # Establece el usuario como activo.
                username=fake.user_name(),  # Genera un nombre de usuario falso.
                name=fake.first_name(),  # Genera un nombre falso.
                last_name=fake.last_name(),  # Genera un apellido falso.
                image_url=fake.image_url(),  # Genera una URL de imagen falsa.
                role="user"  # Asegura que el campo 'role' tenga siempre un valor.
            )
            # Validación adicional para asegurar que 'role' nunca sea None
            if not user.role:
                user.role = "user"
            db.session.add(user)  # Agrega el nuevo usuario a la sesión de la base de datos.
        db.session.commit()  # Confirma la transacción en la base de datos.
        print(f"{count} users created.")  # Imprime un mensaje indicando cuántos usuarios han sido creados.

    def insert_posts(count):  # Define una función para crear publicaciones de prueba.
        users = User.query.all()  # Consulta todos los usuarios en la base de datos.
        print("Creating test posts")  # Imprime un mensaje indicando que se están creando publicaciones de prueba.
        for _ in range(count):  # Itera la cantidad de veces especificada en "count".
            user = fake.random_element(users)  # Selecciona un usuario aleatorio.
            post = Post(
                message=fake.sentence(),  # Genera un mensaje falso para la publicación.
                author_id=user.id,  # Asocia la publicación con el ID del usuario seleccionado.
                location=fake.city(),  # Genera una ciudad falsa para la ubicación de la publicación.
                status="active"  # Establece el estado de la publicación como "activa".
            )
            db.session.add(post)  # Agrega la nueva publicación a la sesión de la base de datos.
            db.session.commit()  # Confirma la transacción en la base de datos.
            for _ in range(fake.random_int(min=1, max=3)):  # Genera entre 1 y 3 imágenes para la publicación.
                img_url = "https://picsum.photos/200/300"  # URL de una imagen aleatoria proporcionada por picsum.photos.
                img_data = requests.get(img_url).content  # Realiza una petición HTTP para obtener la imagen y guarda el contenido.
                post_image = PostImage(post_id=post.id, img_data=img_data)  # Crea un objeto PostImage con la imagen obtenida y lo asocia con la publicación.
                db.session.add(post_image)  # Agrega la imagen de la publicación a la sesión de la base de datos.
            db.session.commit()  # Confirma la transacción en la base de datos para las imágenes.
        print(f"{count} posts created.")  # Imprime un mensaje indicando cuántas publicaciones han sido creadas.

    def insert_likes(count):  # Define una función para crear "me gusta" de prueba.
        users = User.query.all()  # Consulta todos los usuarios en la base de datos.
        posts = Post.query.all()  # Consulta todas las publicaciones en la base de datos.
        print("Creating test likes")  # Imprime un mensaje indicando que se están creando "me gusta" de prueba.
        for _ in range(count):  # Itera la cantidad de veces especificada en "count".
            user = fake.random_element(users)  # Selecciona un usuario aleatorio.
            post = fake.random_element(posts)  # Selecciona una publicación aleatoria.
            like = Likes(user_id=user.id, post_id=post.id)  # Crea un objeto Like asociando el usuario y la publicación seleccionados.
            db.session.add(like)  # Agrega el "me gusta" a la sesión de la base de datos.
        db.session.commit()  # Confirma la transacción en la base de datos.
        print(f"{count} likes created.")  # Imprime un mensaje indicando cuántos "me gusta" han sido creados.









# def setup_commands(app):  # Define una función para configurar comandos personalizados en la aplicación Flask.

#     @app.cli.command("insert-test-users")  # Define un nuevo comando CLI llamado "insert-test-users".
#     @click.argument("count")  # Define un argumento CLI que acepta un número, "count".
#     def insert_test_users(count):  # Define la función que se ejecutará cuando se invoque el comando.
#         print("Creating test users")  # Imprime un mensaje indicando que se están creando usuarios de prueba.
#         for x in range(1, int(count) + 1):  # Itera desde 1 hasta el valor de "count" para crear múltiples usuarios.
#             user = User(
#                 email=f"test_user{x}@test.com",  # Genera un correo electrónico para el usuario.
#                 password="123456",  # Asigna una contraseña por defecto.
#                 is_active=True,  # Establece el usuario como activo.
#                 username=f"testuser{x}",  # Genera un nombre de usuario único.
#                 name=fake.first_name(),  # Genera un nombre falso.
#                 last_name=fake.last_name(),  # Genera un apellido falso.
#                 image_url=fake.image_url(),  # Genera una URL de imagen falsa.
#                 role="customer"  # Asigna un valor predeterminado para el campo 'role'.

#             )
#             db.session.add(user)  # Agrega el nuevo usuario a la sesión de la base de datos.
#             db.session.commit()  # Confirma la transacción en la base de datos.
#             print("User: ", user.email, " created.")  # Imprime un mensaje indicando que el usuario ha sido creado.
#         print("All test users created")  # Imprime un mensaje indicando que todos los usuarios han sido creados.

#     @app.cli.command("insert-test-data")  # Define un nuevo comando CLI llamado "insert-test-data".
#     @click.argument("user_count")  # Define un argumento CLI para el número de usuarios a crear.
#     @click.argument("post_count")  # Define un argumento CLI para el número de publicaciones a crear.
#     @click.argument("likes_count")  # Define un argumento CLI para el número de "me gusta" a crear.
#     def insert_test_data(user_count, post_count, likes_count):  # Define la función que se ejecutará cuando se invoque el comando.
#         insert_users(int(user_count))  # Llama a la función para insertar usuarios con el número especificado.
#         insert_posts(int(post_count))  # Llama a la función para insertar publicaciones con el número especificado.
#         insert_likes(int(likes_count))  # Llama a la función para insertar "me gusta" con el número especificado.

#     def insert_users(count):  # Define una función para crear usuarios de prueba.
#         print("Creating test users")  # Imprime un mensaje indicando que se están creando usuarios de prueba.
#         for _ in range(count):  # Itera la cantidad de veces especificada en "count".
#             user = User(
#                 email=fake.email(),  # Genera un correo electrónico falso.
#                 password="123456",  # Asigna una contraseña por defecto.
#                 is_active=True,  # Establece el usuario como activo.
#                 username=fake.user_name(),  # Genera un nombre de usuario falso.
#                 name=fake.first_name(),  # Genera un nombre falso.
#                 last_name=fake.last_name(),  # Genera un apellido falso.
#                 image_url=fake.image_url()  # Genera una URL de imagen falsa.
#             )
#             db.session.add(user)  # Agrega el nuevo usuario a la sesión de la base de datos.
#         db.session.commit()  # Confirma la transacción en la base de datos.
#         print(f"{count} users created.")  # Imprime un mensaje indicando cuántos usuarios han sido creados.

#     def insert_posts(count):  # Define una función para crear publicaciones de prueba.
#         users = User.query.all()  # Consulta todos los usuarios en la base de datos.
#         print("Creating test posts")  # Imprime un mensaje indicando que se están creando publicaciones de prueba.
#         for _ in range(count):  # Itera la cantidad de veces especificada en "count".
#             user = fake.random_element(users)  # Selecciona un usuario aleatorio.
#             post = Post(
#                 message=fake.sentence(),  # Genera un mensaje falso para la publicación.
#                 author_id=user.id,  # Asocia la publicación con el ID del usuario seleccionado.
#                 location=fake.city(),  # Genera una ciudad falsa para la ubicación de la publicación.
#                 status="active"  # Establece el estado de la publicación como "activa".
#             )
#             db.session.add(post)  # Agrega la nueva publicación a la sesión de la base de datos.
#             db.session.commit()  # Confirma la transacción en la base de datos.
#             for _ in range(fake.random_int(min=1, max=3)):  # Genera entre 1 y 3 imágenes para la publicación.
#                 img_url = "https://picsum.photos/200/300"  # URL de una imagen aleatoria proporcionada por picsum.photos.
#                 img_data = requests.get(img_url).content  # Realiza una petición HTTP para obtener la imagen y guarda el contenido.
#                 post_image = PostImage(post_id=post.id, img_data=img_data)  # Crea un objeto PostImage con la imagen obtenida y lo asocia con la publicación.
#                 db.session.add(post_image)  # Agrega la imagen de la publicación a la sesión de la base de datos.
#             db.session.commit()  # Confirma la transacción en la base de datos para las imágenes.
#         print(f"{count} posts created.")  # Imprime un mensaje indicando cuántas publicaciones han sido creadas.

#     def insert_likes(count):  # Define una función para crear "me gusta" de prueba.
#         users = User.query.all()  # Consulta todos los usuarios en la base de datos.
#         posts = Post.query.all()  # Consulta todas las publicaciones en la base de datos.
#         print("Creating test likes")  # Imprime un mensaje indicando que se están creando "me gusta" de prueba.
#         for _ in range(count):  # Itera la cantidad de veces especificada en "count".
#             user = fake.random_element(users)  # Selecciona un usuario aleatorio.
#             post = fake.random_element(posts)  # Selecciona una publicación aleatoria.
#             like = Likes(user_id=user.id, post_id=post.id)  # Crea un objeto Like asociando el usuario y la publicación seleccionados.
#             db.session.add(like)  # Agrega el "me gusta" a la sesión de la base de datos.
#         db.session.commit()  # Confirma la transacción en la base de datos.
#         print(f"{count} likes created.")  # Imprime un mensaje indicando cuántos "me gusta" han sido creados.
