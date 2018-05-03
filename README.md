# PubSub
Publisher/Subscriber pattern plus messaging queue and notifications written in Typescript.

# Installation
```
npm install pubsub-ts
```

# Usage

### Creating a Subscriber
```typescript
import {PubSub} from "pubsub-ts";

let subscriber: PubSub.Subscriber = new PubSub.Subscriber();
```

### Registering for Notifications
```typescript
subscriber.on('postMsg', (notification:Notification) => {
    this.msg = notification.body;
});
```
### De-registering for Notifications
```typescript
subscriber.off('postMsg');
```
### Start receiving notifications
```typescript
subscriber.start();
```

### Pause receiving notifications
```typescript
subscriber.pause();
```
### Creating a Publisher
```typescript
import {PubSub} from "pubsub-ts";

let publisher: PubSub.Publisher = new PubSub.Publisher();
```
### Registering a Subscriber
```typescript
publisher.add(subscriber);
```

### Removing a Subscriber
```typescript
publisher.delete(subscriber);
```

### Sending a Notification
```typescript
publisher.notify('postMsg', 'a message');
```
You can also **prioritize** a Notification.
```typescript
publisher.notifyPriority('postMsg', 'priority message');
```
Or send a Notification as **urgent** to be delivered immediately.
```typescript
publisher.notifyUrgent('postMsg', 'urgent message');
```

# Notification Queue
Subscribers are equipped with a queue of notifications. You can control when the Subscriber should **start()** receiving notifications that were posted to its queue as well as **pause()** the queue.

This allows to preserve the order of notifications until the subscriber is ready to receive them. For example when waiting for an async operation to complete.

When a Subscriber is in the paused state, notifications are pushed into the queue for later processing.

When a Subscriber is in the started state, the queue will resume processing notifications.

**NOTE:** Subscribers are **paused** by default. You must invoke **start()** to enable processing from the queue. This is done so you have explicit control as to _when_ notifications should start being posted to the subscriber.

# Sample

```typescript
import {PubSub} from "pubsub-ts";

class TransactionAgent extends PubSub.Subscriber {
    constructor() {
        this.on('connectionChange', this.onConnected);
        this.on('withdrawal', this.onWithdrawal);
    }

    public onConnection(notification: PubSub.Notification): void {
        if (notification.body.status === 'online') {
            // Start receiving notifications
            this.start();
        } else {
            // Pause receiving notifications
            this.pause();
        }
    }

    public onWithdrawal(notification: PubSub.Notification): void {
        let amount: number = notification.body;
        console.log('[TransactionAgent]', amount);
    }
}

class ATM extends PubSub.Publisher {
    constructor() {
        this.add(new TransactionAgent());
    }

    public withdrawAmount(amount: number): void {
        this.notify('withdrawal', amount);
    }

    public connectionChange(status: string): void {
        this.notify('connectionChange', {status: status});
    }
}
```

```typescript
let atm: ATM = new ATM();
// 1. ATM not connected. Offline.
// 2. User requests withdrawal.
atm.withdrawAmount(1500);
// 3. ATM back online. Connection ready.
atm.connectionChange('online');
// 4. Transaction agent starts processing from the queue
// console log:
[TransactionAgent], 1500
```
# License
[MIT License](https://raw.githubusercontent.com/rgr-myrg/pubsub-ts/master/LICENSE)
