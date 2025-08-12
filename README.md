# City Sense - Índice de Qualidade de Vida Urbana
Descrição: Aplicação web que analisa e compara a qualidade de vida em diferentes cidades, fornecendo métricas detalhadas sobre clima, umidade, trânsito e tendências climáticas.
É um projeto aberto que permite a implementação de variadas funcionalidades de acordo com o objetivo de utilização.

Tecnologias Utilizadas:

## Frontend:
React + TypeScript - Framework principal
Vite - Build tool e desenvolvimento
Recharts - Visualização de dados
Tailwind CSS - Estilização
Luxon - Manipulação de datas

## Backend:
Python + FastAPI - API REST
Uvicorn - Servidor ASGI
Requests - Requisições HTTP
Pydantic - Validação de dados

### Funcionalidades:
Análise detalhada do IQV por cidade
Comparação entre cidades
Previsão de IQV com machine learning
Gráficos interativos de comparação
Modo claro/escuro

Execução:

>>**Backend**<<

cd backend

pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000

>>**Frontend:**<<

cd frontend

npm install

npm run dev

Backend: http://localhost:8000
Frontend: http://localhost:5173