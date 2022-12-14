import { Component, OnInit } from '@angular/core';
import { Lugar } from 'src/app/interfaces/interfaces';

import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from 'src/app/services/websocket.service';

interface RespMarcadores {
  [key: string]: Lugar
}

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  mapa: mapboxgl.Map;
  // lugares: Lugar[] = [];
  lugares: RespMarcadores = {};
  markersMapbox: {[id: string]: mapboxgl.Marker} = {};

  constructor(
    private http: HttpClient,
    private wsService: WebsocketService
  ) { }

  ngOnInit(): void {
    this.http.get<RespMarcadores>('http://localhost:5000/mapa')
    .subscribe( lugares => {
      this.lugares = lugares
      this.crearMapa();
    })
    this.escucharSockets();
  }

  escucharSockets() {
    //marcador-nuevo
    this.wsService.listen('marcador-nuevo')
    .subscribe(( marcador: any) => {
      this.agregarMarcador(marcador)
    })

    //marcador-mover
    this.wsService.listen('marcador-mover')
    .subscribe(( nuevoMarcador: any) => {
      this.markersMapbox[nuevoMarcador.id].setLngLat([nuevoMarcador.lng, nuevoMarcador.lat])
    })

    //marcador-borrar
    this.wsService.listen('marcador-borrar')
    .subscribe(( id: any) => {
      this.markersMapbox[id].remove();
      delete this.markersMapbox[id]
    })
  }

  crearMapa() {
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoiZ29kb3lhbmRyZXNlemVxdWllbCIsImEiOiJja3Q5MnJwYngxOGY2Mm5xdzE1eG8wa2hnIn0.2lfQU0ZgjsqXGz0J49kHyQ';
    this.mapa = new mapboxgl.Map({
      container: 'mapa', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [-75.75512993582937 , 45.349977429009954], // starting position [lng, lat]
      zoom: 15.8, // starting zoom
    });

    for (const [key, marcador] of Object.entries(this.lugares)) {
      this.agregarMarcador(marcador);
    }

  }

  agregarMarcador(marcador: Lugar) {
    
    const h2 = document.createElement('h2');
    h2.innerText = marcador.nombre;

    const btnBorrar = document.createElement('button');
    btnBorrar.innerText = 'Borrar';

    const div = document.createElement('div');
    div.append(h2, btnBorrar);

    const customPopup = new mapboxgl.Popup({
      offset: 25,
      closeOnClick: false
    }).setDOMContent(div);

    const marker = new mapboxgl.Marker({
      draggable: true,
      color: marcador.color
    })
    .setLngLat([marcador.lng, marcador.lat])
    .setPopup(customPopup)
    .addTo(this.mapa)

    marker.on('drag', () => {
      
      const lngLat = marker.getLngLat();
      const nuevoMarcador = {
        id: marcador.id,
        ...lngLat
      }
      //TODO: crear evento para emitir las coordenadas de este marcador
      this.wsService.emit('marcador-mover', nuevoMarcador);

    })

    btnBorrar.addEventListener('click', () => {

      marker.remove();

      //eliminar el marcador mediante sockets

      this.wsService.emit('marcador-borrar', marcador.id);


    })

    this.markersMapbox[marcador.id] = marker
    

  }

  crearMarcador() {

    const customMarker: Lugar = {
      id: new Date().toISOString(),
      lng:-75.75512993582937, 
      lat: 45.349977429009954,
      nombre: 'Sin nombre...',
      color: '#' + Math.floor(Math.random()*16777215).toString(16) 
    }

    this.agregarMarcador(customMarker);

    //emitir marcador-nuevo
    this.wsService.emit('marcador-nuevo', customMarker);

  }

}








