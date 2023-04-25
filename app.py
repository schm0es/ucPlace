from flask import Flask, request, render_template, jsonify
from flask_cors import CORS

from sqlalchemy.orm import sessionmaker
import db

Session = sessionmaker(bind=db.engine)
session = Session()

app = Flask(__name__)
CORS(app)

class Pixel(db):
    id = db.Column(db.Integer, primary_key=True)
    x = db.Column(db.Integer, nullable=False)
    y = db.Column(db.Integer, nullable=False)
    color = db.Column(db.String(7), nullable=False)

    def __repr__(self):
        return f'<Pixel {self.id} ({self.x}, {self.y}): {self.color}>'

@app.route('/')
def index():
    return render_template('grades.html')


def write_grades(name, grade):
    new_student = db.Students(student_name=name, student_grade=grade)
    session.add(new_student)
    session.commit()


def read_grades():
    data = session.query(db.Students).all()
    return data


def get_grades():
    data = read_grades()
    data_dict = [{"id": d.id, "student_name": d.student_name, "student_grade": d.student_grade} for d in data]
    return data_dict


@app.route('/api/pixels', methods=['POST'])
def add_pixel():
    data = request.get_json()
    new_pixel = Pixel(x=data['x'], y=data['y'], color=data['color'])
    db.session.add(new_pixel)
    db.session.commit()
    return jsonify({"id": new_pixel.id}), 201


# @app.route('/grades', methods=['GET'])
# def get_grad():
#     data = read_grades()
#     data_dict = [{d.student_name: d.student_grade} for d in data]
#     return data_dict


# @app.route('/api/pixels', methods=['POST'])
# def get_grade_by_name(name):
#     grades = get_grades()
#     grade = next((d['student_grade'] for d in grades if d['student_name'] == name), None)
#     if grade is None:
#         return jsonify({'error': f'No grade found for student {name}'}), 404
#     return jsonify({name : grade})


# @app.route('/grades/<name>/<grade>', methods=['POST'])
# def add_grade(name, grade):

#     new_student = db.Students(student_name = name, student_grade = grade)
#     session.add(new_student)

#     session.commit()
#     return jsonify({name: grade})


# @app.route('/grades/<name>/<grade>', methods=['PUT'])
# def update_grade(name, grade):
#     data = read_grades()
#     found_student = False

#     for d in data:
#         if d.student_name == name:
#             d.student_grade = grade
#             found_student = True
#             break
#     if not found_student:
#         return jsonify({"error": f"No student found with name {name}"})
    
#     session.commit()
#     return jsonify({name: grade})


# @app.route('/grades/<name>', methods=['DELETE'])
# def delete_grade(name):
#     data = read_grades()
#     found_student = False

#     for d in data:
#         if d.student_name == name:
#             session.delete(d)
#             found_student = True
#             break
#     if not found_student:
#         return jsonify({"error": f"No student found with name {name}"})
    
#     session.commit()
#     return jsonify({name: 'deleted'})