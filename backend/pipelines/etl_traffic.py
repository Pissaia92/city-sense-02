import os
import httpx
import polars as pl
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "traffic_data.parquet"

# Load GraphHopper API key from .env
GRAPHHOPPER_API_KEY = os.getenv("GRAPHHOPPER_API_KEY")

# Verify API key was loaded
if not GRAPHHOPPER_API_KEY:
    raise ValueError("GRAPHHOPPER_API_KEY not found in .env file")

# Example routes in São Paulo (keeping the same for consistency)
ROUTES = [
    #  Avenida Paulista, São Paulo", "destination": "Aeroporto de Congonhas, São Paulo 
    {"origin": "-23.56135666502395, -46.65649489750306", "destination": "-23.62528430841692, -46.658504799507455"},
]

# GraphHopper Directions API base URL
GRAPHHOPPER_URL = "https://graphhopper.com/api/1/route"

def fetch_traffic_data():
    """Fetch traffic data for predefined routes using GraphHopper."""
    traffic_data = []
    
    with httpx.Client(timeout=30.0) as client:
        for route in ROUTES:
            params = {
                "point": [route["origin"], route["destination"]], # Passa os dois pontos
                "vehicle": "car",
                "locale": "en-US",
                "instructions": "false",
                "calc_points": "false",
                "key": GRAPHHOPPER_API_KEY           
                 }
            
            try:
                response = client.get(GRAPHHOPPER_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Check GraphHopper response status
                # Successful response doesn't have a 'status' field like Google's 'OK'
                # Check if 'paths' key exists and is not empty
                if "paths" in data and data["paths"]:
                    # Assume first returned path
                    path = data["paths"][0]
                    
                    # Base time (without considering real traffic, just distance and base speed)
                    # GraphHopper provides 'time' which is base time
                    time_base_ms = path.get("time", 0)  # Time in milliseconds
                    time_base_sec = time_base_ms / 1000  # Convert to seconds
                    
                    # Time with traffic (if available)
                    # GraphHopper may provide 'traffic_time' depending on account/license
                    time_with_traffic_ms = path.get("traffic_time", time_base_ms)  # Fallback to time_base
                    time_with_traffic_sec = time_with_traffic_ms / 1000  # Convert to seconds
                    
                    # Calculate delay (may be 0 if traffic_time is not provided)
                    delay_sec = time_with_traffic_sec - time_base_sec
                    
                    traffic_data.append({
                        "origin": route["origin"],
                        "destination": route["destination"],
                        "duration": time_base_sec,  # in seconds (base time)
                        "duration_in_traffic": time_with_traffic_sec,  # in seconds (time with traffic or base)
                        "delay": delay_sec,  # delay in seconds (may be 0)
                        "timestamp": datetime.now().isoformat()
                    })
                else:
                    # Handle case of route not found or other error in response
                    print(f"Warning: No path found for {route['origin']} -> {route['destination']}. Response: {data}")
                    # You can choose to skip or add a record with error
                    traffic_data.append({
                        "origin": route["origin"],
                        "destination": route["destination"],
                        "duration": None,
                        "duration_in_traffic": None,
                        "delay": None,
                        "timestamp": datetime.now().isoformat(),
                        "error": "No path found or API error"
                    })

            except httpx.HTTPStatusError as e:
                print(f"HTTP error fetching data for {route['origin']} -> {route['destination']}: {e.response.status_code} - {e.response.text}")
                traffic_data.append({
                    "origin": route["origin"],
                    "destination": route["destination"],
                    "duration": None,
                    "duration_in_traffic": None,
                    "delay": None,
                    "timestamp": datetime.now().isoformat(),
                    "error": f"HTTP {e.response.status_code}: {e.response.text}"
                })
            except httpx.RequestError as e:
                print(f"Request error fetching data for {route['origin']} -> {route['destination']}: {e}")
                traffic_data.append({
                    "origin": route["origin"],
                    "destination": route["destination"],
                    "duration": None,
                    "duration_in_traffic": None,
                    "delay": None,
                    "timestamp": datetime.now().isoformat(),
                    "error": f"Request Error: {e}"
                })
            except Exception as e:
                print(f"Unexpected error fetching data for {route['origin']} -> {route['destination']}: {e}")
                traffic_data.append({
                    "origin": route["origin"],
                    "destination": route["destination"],
                    "duration": None,
                    "duration_in_traffic": None,
                    "delay": None,
                    "timestamp": datetime.now().isoformat(),
                    "error": f"Unexpected Error: {e}"
                })
    
    return traffic_data

def save_traffic_data(data):
    """Save traffic data in Parquet format using Polars."""
    # Create Polars DataFrame from data
    df = pl.DataFrame(data)
    # Save DataFrame in Parquet format
    df.write_parquet(INPUT_FILE)
    print(f"Traffic data saved to {INPUT_FILE}")

def run_traffic_etl():
    """Complete ETL pipeline for traffic using GraphHopper."""
    try:
        print("Starting Traffic ETL with GraphHopper...")
        data = fetch_traffic_data()
        if data:  # Only save if there is data
            save_traffic_data(data)
            print("Traffic ETL completed successfully.")
            return {"status": "success", "routes_processed": len(data)}
        else:
            print("No traffic data collected.")
            return {"status": "warning", "message": "No data collected."}
    except Exception as e:
        print(f"Error in Traffic ETL pipeline: {e}")
        return {"status": "error", "message": str(e)}

# Allow direct script execution for testing
if __name__ == "__main__":
    result = run_traffic_etl()
    print(result)