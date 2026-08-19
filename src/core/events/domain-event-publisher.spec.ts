import { Global, Injectable, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AggregateRoot, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import 'reflect-metadata';

import { DOMAIN_EVENT_HANDLERS, DomainEventPublisher } from './domain-event-publisher';

class TestEvent {
  constructor(public readonly name: string) {}
}

class OtherEvent {
  constructor(public readonly name: string) {}
}

@Injectable()
@EventsHandler(TestEvent)
class TestHandler implements IEventHandler<TestEvent> {
  handle = jest.fn().mockResolvedValue(undefined);
}

class TestAggregate extends AggregateRoot {
  doSomething(name: string) {
    this.apply(new TestEvent(name));
  }

  doOther(name: string) {
    this.apply(new OtherEvent(name));
  }
}

describe('DomainEventPublisher', () => {
  const createPublisher = (handler: TestHandler) => {
    const moduleRef = {
      get: jest.fn((token: unknown) => {
        if (token === DOMAIN_EVENT_HANDLERS) {
          return [TestHandler];
        }
        if (token === TestHandler) {
          return handler;
        }
        throw new Error(`unexpected token: ${String(token)}`);
      }),
    };

    return {
      publisher: new DomainEventPublisher(moduleRef as unknown as ModuleRef),
      moduleRef,
    };
  };

  it('awaits matching handlers and clears uncommitted events', async () => {
    const handler = new TestHandler();
    const { publisher } = createPublisher(handler);
    const aggregate = new TestAggregate();
    aggregate.doSomething('alpha');

    await publisher.publishUncommitted(aggregate);

    expect(handler.handle).toHaveBeenCalledTimes(1);
    expect(handler.handle).toHaveBeenCalledWith(expect.objectContaining({ name: 'alpha' }));
    expect(aggregate.getUncommittedEvents()).toHaveLength(0);
  });

  it('does not call handlers for unmatched events but still uncommits', async () => {
    const handler = new TestHandler();
    const { publisher } = createPublisher(handler);
    const aggregate = new TestAggregate();
    aggregate.doOther('beta');

    await publisher.publishUncommitted(aggregate);

    expect(handler.handle).not.toHaveBeenCalled();
    expect(aggregate.getUncommittedEvents()).toHaveLength(0);
  });

  it('does nothing when there are no uncommitted events', async () => {
    const handler = new TestHandler();
    const { publisher, moduleRef } = createPublisher(handler);

    await publisher.publishUncommitted(new TestAggregate());

    expect(moduleRef.get).not.toHaveBeenCalled();
    expect(handler.handle).not.toHaveBeenCalled();
  });

  it('does not uncommit when a handler throws', async () => {
    const handler = new TestHandler();
    handler.handle.mockRejectedValue(new Error('send failed'));
    const { publisher } = createPublisher(handler);
    const aggregate = new TestAggregate();
    aggregate.doSomething('gamma');

    await expect(publisher.publishUncommitted(aggregate)).rejects.toThrow('send failed');
    expect(aggregate.getUncommittedEvents()).toHaveLength(1);
  });

  it('resolves handlers from a sibling module via ModuleRef', async () => {
    @Global()
    @Module({
      providers: [DomainEventPublisher],
      exports: [DomainEventPublisher],
    })
    class PublisherModule {}

    @Module({
      providers: [TestHandler, { provide: DOMAIN_EVENT_HANDLERS, useValue: [TestHandler] }],
      exports: [TestHandler, DOMAIN_EVENT_HANDLERS],
    })
    class HandlersModule {}

    const testingModule = await Test.createTestingModule({
      imports: [PublisherModule, HandlersModule],
    }).compile();

    const publisher = testingModule.get(DomainEventPublisher);
    const handler = testingModule.get(TestHandler);
    const aggregate = new TestAggregate();
    aggregate.doSomething('delta');

    await publisher.publishUncommitted(aggregate);

    expect(handler.handle).toHaveBeenCalledTimes(1);
    expect(handler.handle).toHaveBeenCalledWith(expect.objectContaining({ name: 'delta' }));
    expect(aggregate.getUncommittedEvents()).toHaveLength(0);

    await testingModule.close();
  });
});
