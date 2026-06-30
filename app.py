import os
import sys
from dotenv import load_dotenv
load_dotenv()
from flask import Flask, render_template, session, request
from flask_talisman import Talisman
from flask_mail import Mail, Message
from flask_wtf import CSRFProtect
from flask_wtf.csrf import CSRFError
from flask_cors import CORS
from flaskforms import *
from extensions import limiter, login_manager
from models import db, User

basedir = os.path.abspath(os.path.dirname(__file__))

# Initialise and configure the database
app = Flask(__name__)
print("Flask app created!")

DEBUG_MODE = os.environ.get('FLASK_DEBUG', '0') == '1'
app.config['DEBUG'] = DEBUG_MODE

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'ticketbase.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
# Only send cookie over HTTPS
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True  # prevent JS from accessing cookie
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' # prevent cross-site requests
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 # 100MB limit

# Forcing HTTPS redirection and automatic security headers
talisman = Talisman(app,
                    force_https=False,
                    content_security_policy=False)

# Allow requests only from specific frontend origins
CORS(app, origins="*")

# Create CSFR instance
csrf = CSRFProtect(app)

# Init extensions
db.init_app(app)
limiter.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "auth.login"
print("Login manager initialised!")

# Load user for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

from auth import auth
from table import table_bp
from tickets import tickets
from process import process

# Register blueprint routes
app.register_blueprint(auth)
app.register_blueprint(table_bp)
app.register_blueprint(tickets)
app.register_blueprint(process)

@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    import sys
    sys.stderr.write(f"CSRF Error: {e.description}\n")
    sys.stderr.write(f"Session: {session}\n")
    sys.stderr.write(f"Cookies: {request.cookies}\n")
    sys.stderr.flush()
    return f"CSRF Error: {e.description}", 400

# Main route
@app.route('/')
def home():
    return render_template("home_btns.html")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=os.environ.get("FLASK_DEBUG", '0') == 1)
