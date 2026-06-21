from fastapi import Depends, HTTPException

from utils.auth_middleware import get_current_user


def admin_required(
    user=Depends(get_current_user)
):

    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Akses ditolak"
        )

    return user