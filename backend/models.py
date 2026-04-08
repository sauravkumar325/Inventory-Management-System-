from sqlalchemy import Column, Integer, String
from database import Base

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    qty = Column(Integer, default=0)
    price = Column(Integer, default=0)