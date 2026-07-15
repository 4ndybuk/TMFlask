# Flaskform form templates for input
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import StringField, PasswordField, SubmitField, SelectField, TextAreaField, RadioField, HiddenField
from wtforms.validators import DataRequired, Length, Regexp, EqualTo

# Flask form for CSRF
class LoginForm(FlaskForm):
    regex = Regexp(r"^[A-Za-z0-9_]+$", message="Username can contain letters, numbers, and underscores only.")
    username = StringField("Username",
                           validators=[DataRequired(),Length(min=5, max=30), regex])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("LOGIN")

# Registration form
class RegisterForm(FlaskForm):
    regex_user = Regexp(r"^[A-Za-z0-9_]+$", message="Username can contain letters, numbers, and underscores only.")
    regex_passw = Regexp(r"^(?=.*[A-Za-z])(?=.*\d).+$", message="Password must contain at least one letter and one number.")
    regex_email = Regexp(r"^[a-zA-Z0-9._%+-]+@hep\.ph\.liv\.ac\.uk$", message="Email account must be valid")
                                                            
    name = StringField("Name", validators=[DataRequired()])
    username = StringField("Username",validators=[DataRequired(), Length(min=5, max=30), regex_user])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=8, max=128),
                                                     regex_passw, EqualTo("confirm", message="Passwords must match.")])
    email = StringField("Recovery Email", validators=[DataRequired(), regex_email])
    confirm = PasswordField("Confirm Password")
    access_code = StringField("Access Code", validators=[DataRequired(), Length(min=8, max=30)])
    submit = SubmitField("REGISTER")

# Flask form for tickets
class TicketForm(FlaskForm):
    choice_list = [("General","General"),("Safety","Safety"),("Stock","Stock"),("Storage","Storage")]
    projects = ["ATLAS Pixel", "ATLAS Strips", "ATLAS Staves",
                   "ATLAS Pixel Mechanics", "DarkSide", "General Cleanroom",
                   "Wirebonding", "Electronics", "Workshop"]
    choice_projects = [(p,p) for p in projects]
    category = SelectField("Ticket Category:", choices=choice_list,validators=[DataRequired()])
    type = RadioField("Ticket Type:", choices=[
        ("Simple", "Simple"),
        ("Process", "Process")
    ], validators=[DataRequired()])
    visibility = RadioField("Visibility:", choices=[
        ("Everyone", "Everyone"),
        ("Private", "Private")
    ], validators=[DataRequired()])
    name = StringField("Ticket Name:", validators=[DataRequired()])
    urgency = SelectField("Urgency:",
                          choices=[("Urgent","Urgent"), ("Medium","Medium"), ("Low","Low")],
                          validators=[DataRequired()])
    project = SelectField("Project:", choices=choice_projects, validators=[DataRequired()])
    location = StringField("Location:", validators=[DataRequired()])
    history = StringField("Ticket Description:", validators=[DataRequired()])
    submit = SubmitField("SUBMIT")

# Flask form for uploading files to the ticket
class UploadForm(FlaskForm):
    file = FileField("Upload File",
                    validators=[FileRequired(),
                                FileAllowed(['jpg', 'png', 'pdf', 'txt'],
                                            "Only images, PDFs and text files allowed!")])

# Flask form for updating the ticket
class UpdateForm(FlaskForm):
    update = TextAreaField("Update", validators=[DataRequired()])

# Flask form for stage management in process ticket
class ProcessForm(FlaskForm):
    stage_token = HiddenField()

# Flask form to update ticket status
class StatusForm(FlaskForm):
    change_status = SubmitField(None)