from pydantic import BaseModel


class CheckinRequest(BaseModel):
    latitude: float
    longitude: float