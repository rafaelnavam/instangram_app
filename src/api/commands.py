import click
from api.models import db, User, Post, PostImage, Likes, ProfileImage
from flask import Flask
from faker import Faker
import requests

fake = Faker()

""" 
This is an example command "insert-test-users" that you can run from the command line
by typing: $ flask insert-test-users 5
Note: 5 is the number of users to add
"""
def setup_commands(app):

    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User(
                email=f"test_user{x}@test.com",
                password="123456",
                is_active=True,
                username=f"testuser{x}",
                name=fake.first_name(),
                last_name=fake.last_name(),
                image_url=fake.image_url()
            )
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-data")
    @click.argument("user_count")
    @click.argument("post_count")
    @click.argument("likes_count")
    def insert_test_data(user_count, post_count, likes_count):
        insert_users(int(user_count))
        insert_posts(int(post_count))
        insert_likes(int(likes_count))

    def insert_users(count):
        print("Creating test users")
        for _ in range(count):
            user = User(
                email=fake.email(),
                password="123456",
                is_active=True,
                username=fake.user_name(),
                name=fake.first_name(),
                last_name=fake.last_name(),
                image_url=fake.image_url()
            )
            db.session.add(user)
        db.session.commit()
        print(f"{count} users created.")

    def insert_posts(count):
        users = User.query.all()
        print("Creating test posts")
        for _ in range(count):
            user = fake.random_element(users)
            post = Post(
                message=fake.sentence(),
                author_id=user.id,
                location=fake.city(),
                status="active"
            )
            db.session.add(post)
            db.session.commit()

            # Add fake images to the post
            for _ in range(fake.random_int(min=1, max=3)):
                img_url = "https://picsum.photos/200/300"
                img_data = requests.get(img_url).content
                post_image = PostImage(post_id=post.id, img_data=img_data)
                db.session.add(post_image)
            db.session.commit()
        print(f"{count} posts created.")

    def insert_likes(count):
        users = User.query.all()
        posts = Post.query.all()
        print("Creating test likes")
        for _ in range(count):
            user = fake.random_element(users)
            post = fake.random_element(posts)
            like = Likes(user_id=user.id, post_id=post.id)
            db.session.add(like)
        db.session.commit()
        print(f"{count} likes created.")
