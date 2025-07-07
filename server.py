from pymongo import MongoClient
import torch
from fastapi import FastAPI, WebSocket
import asyncio
import torch.nn as nn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or use ["http://localhost:3010"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017")
db = client["movies_app"]
collection = db["interactions"]

def extract_movie_ids(docs):
    """Extracts movieId from a list of MongoDB documents."""
    return [doc["movieId"] for doc in docs if "movieId" in doc]

class GRU4Rec(nn.Module):
    def __init__(self, input_size=3228, hidden_size=192, output_size=3227, num_layers=4, dropout=0.2):
        super(GRU4Rec, self).__init__()

        self.embedding = nn.Embedding(input_size, hidden_size, padding_idx=0)
        self.gru = nn.GRU(
            input_size=hidden_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x, hidden=None):
        embedded = self.embedding(x)
        gru_out, hidden = self.gru(embedded, hidden)
        last_output = gru_out[:, -1, :]
        output = self.dropout(last_output)
        output = self.fc(output)
        return output, hidden


model = GRU4Rec()

# Load checkpoint properly
checkpoint = torch.load("movielens_gru_model.pth", map_location=torch.device("cpu"))
print("Checkpoint keys:", checkpoint.keys())  # Debug info
model.load_state_dict(checkpoint["model_state_dict"])
print("Model loaded successfully")

model.eval()

clients = set()  # connected WebSocket clients

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    print(f"Client connected: {websocket.client}")
    try:
        while True:
            await asyncio.sleep(1000)  # Keep the connection alive
    except Exception as e:
        print(f"Client disconnected: {websocket.client}, Reason: {e}")
        clients.remove(websocket)

async def watch_changes():
    print("Starting MongoDB change stream watcher...")
    with collection.watch() as stream:
        for change in stream:
            if change["operationType"] == "insert":
                doc = change["fullDocument"]
                print("New document inserted:", doc)

                # Extract movieId as list for model input
                movie_ids = [doc["movieId"]]
                features = torch.tensor([movie_ids], dtype=torch.long)

                with torch.no_grad():
                    output, _ = model(features)
                    topk_values, topk_indices = torch.topk(output, k=10, dim=1)  # Get top 5 scores and their indices
                    recommended_movie_ids = topk_indices.squeeze(0).tolist()    # Convert tensor to list


                print(f"Prediction output for movieId {movie_ids}: {recommended_movie_ids}")

                # Broadcast prediction to all connected WebSocket clients
                for ws in clients.copy():
                    try:
                        await ws.send_json({"_id": str(doc["_id"]), "prediction": recommended_movie_ids})
                        print(f"Sent prediction to client {ws.client}")
                    except Exception as e:
                        print(f"Failed to send to client {ws.client}: {e}")
                        clients.remove(ws)

# Run the background change watcher in a separate thread
import threading
threading.Thread(target=lambda: asyncio.run(watch_changes()), daemon=True).start()
