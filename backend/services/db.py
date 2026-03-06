import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
import certifi

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client["clauseguard"]
collection = db["analyses"]


def _serialize(doc) -> dict:
    """Convert ALL ObjectId fields to strings recursively."""
    if doc is None:
        return None
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, list):
            doc[key] = [
                _serialize(i) if isinstance(i, dict) else i
                for i in value
            ]
        elif isinstance(value, dict):
            doc[key] = _serialize(value)
    # Rename _id to id
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


async def save_analysis(data: dict) -> str:
    data["timestamp"] = datetime.utcnow().isoformat()
    result = await collection.insert_one(data)
    return str(result.inserted_id)


async def get_history(limit: int = 20) -> list:
    cursor = collection.find().sort("timestamp", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [_serialize(doc) for doc in docs]


async def get_analysis_by_id(doc_id: str) -> dict | None:
    try:
        doc = await collection.find_one({"_id": ObjectId(doc_id)})
        return _serialize(doc) if doc else None
    except Exception:
        return None


async def delete_analysis(doc_id: str) -> bool:
    result = await collection.delete_one({"_id": ObjectId(doc_id)})
    return result.deleted_count == 1