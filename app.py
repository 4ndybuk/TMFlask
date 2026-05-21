import os
from flask import Flask, render_template
from flask_talisman import Talisman
from flask_mail import Mail, Message
from flask_wtf import CSRFProtect
from flask_cors import CORS
from flaskforms import *
from dotenv import load_dotenv
load_dotenv()
from extensions import limiter, login_manager
from models import db
from auth import auth
from table import table_bp
from tickets import tickets
from process import process

basedir = os.path.abspath(os.path.dirname(__file__))

# Initialise and configure the database
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'ticketbase.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
# Only send cookie over HTTPS
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True  # prevent JS from accessing cookie
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' # prevent cross-site requests
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 # 100MB limit

# Forcing HTTPS redirection and automatic security headers
talisman = Talisman(app,
                    force_https=os.environ.get('FLASK_ENV') == 'production',
                    content_security_policy=False)

# Allow requests only from specific frontend origins
CORS(app, origins=["http://127.0.0.1:5000"])

# Create CSFR instance
csrf = CSRFProtect(app)

# Init extensions
db.init_app(app)
limiter.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "auth.login"

# Register blueprint routes
app.register_blueprint(auth)
app.register_blueprint(table_bp)
app.register_blueprint(tickets)
app.register_blueprint(process)

# Main route
@app.route('/')
def home():
    return render_template("home_btns.html")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)