import { existsSync, readFileSync, writeFileSync } from "node:fs";

import axios from 'axios';

class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // TODO: leer DB si existe;
    }

    get paramsMapBox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'language': 'es',
            'limit': 5
        }
    }

    get paramsWeather() {
        return{
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es',
        }
    }

    get historialCap() {
        return this.historial.map(lugar => {
            let palabras = lugar.split((' '));
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        });
    }

    async ciudad(lugar = '') {
        
        try {
            // Petición http;

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox,
            });

            const resp = await instance.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lon: lugar.center[0],
                lat: lugar.center[1]
            }));    
        } catch (err) {
            return [];
        }
    }

    async clima(lat, lon) {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsWeather, lat, lon},
            });

            const resp = await instance.get();
            const {weather, main:temps} = resp.data;

            return {
                desc:     weather[0].description,
                temp:     temps.temp,
                temp_min: temps.temp_min,
                temp_max: temps.temp_max,
            };
        } catch (err) {
            return {err}
        }
    }

    listHistorial(lugar = '') {
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }
        this.historial.unshift(lugar.toLocaleLowerCase());
        this.guardarData()
    }

    guardarData() {
        const payload = {
            historial: this.historial
        }
        writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerData() {
        if (!existsSync(this.dbPath)) {
            return null;
        }

        const info = readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);

        this.historial = data.historial;
    }
}

export {
    Busquedas,
}