// index.mjs (ESM)
import * as dotenv from 'dotenv'
dotenv.config()
// import express from 'express'
import { inquirerMenu, leerInput, listarLugares, pausa } from "./helpers/inquirer.js";
import { Busquedas } from "./models/busquedas.js";

const main = async() => {
    const busquedas = new Busquedas();
    busquedas.leerData();
    let opt;

    do {
        console.clear();
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                const termino = await leerInput('Lugar: ');

                const lugares = await busquedas.ciudad(termino);
                const id = await listarLugares(lugares);

                if (id === '0') continue;
            
                const lugarSel = lugares.find(l => l.id === id);

                busquedas.listHistorial(lugarSel.nombre);
                
                const clima = await busquedas.clima(lugarSel.lat, lugarSel.lon);
                    
                console.clear();
                console.log('\nInformación de la Ciudad\n'.green);
                console.log('Ciudad:'.cyan.bold, lugarSel.nombre);
                console.log('Lat:'.cyan.bold, lugarSel.lat);
                console.log('Lon:'.cyan.bold, lugarSel.lon);
                console.log('Ambiente:'.cyan.bold, clima.desc);
                console.log('Temperatura:'.cyan.bold, clima.temp);
                console.log('Mínima:'.cyan.bold, clima.temp_min);
                console.log('Máxima:'.cyan.bold, clima.temp_max);
                break;

                case 2:
                    busquedas.historialCap.forEach((lugar, i) => {
                        const idx = `${i + 1}.`.green;
                        console.log(`${idx} ${lugar}`);
                    })
                break;
        
            default:
                break;
        }

        if(opt !== 0) await pausa();
    } while (opt !== 0);
}

main();