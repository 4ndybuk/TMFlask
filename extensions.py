# Database extensions
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import LoginManager
from flask_mail import Mail

# Prevent brute force on login/register routes by IP address
limiter = Limiter(key_func=get_remote_address)
# Manage user access
login_manager = LoginManager()
# Flask mail
mail = Mail()

