from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from werkzeug.security import generate_password_hash, check_password_hash

engine = create_engine('sqlite:///sqlalchemy.sqlite', echo=True)

Base = declarative_base()

class Pixel(Base):
    __tablename__ = 'Pixels'
    id = Column(String, primary_key=True)
    x = Column(Integer, nullable=False, primary_key=True)
    y = Column(Integer, nullable=False, primary_key=True)
    color = Column(String(7), nullable=False)


class User(Base):
    __tablename__ = 'Users'
    username = Column(String, nullable=False, unique=True, primary_key=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)  # Add this line


    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_id(self):
        return str(self.username)

Base.metadata.create_all(engine)
