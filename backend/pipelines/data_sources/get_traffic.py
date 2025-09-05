import httpx
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GRAPHHOPPER_API_KEY = os.getenv("GRAPHHOPPER_API_KEY")

def get_traffic_data(city: str) -> dict:
    """
    Obtém dados de trânsito reais da API do GraphHopper para uma rota de exemplo.
    """
    if not GRAPHHOPPER_API_KEY:
        logger.error("❌ Chave da API do GraphHopper não encontrada. Verifique o arquivo .env")
        return {"traffic_delay": 15.0, "traffic_level": "moderado (simulado - chave não encontrada)"}

    try:
        routes = {
            "Sao Paulo": {
                "origin_name": "Avenida Paulista",
                "destination_name": "Aeroporto de Congonhas",
                "origin_coords": (-46.633308, -23.550520),
                "destination_coords": (-46.656389, -23.627778)
            },
            "Rio de Janeiro": {
                "origin_name": "Praia de Copacabana",
                "destination_name": "Cristo Redentor",
                "origin_coords": (-43.1882714, -22.986539),
                "destination_coords": (-43.210322, -22.953173)
            }
        }

        normalized_city = city.replace(" ", "").replace("_", "").title()
        if normalized_city == "SaoPaulo":
            normalized_city = "Sao Paulo"
        
        if normalized_city not in routes:
            logger.warning(f"⚠️ Rotas não definidas para a cidade '{city}'. Usando dados simulados.")
            return {"traffic_delay": 15.0, "traffic_level": "moderado (simulado - cidade não mapeada)"}

        route_info = routes[normalized_city]
        
        url = "https://graphhopper.com/api/1/route"
        params = {
            "point": [
                f"{route_info['origin_coords'][1]},{route_info['origin_coords'][0]}",
                f"{route_info['destination_coords'][1]},{route_info['destination_coords'][0]}"
            ],
            "vehicle": "car",
            "locale": "pt-BR",
            "instructions": "false",
            "calc_points": "false",
            "key": GRAPHHOPPER_API_KEY
        }

        logger.info(f"🚗 Chamando GraphHopper para rota: {route_info['origin_name']} -> {route_info['destination_name']}")
        response = httpx.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()

        if "paths" in data and len(data["paths"]) > 0:
            path = data["paths"][0]
            duration_ms = path.get("time", 0)
            distance_meters = path.get("distance", 0)
            
            duration_min = duration_ms / (1000 * 60)
            base_duration_min = (distance_meters / 1000) / 30
            delay_min = max(0, duration_min - base_duration_min)
            
            if delay_min < 2:
                level = "leve"
            elif delay_min < 8:
                level = "moderado"
            else:
                level = "intenso"

            logger.info(f"✅ Trânsito obtido para {city}: delay={delay_min:.2f} min, nível={level}")
            return {
                "traffic_delay": round(delay_min, 2),
                "traffic_level": level,
                "route": f"{route_info['origin_name']} → {route_info['destination_name']}",
                "distance_km": round(distance_meters / 1000, 2),
                "duration_min": round(duration_min, 2)
            }
        else:
            logger.warning(f"⚠️ Nenhuma rota encontrada pelo GraphHopper para {city}.")
            return {"traffic_delay": 15.0, "traffic_level": "moderado (simulado - nenhuma rota)"}

    except httpx.HTTPStatusError as e:
        logger.error(f"❌ Erro HTTP GraphHopper para {city}: {e.response.status_code}")
        return {"traffic_delay": 15.0, "traffic_level": "moderado (simulado - erro HTTP)"}
    except httpx.RequestError as e:
        logger.error(f"❌ Erro de conexão GraphHopper para {city}: {e}")
        return {"traffic_delay": 15.0, "traffic_level": "moderado (simulado - erro de conexão)"}
    except Exception as e:
        logger.error(f"❌ Erro inesperado ao buscar trânsito para {city}: {e}")
        return {"traffic_delay": 15.0, "traffic_level": "moderado (simulado - erro desconhecido)"}