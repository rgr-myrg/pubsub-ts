import {PubSub} from "./index";

describe("PubSub Tests", () => {
    let publisher: PubSub.Publisher;
    let subscriber: PubSub.Subscriber;
    let subscriberKey: string = 'aKey';
    let subscriberSpy: any;
    let receivedMsg: string | null;
    let onStandardSpy: any;
	let onPrioritySpy: any;
	let onUrgentSpy: any;

	let delegate = {
		onStandard: function(notification: PubSub.Notification) {},
		onPriority: function(notification: PubSub.Notification) {},
		onUrgent:   function(notification: PubSub.Notification) {}
	};

    beforeEach(() => {
        publisher = new PubSub.Publisher();
        subscriber = new PubSub.Subscriber(subscriberKey);

        subscriber.on('postMsg', (notification: PubSub.Notification) => {
            receivedMsg = notification.body;
        });

        subscriberSpy = spyOn(subscriber, "post").and.callThrough();
        receivedMsg = '';

        subscriber.on('standard', (notification: PubSub.Notification) => {
            delegate.onStandard(notification);
        });

        subscriber.on('priority', (notification: PubSub.Notification) => {
            delegate.onPriority(notification);
        });

        subscriber.on('urgent', (notification: PubSub.Notification) => {
            delegate.onUrgent(notification);
        });

        onStandardSpy = spyOn(delegate, "onStandard").and.callThrough();
		onPrioritySpy = spyOn(delegate, "onPriority").and.callThrough();
		onUrgentSpy   = spyOn(delegate, "onUrgent").and.callThrough();
    });

    it("Publisher.add should register a subscriber", () => {
        publisher.add(subscriber);

        expect(publisher.has(subscriberKey)).toBe(true);
    });

    it("Publisher.delete should remove a subscriber", () => {
        publisher.add(subscriber);
        publisher.delete(subscriber);

        expect(publisher.has(subscriberKey)).toBe(false);
    });

    it("Publisher.notify should send the notification", () => {
        subscriber.start();

        publisher.add(subscriber);
        publisher.notify('postMsg', 'a message');

        expect(subscriber.post).toHaveBeenCalledTimes(1);
        expect(receivedMsg).toEqual('a message');
    });

    it("Publisher.notifyUrgent should send the urgent notification", () => {
        publisher.add(subscriber);
        publisher.notifyUrgent('urgent', 'urgent message');

        expect(subscriber.post).toHaveBeenCalledTimes(1);
        expect(delegate.onUrgent).toHaveBeenCalledTimes(1);
    });

    it("Publisher.notifyPriority should send priority before standard notifications", () => {
        publisher.add(subscriber);
        publisher.notify('standard', 'standard message');
        publisher.notifyPriority('priority', 'priority message');

        subscriber.start();
        expect(delegate.onPriority).toHaveBeenCalledBefore(onStandardSpy);
    });

    it("Subscriber.start() should enable receiving notifications", () => {
		let notification: PubSub.Notification = {
            name: 'standard',
            body: 'test',
            type: PubSub.NotificationType.standard
        };

		for (let i = 0; i < 5; i++) {
			subscriber.post(notification);
		}

		subscriber.start();

		expect(delegate.onStandard).toHaveBeenCalledTimes(5);
		expect(delegate.onStandard).toHaveBeenCalledWith(notification);
	});

    it("Subscriber.pause() should disable receiving notifications", () => {
		subscriber.start();

        publisher.add(subscriber);
        publisher.notify('standard', 'standard message');

        subscriber.pause();

        publisher.notify('standard', 'standard message');

		expect(delegate.onStandard).toHaveBeenCalledTimes(1);
	});
});
