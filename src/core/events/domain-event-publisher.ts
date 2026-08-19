import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AggregateRoot, IEvent, IEventHandler } from '@nestjs/cqrs';
import { EVENTS_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

export const DOMAIN_EVENT_HANDLERS = 'DOMAIN_EVENT_HANDLERS';

export type DomainEventHandlerClass = Type<IEventHandler>;

/**
 * Awaits `@EventsHandler` handlers. Nest `EventBus.publish` does not wait, which would race e2e confirmation-code reads.
 * Do not also call `EventBus.publish` for the same events — handlers would run twice.
 */
@Injectable()
export class DomainEventPublisher {
  constructor(private readonly moduleRef: ModuleRef) {}

  async publishUncommitted(aggregate: AggregateRoot): Promise<void> {
    const events = [...aggregate.getUncommittedEvents()];
    if (events.length === 0) {
      return;
    }

    const handlerClasses = this.resolveHandlerClasses();
    for (const event of events) {
      await this.dispatch(event, handlerClasses);
    }

    aggregate.uncommit();
  }

  private resolveHandlerClasses(): DomainEventHandlerClass[] {
    try {
      return (
        this.moduleRef.get<DomainEventHandlerClass[]>(DOMAIN_EVENT_HANDLERS, { strict: false }) ??
        []
      );
    } catch {
      return [];
    }
  }

  private async dispatch(event: IEvent, handlerClasses: DomainEventHandlerClass[]): Promise<void> {
    const matching = handlerClasses.filter((handlerClass) =>
      this.isHandlerForEvent(handlerClass, event),
    );

    await Promise.all(
      matching.map((handlerClass) => {
        const handler = this.moduleRef.get<IEventHandler>(handlerClass, { strict: false });
        return handler?.handle(event);
      }),
    );
  }

  private isHandlerForEvent(handlerClass: DomainEventHandlerClass, event: IEvent): boolean {
    const handledEvents: Type<IEvent>[] =
      Reflect.getMetadata(EVENTS_HANDLER_METADATA, handlerClass) ?? [];
    return handledEvents.includes(event.constructor as Type<IEvent>);
  }
}
