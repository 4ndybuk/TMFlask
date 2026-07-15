# Ticket Manager (Flask)
## v1.1.0
Desktop ticketing database system that supports end-to-end lifecycle ticket management. Allows creation of
individual safety, stock and general workplace events through with resolution tracking between all users.
Designed to support issue reporting with a structured and auditable workflow.

## Details
![Flask](https://img.shields.io/badge/Flask-3.1.3-brightgreen)  
![License](https://img.shields.io/badge/license-NCL-blue)  

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [License](#license) 

## Installation
1. **Clone the respository**  
   ```bash
   git clone https://github.com/4ndybuk/TicketManager
   cd TMFlask
   ```
3. **Install the dependencies**    
   ```bash
   pip install -r requirements.txt
   ```
4. Create an .env file in the directory to initialise the database  
   ```bash
   touch ./.env   (bash)
   type nul > .env    (Windows)
   ```
5. Assign the following environmental variables in .env  
   ```bash
   SECRET_KEY=generate a key
   FLASK_DENUG=0/1 (development/production)
   ACCESS_CODES=code1,code2,...
   MAIL=yourmail@yourdomain
   ```
   
8. Run the site with  
   ```bash
   python app.py (if in development and debugging)
   waitress-serve --host=0.0.0.0 --port=8000 app:app (if set for production)
   ```

## Usage
1. **Ticket Management System** - Create, update, and delete tickets, with support for multi-user access and management
2. **Advanced Filtering** - Filter tickets by name, project, and location using built-in search functionality
3. **Inline Ticket Actions**  
    Perform actions directly from each row:
    - Toggle ticket status between "Active" and "Completed"
    - Edit and store ticket details in View

## License
1. This project is licensed under the Non-Commerical License - see the [LICENSE](LICENSE) file for details.
