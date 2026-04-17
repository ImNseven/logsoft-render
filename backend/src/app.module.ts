import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { OriginPointsModule } from './modules/origin-points/origin-points.module';
import { TransportTypesModule } from './modules/transport-types/transport-types.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        synchronize: false,
        autoLoadEntities: true,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    DatabaseModule,
    RedisModule,
    UsersModule,
    OriginPointsModule,
    TransportTypesModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
