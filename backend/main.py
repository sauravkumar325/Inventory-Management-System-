from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import os
import models
import schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BuildStock Backend")

frontend_url = os.getenv("FRONTEND_URL")
allowed_origins = [
    "https://buildstock-0ypy.onrender.com",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]

if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class LoginData(BaseModel):
    email: str
    password: str


@app.post("/login")
def login(data: LoginData):
    if data.email == "admin@gmail.com" and data.password == "admin123":
        return {
            "message": "Login successful",
            "email": data.email
        }

    raise HTTPException(status_code=401, detail="Invalid email or password")


# ---------------- MATERIAL APIs ----------------

@app.post("/materials", response_model=schemas.MaterialResponse)
def create_material(material: schemas.MaterialCreate, db: Session = Depends(get_db)):
    new_material = models.Material(
        name=material.name,
        category=material.category,
        unit=material.unit,
        qty=material.qty,
        price=material.price
    )

    db.add(new_material)
    db.commit()
    db.refresh(new_material)

    return new_material


@app.get("/materials", response_model=list[schemas.MaterialResponse])
def get_materials(db: Session = Depends(get_db)):
    return db.query(models.Material).all()


@app.get("/materials/{material_id}", response_model=schemas.MaterialResponse)
def get_single_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    return material


@app.put("/materials/{material_id}", response_model=schemas.MaterialResponse)
def update_material(material_id: int, material: schemas.MaterialUpdate, db: Session = Depends(get_db)):
    existing_material = db.query(models.Material).filter(models.Material.id == material_id).first()

    if not existing_material:
        raise HTTPException(status_code=404, detail="Material not found")

    existing_material.name = material.name
    existing_material.category = material.category
    existing_material.unit = material.unit
    existing_material.qty = material.qty
    existing_material.price = material.price

    db.commit()
    db.refresh(existing_material)

    return existing_material


@app.delete("/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    existing_material = db.query(models.Material).filter(models.Material.id == material_id).first()

    if not existing_material:
        raise HTTPException(status_code=404, detail="Material not found")

    db.delete(existing_material)
    db.commit()

    return {"message": "Material deleted successfully"}


# ---------------- STOCK IN APIs ----------------

@app.post("/stockin", response_model=schemas.StockInResponse)
def create_stockin(stockin: schemas.StockInCreate, db: Session = Depends(get_db)):
    material = db.query(models.Material).filter(
        models.Material.name.ilike(stockin.material_name)
    ).first()

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    material.qty += stockin.qty

    new_stockin = models.StockIn(
        material_name=stockin.material_name,
        category=stockin.category,
        qty=stockin.qty,
        unit=stockin.unit,
        date=stockin.date,
        note=stockin.note
    )

    db.add(new_stockin)
    db.commit()
    db.refresh(new_stockin)

    return new_stockin


@app.get("/stockin", response_model=list[schemas.StockInResponse])
def get_stockin(db: Session = Depends(get_db)):
    return db.query(models.StockIn).all()


@app.delete("/stockin/{stockin_id}")
def delete_stockin(stockin_id: int, db: Session = Depends(get_db)):
    record = db.query(models.StockIn).filter(models.StockIn.id == stockin_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Stock In record not found")

    material = db.query(models.Material).filter(
        models.Material.name.ilike(record.material_name)
    ).first()

    if material:
        material.qty -= record.qty

        if material.qty < 0:
            material.qty = 0

    db.delete(record)
    db.commit()

    return {"message": "Stock In record deleted successfully"}


# ---------------- STOCK OUT APIs ----------------

@app.post("/stockout", response_model=schemas.StockOutResponse)
def create_stockout(stockout: schemas.StockOutCreate, db: Session = Depends(get_db)):
    material = db.query(models.Material).filter(
        models.Material.name.ilike(stockout.material_name)
    ).first()

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    if stockout.qty > material.qty:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    material.qty -= stockout.qty

    new_stockout = models.StockOut(
        material_name=stockout.material_name,
        category=stockout.category,
        qty=stockout.qty,
        unit=stockout.unit,
        date=stockout.date,
        reason=stockout.reason
    )

    db.add(new_stockout)
    db.commit()
    db.refresh(new_stockout)

    return new_stockout


@app.get("/stockout", response_model=list[schemas.StockOutResponse])
def get_stockout(db: Session = Depends(get_db)):
    return db.query(models.StockOut).all()


@app.delete("/stockout/{stockout_id}")
def delete_stockout(stockout_id: int, db: Session = Depends(get_db)):
    record = db.query(models.StockOut).filter(models.StockOut.id == stockout_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Stock Out record not found")

    material = db.query(models.Material).filter(
        models.Material.name.ilike(record.material_name)
    ).first()

    if material:
        material.qty += record.qty

    db.delete(record)
    db.commit()

    return {"message": "Stock Out record deleted successfully"}


# ---------------- REPORT API ----------------

@app.get("/reports/summary")
def get_report_summary(db: Session = Depends(get_db)):
    materials = db.query(models.Material).all()
    stockin = db.query(models.StockIn).all()
    stockout = db.query(models.StockOut).all()

    low_stock_count = len([item for item in materials if item.qty <= 5])
    total_available_qty = sum(item.qty for item in materials)

    return {
        "total_materials": len(materials),
        "total_stock_in_records": len(stockin),
        "total_stock_out_records": len(stockout),
        "low_stock_items": low_stock_count,
        "total_available_quantity": total_available_qty
    }
