# Database models
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

# User identity model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    username = db.Column(db.String(200), unique=True, nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

# Ticket Database
class Database(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(30), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    ticket_name = db.Column(db.String(25), nullable=False)
    ticket_id = db.Column(db.Integer, nullable=False)
    urg = db.Column(db.String(10), nullable=False)
    location = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(10), nullable=False)
    history = db.Column(db.Text, nullable=True, default="[]")
    project = db.Column(db.String(150), nullable=False)
    process_data = db.Column(db.Text, nullable=True, default="[]")
    parent_id = db.Column(db.Integer, nullable=True)
    stage = db.Column(db.String, nullable=True)
    permissions = db.Column(db.Text, nullable=True, default="[]")
    visibility = db.Column(db.String(20), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    creator = db.relationship("User", backref="tickets")
    uploads = db.Column(db.Text, nullable=False, default="[]")
