import os
from flask import Blueprint, jsonify, session, request
from flaskforms import LoginForm, RegisterForm
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, current_user, logout_user
from flask import flash, redirect, url_for, render_template
from extensions import limiter, login_manager
from models import User, db

auth = Blueprint('auth', __name__)

# Valid access codes for registration
VALID_ACCESS_CODES = os.environ.get('ACCESS_CODES', '').split(',')

# Index page (Login)
@auth.route('/login', methods=['GET', 'POST'])
@limiter.limit("8 per minute")
def login():
    form = LoginForm()
    # Validate input form
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        # Validate login
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            flash("Logged in successfully", "success")
            return redirect(url_for('table.table'))
        else:
            return render_template('login.html', form=form, error="Invalid username or password")
    return render_template('login.html', form=form)

# Register account for access
@auth.route('/register', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def register():
    print("SESSION AT REGISTER:", dict(session))
    print("METHOD:", request.method)
    form = RegisterForm()
    print("CSRF TOKEN IN FORM:", form.csrf_token.data)
    if form.validate_on_submit():
        # Check existing username
        if User.query.filter_by(username=form.username.data).first():
            return render_template("register.html", form=form, error="Username already taken!")
        # Check access code for authenticity
        if form.access_code.data not in VALID_ACCESS_CODES:
            return render_template("register.html", form=form, error="Invalid access code, please try again.")
        # Encyrpt the password and store new user to the database
        hashed_password = generate_password_hash(form.password.data, method="pbkdf2:sha256", salt_length=16)
        new_user = User(name=form.name.data, username=form.username.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        # Redirect to the login page
        return redirect(url_for('auth.login'))
    return render_template("register.html", form=form)

# Verify existing users
@auth.route('/verify_user/<username>', methods=['GET'])
@login_required
def verify_user(username):
    user = User.query.filter_by(username=username).first()
    return jsonify({
        'exists': user is not None,
        'name': user.name if user else None
        })

# Confirm user permissions to the ticket
@auth.route('/confirm_user', methods=['GET'])
@login_required
def confirm_user():
    return jsonify({
        'logged_user': current_user.username
    })

# Logout
@auth.route('/logout')   
@login_required
def logout():
    logout_user()
    flash("Logged out", "info")
    return redirect(url_for("auth.login"))

