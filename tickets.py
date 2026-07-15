import os
from flask import Blueprint, request, flash, redirect, url_for, jsonify, current_app, abort
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from flaskforms import TicketForm
from datetime import datetime
from models import Database, db, User
from extensions import mail
from flask_mail import Message
import json
import random
import magic

tickets = Blueprint('tickets', __name__)

# Generate a unqiue 6-digit ticket ID
def generate_id():
    while True:
        random_id = str(random.randint(0,999999)).zfill(6)
        ticket = Database.query.filter_by(ticket_id=random_id).first()
        if not ticket:
            return random_id

# Add ticket to the database
@tickets.route('/add', methods=['POST'])
@login_required
def ticket():
    form = TicketForm()
    # Database submission for simple and processed tickets
    if form.validate_on_submit():
        initial_history = [{
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "appender": current_user.name,
            "entry": form.history.data
        }]
        # Initial permissions set during ticket creation
        initial_perms = [{
            "allowed_name": current_user.name,
            "allowed_user": current_user.username,
            "allowed_role": "Admin"
        }]
        t = Database(category=form.category.data, ticket_name=form.name.data,
                     ticket_id=generate_id(),
                     type=form.type.data,
                     project=form.project.data,urg=form.urgency.data,
                     location=form.location.data,status="Active",
                     history=json.dumps(initial_history),
                     creator=current_user,
                     permissions=json.dumps(initial_perms),
                     visibility=form.visibility.data)

    else:
        flash("Ticket has not been successfully added", "fail")
        return redirect(url_for('table.table'))
        
    db.session.add(t)
    db.session.commit()
    flash("Ticket has been sucessfully added", "success")
    return redirect(url_for('table.table'))

# Saving ticket updates
@tickets.route('/add_update/<int:id>', methods=['POST'])
@login_required
def add_update(id):
    ticket = Database.query.get(id)
    if not ticket:
        return jsonify({'success': False, 'error': 'Ticket not found'})
    add_data = request.get_json()
    new_entry = add_data.get('history', '').strip()
    new_perms = add_data.get('allowed_user', '').strip()
    new_category = add_data.get('category', '').strip()
    if new_entry:
        if len(new_entry) < 2000:
            history_list = json.loads(ticket.history or "[]")
            history_list.append({
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "appender": current_user.name,
                "entry": new_entry
            })
        else:
            return jsonify({'success': False}), 400
        ticket.history = json.dumps(history_list)
    elif new_perms:
        if not new_perms.replace(' ', '').isalnum() or len(new_perms) > 30:
            return jsonify({'success': False}), 400
        check_user = User.query.filter_by(username=new_perms).first()
        if check_user:
            if not add_data['allowed_role'].isdigit() and len(add_data['allowed_role']) <= 5:
                perm_list = json.loads(ticket.permissions or "[]")
                perm_list.append({
                    "allowed_name": check_user.name,
                    "allowed_user": new_perms,
                    "allowed_role": add_data['allowed_role']
                })
                ticket.permissions = json.dumps(perm_list)
            else:
                return jsonify({'success': False}), 400
    elif new_category == "Archived":
        ticket.category = new_category
    else:
        return jsonify({'success': False, 'error': 'Empty JSON requests'})
    db.session.commit()
    return jsonify({'success': True})

# Uploading files to the associated ticket
@tickets.route('/upload/<int:id>', methods=['POST'])
@login_required
def upload_file(id):
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'txt', 'tif', 'tiff',
                          'py', 'csv', 'bgcode', 'docx', 'xlsx', 'dxf', 'stl'}
    ticket = Database.query.get_or_404(id)
    file = request.files.get('file')
    if not file:
        return jsonify({'success': False, 'error': 'No file provided'})

    # Check if file ends with allowed extension
    if '.' in file.filename and file.filename.split('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
        # Check MIME type:
        mime = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)

        ALLOWED_MIMES = {
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/tiff',
            'text/plain',
            'text/x-python',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/vnd.dxf',
            'model/stl',
        }

        if mime not in ALLOWED_MIMES:
            return jsonify({'success': False, 'error': 'Invalid file type'})

        filename = secure_filename(file.filename)
        relative_path = f"static/uploads/{filename}"
        save_path = os.path.join(current_app.root_path, relative_path)
        file.save(save_path)

        # Save file info in BD
        ticket_uploads = json.loads(ticket.uploads or "[]")
        ticket_uploads.append({"filename": filename, "path": relative_path})
        ticket.uploads = json.dumps(ticket_uploads)
        db.session.commit()
        return jsonify(success=True, file={"filename": filename, "path": relative_path})
    else:
        return jsonify({'success': False}), 400
    
# Update ticket status
@tickets.route('/update_status/<int:id>', methods=['POST'])
@login_required
def update_status(id):
    ticket = Database.query.get_or_404(id)
    if not ticket:
        return jsonify({'success': False, 'error': 'Ticket does not exist!'})
    status_data = request.get_json()
    status = status_data.get('status', '').strip()
    if not status:
        jsonify({'success': False, 'error': 'Empty status entry'})
    if status in ['Active', 'Completed']:
        history_list = json.loads(ticket.history or "[]")
        history_list.append({
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "appender": current_user.name,
            "entry": f"Ticket status updated to {status}"
        })
        ticket.history = json.dumps(history_list)
        ticket.status = status
        db.session.commit()
        return jsonify({'success': True})
    else:
        return jsonify({'success': False}), 400

# Delete ticket
@tickets.route('/delete/<int:id>', methods=["POST"])
@login_required
def erase(id):
    data = Database.query.get_or_404(id)
    if data.creator_id != current_user.id:
        abort(403)
    db.session.delete(data)
    db.session.commit()
    flash("Ticket Deleted", "info")
    return jsonify({"success": True})

# Get history and uploads dynamically
@tickets.route('/grab_data/<int:id>', methods=['GET'])
@login_required
def grab_history(id):
    ticket = Database.query.get_or_404(id)
    if not ticket:
        return jsonify({'history': "",
        'uploads': "",
        'error': 'Ticket not found'})
    return jsonify({'history': ticket.history,
    'uploads': ticket.uploads})

@tickets.route('/grab_permissions/<int:id>', methods=['GET'])
@login_required
def grab_permissions(id):
    ticket = Database.query.get_or_404(id)
    if not ticket:
        return jsonify({'permissions': "",
        'error': 'Ticket not found'})
    return jsonify({'permissions': ticket.permissions})

@tickets.route('/mail_notify/<int:id>', methods=['POST'])
@login_required
def mail_notify(id):
    ticket = Database.query.get_or_404(id)
    if not ticket:
        return jsonify({'success': False,
                        'error': 'Ticket not found!'})
    # Retrieve JSON data from fetch
    response = request.get_json()
    history = response.get('history', '').strip()
    if not history:
        return jsonify({'success': False,
                        'error': 'Empty history comment.'})
    if history:
        permissions = json.loads(ticket.permissions or "[]")
        allowed_users = [entry.get("allowed_user") for entry in permissions]
        for user in allowed_users:
            if user != current_user.username:
                db_user = User.query.filter_by(username=user).first()
                email = db_user.email
                msg = Message(
                subject=f"Ticket Manager - #{ticket.ticket_id} Update",
                recipients=[email],
                body=f"A new update has been added to your ticket.\n\nDetails:\n{history}"
                )
                mail.send(msg)
        return jsonify({'success': True,
                        'perms': allowed_users})