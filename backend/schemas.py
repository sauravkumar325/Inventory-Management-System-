from pydantic import BaseModel


class MaterialBase(BaseModel):
    name: str
    category: str
    unit: str
    qty: int
    price: int


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(MaterialBase):
    pass


class MaterialResponse(MaterialBase):
    id: int

    class Config:
        from_attributes = True


class StockInBase(BaseModel):
    material_name: str
    category: str
    qty: int
    unit: str
    date: str
    note: str = ""


class StockInCreate(StockInBase):
    pass


class StockInResponse(StockInBase):
    id: int

    class Config:
        from_attributes = True


class StockOutBase(BaseModel):
    material_name: str
    category: str
    qty: int
    unit: str
    date: str
    reason: str = ""


class StockOutCreate(StockOutBase):
    pass


class StockOutResponse(StockOutBase):
    id: int

    class Config:
        from_attributes = True