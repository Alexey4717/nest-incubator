export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): TOutput | Promise<TOutput>;
}
