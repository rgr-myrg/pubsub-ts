export module PubSub {
    export enum NotificationType {
        standard,
        priority,
        urgent
    }

    export interface Notification {
        name: string;
        body: any;
        type: NotificationType;
    }

    export class Subscriber {
        private standardQueue: Notification[] = [];
        private priorityQueue: Notification[] = [];

        private interests: Map<string, Function> = new Map();
        private key: string;
        private shouldPost: boolean = false;

        constructor(key: string = '' + new Date().getTime()) {
            this.key = key;
        }

        public on(eventName: string, callback: Function): void {
            this.interests.set(eventName, callback);
        }

        public off(eventName: string): void {
            this.interests.delete(eventName);
        }

        public getKey(): string {
            return this.key;
        }

        public start(): void {
            this.shouldPost = true;
            this.processNotifications();
        }

        public pause(): void {
            this.shouldPost = false;
        }

        public post(notification: Notification): void {
            switch(notification.type) {
                case NotificationType.standard:
                    this.standardQueue.unshift(notification);
                    break;

                case NotificationType.priority:
                    this.priorityQueue.unshift(notification);
                    break;

                case NotificationType.urgent:
                    this.postCallback(notification);
                    break;
            }

            this.processNotifications();
        }

        private processNotifications(): void {
            if (!this.shouldPost) {
                return;
            }

            this.postNotifications(this.priorityQueue);
            this.postNotifications(this.standardQueue);
        }

        private postNotifications(queue: Notification[]): void {
            let i = queue.length;

            while (i--) {
                let notification: Notification = queue[i];
                this.postCallback(notification);
            }
        }

        private postCallback(notification: Notification): void {
            let callback: Function = <Function> this.interests.get(notification.name);

            if (callback) {
                callback.call(this, notification);
            }
        }
    }

    export class Publisher {
        private subscribers: Map<string, Subscriber> = new Map();

        public add(subscriber: Subscriber): void {
            let key: string = subscriber.getKey();

            if (!this.has(key)) {
                this.subscribers.set(key, subscriber);
            }
        }

        public delete(subscriber: Subscriber): void {
            this.subscribers.delete(subscriber.getKey());
        }

        public has(key: string): boolean {
            return this.subscribers.has(key);
        }

        public notify(eventName: string, data: any): void {
            this.sendNotification(eventName, data, NotificationType.standard);
        }

        public notifyPriority(eventName: string, data: any): void {
            this.sendNotification(eventName, data, NotificationType.priority);
        }

        public notifyUrgent(eventName: string, data: any): void {
            this.sendNotification(eventName, data, NotificationType.urgent);
        }

        private sendNotification(eventName: string, data: any, type: NotificationType): void {
            this.subscribers.forEach(subscriber => {
                subscriber.post({
                    name: eventName,
                    body: data,
                    type: type
                });
            });
        }
    }
}
