import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { NATS_SERVICE } from 'src/config/services';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.nats.servers,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
