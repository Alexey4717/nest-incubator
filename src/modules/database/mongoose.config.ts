import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

import { DatabaseConfig } from './database.config';

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
  constructor(private readonly databaseConfig: DatabaseConfig) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.databaseConfig.MONGO_URI,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
  }
}
