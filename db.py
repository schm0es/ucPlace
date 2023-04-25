from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:///sqlalchemy.sqlite', echo=True)

base = declarative_base()

class Pixels (base):
    
    __tablename__ = 'Pixels'
    id = Column(Integer, primary_key=True)
    pixel_x= Column(Integer)
    pixel_y = Column(Integer)
    pixel_color = Column(String)

base.metadata.create_all(engine)