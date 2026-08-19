import { DomainExceptionCode } from '../errors/domain-exception-code.enum';
import { DomainException } from '../errors/domain.exception';
import { Notification } from './notification';
import { notificationToDomainException } from './notification-to-domain';

describe('Notification', () => {
  describe('ok', () => {
    it('creates a success notification with data and no errors', () => {
      const note = Notification.ok({ id: '1' });

      expect(note.hasError()).toBe(false);
      expect(note.code).toBeNull();
      expect(note.data).toEqual({ id: '1' });
      expect(note.messages).toEqual([]);
    });

    it('allows null as success data', () => {
      const note = Notification.ok(null);

      expect(note.hasError()).toBe(false);
      expect(note.data).toBeNull();
    });
  });

  describe('fail', () => {
    it('sets code only when extensions are omitted (NotFound without messages)', () => {
      const note = Notification.fail(DomainExceptionCode.NotFound);

      expect(note.hasError()).toBe(true);
      expect(note.code).toBe(DomainExceptionCode.NotFound);
      expect(note.messages).toEqual([]);
      expect(note.data).toBeNull();
    });

    it('sets code and copies all field errors from extensions', () => {
      const note = Notification.fail(DomainExceptionCode.ValidationError, [
        { message: 'login too short', field: 'login' },
        { message: 'invalid email', field: 'email' },
      ]);

      expect(note.hasError()).toBe(true);
      expect(note.code).toBe(DomainExceptionCode.ValidationError);
      expect(note.messages).toEqual([
        { message: 'login too short', field: 'login' },
        { message: 'invalid email', field: 'email' },
      ]);
    });
  });

  describe('hasError', () => {
    it('is true when code is set even without messages', () => {
      expect(Notification.fail(DomainExceptionCode.Forbidden).hasError()).toBe(true);
    });

    it('is false for a successful notification', () => {
      expect(Notification.ok('ok').hasError()).toBe(false);
    });
  });

  describe('addError', () => {
    it('collects messages and overwrites code, returning this', () => {
      const note = new Notification<string>();

      const returned = note
        .addError('too short', 'login')
        .addError('invalid', 'email', DomainExceptionCode.ValidationError);

      expect(returned).toBe(note);
      expect(note.hasError()).toBe(true);
      expect(note.code).toBe(DomainExceptionCode.ValidationError);
      expect(note.messages).toEqual([
        { message: 'too short', field: 'login' },
        { message: 'invalid', field: 'email' },
      ]);
    });

    it('defaults code to BadRequest', () => {
      const note = new Notification().addError('required', 'name');

      expect(note.code).toBe(DomainExceptionCode.BadRequest);
    });
  });

  describe('addData', () => {
    it('stores data and returns this', () => {
      const note = new Notification<number>();

      expect(note.addData(42)).toBe(note);
      expect(note.data).toBe(42);
      expect(note.hasError()).toBe(false);
    });
  });
});

describe('notificationToDomainException', () => {
  it('returns data when notification has no error', () => {
    expect(notificationToDomainException(Notification.ok({ id: '1' }))).toEqual({ id: '1' });
  });

  it('throws DomainException with code and messages on failure', () => {
    const note = Notification.fail(DomainExceptionCode.BadRequest, [
      { message: 'login already exists', field: 'login' },
    ]);

    expect(() => notificationToDomainException(note)).toThrow(DomainException);
    try {
      notificationToDomainException(note);
    } catch (error) {
      expect(error).toMatchObject({
        code: DomainExceptionCode.BadRequest,
        extensions: [{ message: 'login already exists', field: 'login' }],
      });
    }
  });

  it('throws DomainException for NotFound without messages', () => {
    expect(() =>
      notificationToDomainException(Notification.fail(DomainExceptionCode.NotFound)),
    ).toThrow(DomainException);
  });
});
