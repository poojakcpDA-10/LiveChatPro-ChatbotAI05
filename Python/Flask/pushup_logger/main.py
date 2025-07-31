from flask import Blueprint, render_template

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
