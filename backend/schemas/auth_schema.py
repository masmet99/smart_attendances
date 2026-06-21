from pydantic import BaseModel


class LoginRequest(BaseModel):
    nip: str
    password: str