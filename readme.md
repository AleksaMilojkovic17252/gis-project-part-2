# GIS Projekat 2: OGC Geoprostorni veb servisi

## Preduslovi

- PostgreSQL sa PostGIS ekstenzijom
- Python 3.10+
- Node.js 18+
- Baza podataka `spatial_db_austria` iz Projekta 1 sa svim importovanim tabelama

## Podešavanje baze podataka

Aplikacija očekuje PostgreSQL bazu podataka pod imenom `spatial_db_austria` na `localhost:5432` sa sledećim tabelama:

- `transit_stops`, `transit_routes`, `power_towers`, `power_lines`
- `substations`, `landmarks_points`, `buildings`

Kredencijali za konekciju su konfigurisani u `pygeoapi-config.yml`.

## Pokretanje projekta

### 1. Pokretanje pygeoapi servera

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export PYGEOAPI_CONFIG=pygeoapi-config.yml
export PYGEOAPI_OPENAPI=pygeoapi-openapi.yml
pygeoapi openapi generate $PYGEOAPI_CONFIG --output-file $PYGEOAPI_OPENAPI
pygeoapi serve
```

pygeoapi biće dostupan na `http://localhost:5000`.

### 2. Pokretanje frontend-a

U drugom terminalu:

```bash
cd webapp
npm install
npm run dev
```

Aplikacija će biti dostupna na `http://localhost:5173`.

## Funkcionalnosti

- **Upravljanje slojevima** — uključivanje 7 slojeva
- **WMS rasterski sloj** — uključiv WMS sloj
- **Prostorni upiti:**
  - Prebrojavanje svih objekata u trenutnom prikazu
  - Pronalaženje stanica javnog gradskog prevoza u blizini kliknute tačke
  - Filtriranje stanica javnog gradskog prevoza po tipu
  - Pronalaženje znamenitosti unutar osnova zgrada (tačka-u-poligonu)

## Tehnologije

| Komponenta | Tehnologija |
|---|---|
| OGC API Server | pygeoapi |
| Baza podataka | PostgreSQL + PostGIS |
| Frontend | React, TypeScript, Vite |
| Biblioteka za mape | react-leaflet |