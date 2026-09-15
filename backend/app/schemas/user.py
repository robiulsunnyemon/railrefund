from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DELETED = "DELETED"
    PENDING = "PENDING"

class SubscriptionPlan(str, Enum):
    FREE = "FREE"
    PRO_AUTOMATOR = "PRO_AUTOMATOR"

class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CANCELED = "CANCELED"
    PAST_DUE = "PAST_DUE"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    profile_pic: Optional[str] = None
    balance: float = 0.0
    iban_no: Optional[str] = ""
    status: UserStatus = UserStatus.ACTIVE
    subscription_plan: SubscriptionPlan = SubscriptionPlan.FREE
    subscription_status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    created_at: Optional[str] = None

class IbanUpdate(BaseModel):
    iban_no: str

class SubscriptionUpdate(BaseModel):
    plan: SubscriptionPlan
