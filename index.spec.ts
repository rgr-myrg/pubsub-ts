import {PubSub} from "./index";

describe("PubSub Tests", () => {
    let notifier: PubSub.Publisher;
    let receiver: PubSub.Subscriber;
    let receiverKey: string = 'aKey';
    let receiverSpy: any;
    let receivedMsg: string | null;

    beforeEach(() => {
        notifier = new PubSub.Publisher();
        receiver = new PubSub.Subscriber(receiverKey);
        receiver.on('postMsg', (notification:Notification) => {
            receivedMsg = notification.body;
        });

        receiverSpy = spyOn(receiver, "post").and.callThrough();
        receivedMsg = '';
    });

    it("Publisher.add should register a receiver", () => {
        notifier.add(receiver);

        expect(notifier.get(receiverKey)).toEqual(receiver);
    });

    it("Publisher.delete should remove a receiver", () => {
        notifier.add(receiver);
        notifier.delete(receiverKey);

        expect(notifier.get(receiverKey)).toBeUndefined();
    });

    it("Publisher.notify should send the standard notification", () => {
        receiver.startReceivingNotifications();

        notifier.add(receiver);
        notifier.notify('postMsg', 'a message');

        expect(receiver.post).toHaveBeenCalledTimes(1);
        expect(receivedMsg).toEqual('a message');
    });

    it("Publisher.notifyUrgent should send the urgent notification", () => {
        notifier.add(receiver);
        notifier.notifyUrgent('postMsg', 'urgent message');

        expect(receiver.post).toHaveBeenCalledTimes(1);
        expect(receivedMsg).toEqual('urgent message');
    });
});
