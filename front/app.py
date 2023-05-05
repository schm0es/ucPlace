from flask import Flask, request, render_template, jsonify, redirect, url_for, session
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin
from flask_cors import CORS

from sqlalchemy.orm import sessionmaker
from flask_sqlalchemy import SQLAlchemy
import db
from flask_admin.contrib.sqla import ModelView
from werkzeug.security import generate_password_hash, check_password_hash


Session = sessionmaker(bind=db.engine)
db_session = Session()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'mysecretkey'  # Change this to a secure secret key in production
login_manager = LoginManager(app)
login_manager.login_view = 'login'


class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

    def get_id(self):
        return str(self.id)


@login_manager.user_loader
def load_user(user_id):
    return User(user_id)


def read_pixels():
    data = db_session.query(db.Pixel).all()
    return data   

@app.route('/pixels', methods=['GET'])
def get_pix():
    data = read_pixels()
    data_dict = [{'id': d.id, 'x': d.x, 'y': d.y, 'color': d.color} for d in data]
    return jsonify(data_dict)

@app.route('/pixels/<id>/<x>/<y>/<color>', methods=['POST'])
def write_pix(id, x, y, color):
    new_pixel = db.Pixel(id=id, x=x, y=y, color=color)
    db_session.add(new_pixel)
    db_session.commit()
    return jsonify(message='Pixel successfully stored', success=True)

@app.route('/pixels/<id>/<x>/<y>/<color>', methods=['PUT'])
def update_pix(id, x, y, color):
    pixel_to_update = db_session.query(db.Pixel).filter(db.Pixel.x == x, db.Pixel.y == y).first()

    if pixel_to_update:
        pixel_to_update.id = id
        pixel_to_update.color = color
        db_session.commit()
        return jsonify({id: color})
    else:
        return jsonify({"error": f"No pixel found"})

@app.route('/')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Replace this with your own logic to check if the username and password are correct
        if username == 'myusername' and password == 'mypassword':
            user = User(username)
            login_user(user)
            session['logged_in'] = True
            return redirect(url_for('load_app'))
        else:
            return render_template('login.html', message='Invalid username or password')

    return render_template('login.html')

@login_required
@app.route("/app")
def load_app():
    return render_template("canvas.html")

@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.pop('logged_in', None)
    return redirect(url_for('login'))

if __name__ == "__main__":
    app.run(debug=True)
