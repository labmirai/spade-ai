from datetime import datetime

from pydantic import BaseModel


class SampleResponse(BaseModel):
    id: int
    place: str
    crop: str | None
    notes: str | None
    image_url: str
    created_at: datetime

    model_config = {"from_attributes": True}
