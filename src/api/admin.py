  
import os
from flask_admin import Admin
from .models import db, User, ProfileImage, Post, PostImage, Likes
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    return """<!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>403 - Acceso Denegado</title>
                </head>
                <body>
                    <h1>403 - Acceso Denegado</h1>
                </body>
                </html>"""

    # app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    # app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    # admin = Admin(app, name='Admin Management', template_mode='bootstrap3')

    
    # # Add your models here, for example this is how we add a the User model to the admin
    # admin.add_view(ModelView(User, db.session))
    # admin.add_view(ModelView(ProfileImage, db.session))
    # admin.add_view(ModelView(Post, db.session))
    # admin.add_view(ModelView(PostImage, db.session))
    # admin.add_view(ModelView(Likes, db.session))

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))