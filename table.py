# Generate and filter table
import sys
from flask import Blueprint, request, render_template, jsonify
from flask_login import login_required, current_user
from flaskforms import TicketForm, UpdateForm, UploadForm, StatusForm, ProcessForm
from models import Database

table_bp = Blueprint('table', __name__)

# Table Page
@table_bp.route('/table', methods=['GET', 'POST'])
@login_required
def table():
    # Filtering tickets by the right tab
    form = TicketForm()
    update_form = UpdateForm()
    upload_form = UploadForm()
    status_form = StatusForm()
    process_form = ProcessForm()

    # Default filter
    filters = {}

    if request.method == 'POST':
        # Retrieve filtering options
        data = request.get_json()

        if data:
            ticket_id = (val := data.get('ticketId')) and val.strip() or None
            urg = (val := data.get('urgency')) and val.strip() or None
            location = (val := data.get('location')) and val.strip() or None
            project = (val := data.get('project')) and val.strip() or None
            
            # Validating expected input data before filtering
            if ticket_id:
                if len(ticket_id) > 6 or not ticket_id.isdigit():
                    return jsonify({'success': False}), 400
                filters['ticket_id'] = ticket_id
            if urg:
                if urg not in ["Urgent", "Medium", "Low"]:
                    return jsonify({'success': False}), 400
                filters['urg'] = urg
            if location:
                if location.isdigit() or len(location) > 30:
                    return jsonify({'success': False}), 400
                filters['location'] = location
            if project:
                projects = ["ATLAS Pixel", "ATLAS Strips", "ATLAS Staves",
                   "ATLAS Pixel Mechanics", "DarkSide", "General Cleanroom",
                   "Wirebonding", "Electronics", "Workshop"]
                if project not in projects:
                    return jsonify({'success': False}), 400
                filters['project'] = project    
        else:
            filters = {}

    # Tab-specific filtered tables
    general = Database.query.filter_by(category="General", **filters).all()
    safety = Database.query.filter_by(category="Safety", **filters).all()
    stock = Database.query.filter_by(category="Stock", **filters).all()
    storage = Database.query.filter_by(category="Storage", **filters).all()
    archived = Database.query.filter_by(category="Archived", **filters).all()

    return render_template('table.html', form=form,
                           update_form=update_form,
                           upload_form=upload_form,
                           status_form=status_form,
                           process_form=process_form,
                           username=current_user,
                           general=general, safety=safety,
                           stock=stock, storage=storage,
                           archived=archived)
