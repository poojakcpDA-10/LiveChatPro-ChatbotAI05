from flask import Flask


app = Flask(__name__)

from .main import main as main_bp
app.register_blueprint('main_bp')
from .auth import auth as auth_bp
app.register_blueprint('auth_bp')




