import { ICommand, IQuery } from '@nestjs/cqrs';

export abstract class TypedQuery<TResult> implements IQuery {
  protected readonly _result!: TResult;
}

export abstract class TypedCommand<TResult> implements ICommand {
  protected readonly _result!: TResult;
}

export type InferQueryResult<T> = T extends TypedQuery<infer R> ? R : never;
export type InferCommandResult<T> = T extends TypedCommand<infer R> ? R : never;

declare module '@nestjs/cqrs' {
  interface QueryBus {
    execute<T extends TypedQuery<unknown>>(query: T): Promise<InferQueryResult<T>>;
  }

  interface CommandBus {
    execute<T extends TypedCommand<unknown>>(command: T): Promise<InferCommandResult<T>>;
  }
}
