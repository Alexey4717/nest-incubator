import { DomainExceptionCode } from '../errors/domain-exception-code.enum';
import { Extension } from '../errors/extension.type';

export class Notification<T = null> {
  messages: Extension[] = [];
  code: DomainExceptionCode | null = null;
  data: T | null = null;

  constructor(data: T | null = null) {
    this.data = data;
  }

  hasError(): this is Notification<T> & { code: DomainExceptionCode } {
    return this.code !== null;
  }

  addError(
    message: string,
    field: string | null,
    code: DomainExceptionCode = DomainExceptionCode.BadRequest,
  ): this {
    this.code = code;
    this.messages.push({ message, field });
    return this;
  }

  addData(data: T): this {
    this.data = data;
    return this;
  }

  static ok<T>(data: T): Notification<T> {
    return new Notification(data);
  }

  static fail<T = null>(code: DomainExceptionCode, extensions: Extension[] = []): Notification<T> {
    const note = new Notification<T>(null);
    note.code = code;
    for (const extension of extensions) {
      note.messages.push({ message: extension.message, field: extension.field });
    }
    return note;
  }
}
