from flask import Flask, request, render_template, jsonify
from flask_cors import CORS

from sqlalchemy.orm import sessionmaker
import db

Session = sessionmaker(bind=db.engine)
session = Session()

app = Flask(__name__)
CORS(app)


def read_pixels():
    data = session.query(db.Pixel).all()
    return data   


@app.route('/pixels', methods=['GET'])
def get_pix():
    data = read_pixels()
    data_dict = [{'id': d.id, 'x': d.x, 'y': d.y, 'color': d.color} for d in data]
    return jsonify(data_dict)


@app.route('/pixels/<id>/<x>/<y>/<color>', methods=['POST'])
def write_pix(id, x, y, color):
    new_pixel = db.Pixel(id=id, x=x, y=y, color=color)
    session.add(new_pixel)
    session.commit()
    return jsonify(message='Pixel successfully stored', success=True)


@app.route('/pixels/<id>/<x>/<y>/<color>', methods=['PUT'])
def update_pix(id, x, y, color):
    pixel_to_update = session.query(db.Pixel).filter(db.Pixel.x == x, db.Pixel.y == y).first()

    if pixel_to_update:
        pixel_to_update.id = id
        pixel_to_update.color = color
        session.commit()
        return jsonify({id: color})
    else:
        return jsonify({"error": f"No pixel found"})