from flask import Blueprint,render_template

auth = Blueprint(__name__)

@auth.route('/signup')
def signup():
    return 'signup'

@auth.route('/login')
def login():
    return 'login success'

@auth.route('/logout')
def logout():
    return 'logout'