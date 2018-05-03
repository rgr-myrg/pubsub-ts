import {PubSub} from "./index";

describe("PubSub Tests", () => {
    let publisher: PubSub.Publisher;
    let subscriber: PubSub.Subscriber;
    let subscriberKey: string = 'aKey';
    let subscriberSpy: any;
    let receivedMsg: string | null;

    beforeEach(() => {
        publisher = new PubSub.Publisher();
        subscriber = new PubSub.Subscriber(subscriberKey);
        subscriber.on('postMsg', (notification:Notification) => {
            receivedMsg = notification.body;
        });

        subscriberSpy = spyOn(subscriber, "post").and.callThrough();
        receivedMsg = '';
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

    it("Publisher.notify should send the standard notification", () => {
        subscriber.start();

        publisher.add(subscriber);
        publisher.notify('postMsg', 'a message');

        expect(subscriber.post).toHaveBeenCalledTimes(1);
        expect(receivedMsg).toEqual('a message');
    });

    it("Publisher.notifyUrgent should send the urgent notification", () => {
        publisher.add(subscriber);
        publisher.notifyUrgent('postMsg', 'urgent message');

        expect(subscriber.post).toHaveBeenCalledTimes(1);
        expect(receivedMsg).toEqual('urgent message');
    });

    it("Publisher.notify should xxx", () => {
        let agent: PubSub.Subscriber = new PubSub.Subscriber();

        agent.on('withdraw', (notification: PubSub.Notification) => {
            let amount: number = notification.body;
            console.log('[amount]' + notification.body)
        });

        agent.start();
        publisher.add(agent);
        publisher.notify('withdraw', 1500);

        expect(true).toEqual(true);
    });
});
