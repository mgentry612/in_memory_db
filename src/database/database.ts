interface NameIndex {
    [key: string]: number,
}

interface ValueIndex {
    [key: string]: number[],
}

interface Store {
    [key: number]: Tuple,
}

interface Transactions {
    [key: number]: Transaction,
}

interface TransactionLog {
    id: number;
    name: string;
    oldValue: string;
    newValue: string;
    type: TransactionType;
};

enum TransactionType {
    INSERT = 1,
    UPDATE = 2,
    DELETE = 3,
}


class Tuple {
    private id: number;
    private name: string;
    private value: string;

    constructor (id: number, name: string, value: string) {
        this.id = id;
        this.name = name;
        this.value = value;
    }

    public getId (): number {
        return this.id;
    }

    public getName (): string {
        return this.name;
    }

    public setValue (value: string): void {
        this.value = value;
    }

    public getValue (): string {
        return this.value;
    }
};

class Transaction {
    private logs: TransactionLog[] = [];

    constructor () { }

    public addLog (tuple: Tuple, type: TransactionType, oldValue: string = null): void {
        let newValue = null;
        if (type === TransactionType.INSERT) {
            newValue = tuple.getValue();
        } else if (type === TransactionType.UPDATE) {
            newValue = tuple.getValue();
        } else if (type === TransactionType.DELETE) {
            oldValue = tuple.getValue();
        }
        const log: TransactionLog = {
            id: tuple.getId(),
            name: tuple.getName(),
            oldValue: oldValue,
            newValue: newValue,
            type: type,
        }
        this.logs.push(log);
    }

    public getLogs() {
        return this.logs;
    }
}

export class Database {
    private store: Store = {};
    private nameIndex: NameIndex = {};
    private valueIndex: ValueIndex = {};
    private tupleID: number = 0;
    private transactions: Transactions = {};
    private currentTransactionID: number = 0;

    constructor () { }

    public setName (name: string, value: string): number {

        let id = this.nameIndex[name];

        if (id === undefined ) {

            // If name doesn't exist, insert a new tuple
            const newId = ++ this.tupleID;
            const tuple = new Tuple(newId, name, value);

            // Log state
            if (this.isActiveTransaction()) {
                this.transactions[this.currentTransactionID].addLog(tuple, TransactionType.INSERT);
            }

            this.store[newId] = tuple;
            id = newId;

            // Update name index
            this.nameIndex[name] = newId;

        } else {

            // Name exists, update it
            const tuple = this.store[id];
            const oldValue = tuple.getValue();

            // Update value index
            this.removeIdxFromValueIdx(oldValue, id);

            // Update value in store
            tuple.setValue(value);

            // Log state
            if (this.isActiveTransaction()) {
                this.transactions[this.currentTransactionID].addLog(tuple, TransactionType.UPDATE, oldValue);
            }

        }

        // Update value index
        this.addIdxFromValueIdx(value, id);

        return id;
    }

    public getValue (name: string): string {

        const id = this.nameIndex[name];

        if (id === undefined) {
            // Name not found, return null
            return null;
        } else {
            // Name found, return value
            const tuple = this.store[id];
            return tuple.getValue();
        }

    }

    private addIdxFromValueIdx (value: string, id: number): void {
        if (this.valueIndex[value] === undefined) {
            this.valueIndex[value] = [];
        }
        this.valueIndex[value].push(id);
    }

    private removeIdxFromValueIdx (value: string, id: number): void {
        const valueIdx = this.valueIndex[value].indexOf(id);
        if (valueIdx > -1) {

            this.valueIndex[value].splice(valueIdx, 1);

            // No more instances of this value, delete the empty array
            if (this.valueIndex[value].length === 0) {
                delete this.valueIndex[value];
            }
        }
    }

    public deleteName (name: string): string {

        try {
            const id = this.nameIndex[name];
    
            if (id !== undefined) {
                const tuple = this.store[id];

                // Log state
                if (this.isActiveTransaction()) {
                    this.transactions[this.currentTransactionID].addLog(tuple, TransactionType.DELETE);
                }
    
                // Remove from value index
                this.removeIdxFromValueIdx(tuple.getValue(), id);
                
                // Remove from name index
                delete this.nameIndex[name];

                // Remove from store
                delete this.store[id];
            }
        } catch(error) {
            return error;
        }

        return '';

    }

    public countValue (value: string): number {

        const id = this.valueIndex[value];

        if (id !== undefined) {
            // This value exists in the database, return the count
            return this.valueIndex[value].length;
        } else {
            return 0;
        }

    }

    // Start Transaction Operations

    public beginTransaction (): void {
        // Write-ahead logging
        this.transactions[++ this.currentTransactionID] = new Transaction();
    }

    public rollbackTransaction (): boolean {
        if (!this.isActiveTransaction()) {
            return false;
        }

        const latest = Object.keys(this.transactions).sort();
        const rollBackTransactionId = Number(latest.pop());

        const transaction = this.transactions[rollBackTransactionId];
        const logs = transaction.getLogs();
        
        for (var i = logs.length - 1; i >= 0; i--) {
            const log = logs[i];

            if (log.type === TransactionType.INSERT) {

                // Update store
                delete this.store[log.id];
                
                // Update name index
                delete this.nameIndex[log.name];

                // Update value index
                this.removeIdxFromValueIdx(log.newValue, log.id);

                // Update
                this.tupleID -= 1

            } else if (log.type === TransactionType.UPDATE) {

                // Update store
                this.store[log.id].setValue(log.oldValue);

                // Update value index
                this.removeIdxFromValueIdx(log.newValue, log.id);
                this.addIdxFromValueIdx(log.oldValue, log.id);

            } else if (log.type === TransactionType.DELETE) {

                // Update store
                const tuple = new Tuple(log.id, log.name, log.oldValue);
                this.store[log.id] = tuple;

                // Update name index
                this.nameIndex[log.name] = log.id;

                // Update value index
                this.addIdxFromValueIdx(log.oldValue, log.id);

            }
        }

        delete this.transactions[rollBackTransactionId];

        this.currentTransactionID = Number(latest.pop());

        return true;
    }

    public commitTransaction (): void {
        if (!this.isActiveTransaction()) {
            return;
        }

        const transactionKeys = Object.keys(this.transactions).sort();
        // Loop through all nested transactions
        for (const transactionId in transactionKeys) {
            // Just delete logs, we don't need them anymore.
            delete this.transactions[transactionId];
        }
    }

    private isActiveTransaction (): boolean {
        return !!Object.keys(this.transactions).length;
    }

    // End Transaction Operations

}