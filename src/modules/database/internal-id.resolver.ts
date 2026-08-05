import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class InternalIdResolver {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async resolveUserId(publicId: string): Promise<string> {
    return this.resolvePublicId('users', publicId);
  }

  async resolveBlogId(publicId: string): Promise<string> {
    return this.resolvePublicId('blogs', publicId);
  }

  async resolvePostId(publicId: string): Promise<string> {
    return this.resolvePublicId('posts', publicId);
  }

  async lookupUserPublicId(internalId: string): Promise<string | null> {
    return this.lookupPublicId('users', internalId);
  }

  async lookupBlogPublicId(internalId: string): Promise<string | null> {
    return this.lookupPublicId('blogs', internalId);
  }

  async lookupPostPublicId(internalId: string): Promise<string | null> {
    return this.lookupPublicId('posts', internalId);
  }

  private async resolvePublicId(table: string, publicId: string): Promise<string> {
    const rows: { id: string }[] = await this.dataSource.query(
      `SELECT "id"::text AS "id" FROM "${table}" WHERE "public_id" = $1 LIMIT 1`,
      [publicId],
    );
    const internalId = rows[0]?.id;
    if (!internalId) {
      throw new Error(`${table} not found for public_id=${publicId}`);
    }
    return internalId;
  }

  private async lookupPublicId(table: string, internalId: string): Promise<string | null> {
    const rows: { public_id: string }[] = await this.dataSource.query(
      `SELECT "public_id"::text AS "public_id" FROM "${table}" WHERE "id" = $1 LIMIT 1`,
      [internalId],
    );
    return rows[0]?.public_id ?? null;
  }
}
