import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async deleteAllData(): Promise<boolean> {
    try {
      await this.dataSource.query(`
        TRUNCATE TABLE
          "comment_reactions",
          "comments",
          "post_reactions",
          "posts",
          "blogs",
          "sessions",
          "users"
        RESTART IDENTITY CASCADE
      `);
      return true;
    } catch {
      return false;
    }
  }
}
