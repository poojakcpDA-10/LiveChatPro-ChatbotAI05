from flask import render_template, Blueprint

main = Blueprint(__name__)

@main.route('/')
def home():
    return "home"

@main.route('/profile')
def profile():
    return "profile"

@main.route('/hello')
def hello():
    return "Hello world"
