import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class InternalIdResolver {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async resolveUserId(publicId: string, manager?: EntityManager): Promise<string> {
    return this.resolvePublicId('users', publicId, manager);
  }

  async resolveBlogId(publicId: string, manager?: EntityManager): Promise<string> {
    return this.resolvePublicId('blogs', publicId, manager);
  }

  async resolvePostId(publicId: string, manager?: EntityManager): Promise<string> {
    return this.resolvePublicId('posts', publicId, manager);
  }

  async lookupUserPublicId(internalId: string, manager?: EntityManager): Promise<string | null> {
    return this.lookupPublicId('users', internalId, manager);
  }

  async lookupBlogPublicId(internalId: string, manager?: EntityManager): Promise<string | null> {
    return this.lookupPublicId('blogs', internalId, manager);
  }

  async lookupPostPublicId(internalId: string, manager?: EntityManager): Promise<string | null> {
    return this.lookupPublicId('posts', internalId, manager);
  }

  private getQueryExecutor(manager?: EntityManager): Pick<DataSource | EntityManager, 'query'> {
    return manager ?? this.dataSource;
  }

  private async resolvePublicId(
    table: string,
    publicId: string,
    manager?: EntityManager,
  ): Promise<string> {
    const rows: { id: string }[] = await this.getQueryExecutor(manager).query(
      `SELECT "id"::text AS "id" FROM "${table}" WHERE "public_id" = $1 LIMIT 1`,
      [publicId],
    );
    const internalId = rows[0]?.id;
    if (!internalId) {
      throw new Error(`${table} not found for public_id=${publicId}`);
    }
    return internalId;
  }

  private async lookupPublicId(
    table: string,
    internalId: string,
    manager?: EntityManager,
  ): Promise<string | null> {
    const rows: { public_id: string }[] = await this.getQueryExecutor(manager).query(
      `SELECT "public_id"::text AS "public_id" FROM "${table}" WHERE "id" = $1 LIMIT 1`,
      [internalId],
    );
    return rows[0]?.public_id ?? null;
  }
}
