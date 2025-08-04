def check_weather_alerts(weather_data: dict) -> list:
    """
    Verifica se há condições climáticas que merecem alerta
    """
    alerts = []
    
    # Alerta para calor extremo
    if weather_data["temperature"] > 35:
        alerts.append({
            "type": "heat",
            "severity": "high",
            "message": f"⚠️ Calor extremo! {weather_data['temperature']}°C - Recomenda-se evitar exposição ao sol"
        })
    
    # Alerta para frio extremo
    if weather_data["temperature"] < 5:
        alerts.append({
            "type": "cold",
            "severity": "high",
            "message": f"❄️ Frio extremo! {weather_data['temperature']}°C - Agasalhe-se bem ao sair"
        })
    
    # Alerta para alta umidade
    if weather_data["humidity"] > 85:
        alerts.append({
            "type": "humidity",
            "severity": "medium",
            "message": f"💧 Alta umidade ({weather_data['humidity']}%) - Cuidado com mofo e ácaros"
        })
    
    # Alerta para condições de trânsito
    if weather_data.get("avg_traffic_delay_min", 0) > 20:
        alerts.append({
            "type": "traffic",
            "severity": "medium",
            "message": f"🚦 Trânsito intenso: {weather_data['avg_traffic_delay_min']} minutos de atraso esperados"
        })
    
    return alerts