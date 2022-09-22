import { SocketIoConfig } from "ngx-socket-io";

export const config: SocketIoConfig = {url: 'http://localhost:5000', options: {}};


export const environment = {
  production: true,
  socketConfig: config
};
