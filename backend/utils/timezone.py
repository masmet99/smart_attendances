from datetime import datetime
from zoneinfo import ZoneInfo

TIMEZONE = ZoneInfo("Asia/Makassar")

def now():
    return datetime.now(TIMEZONE).replace(tzinfo=None)

def today():
    return now().date()