import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//sockets
import { SocketIoModule } from 'ngx-socket-io';

import { environment } from 'src/environments/environment';
import { HttpClientModule} from '@angular/common/http'
import { AppComponent } from './app.component';
import { MapaComponent } from './components/mapa/mapa.component';

@NgModule({
  declarations: [
    AppComponent,
    MapaComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(environment.socketConfig),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
