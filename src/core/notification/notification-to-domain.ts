import { DomainException } from '../errors/domain.exception';
import { Notification } from './notification';

export function notificationToDomainException<T>(note: Notification<T>): T {
  if (note.hasError()) {
    throw new DomainException(note.code, note.messages);
  }

  return note.data as T;
}
