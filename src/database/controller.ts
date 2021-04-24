import { Database } from './database.js';

export class Controller {
    private db: Database;

    constructor () {
        this.db = new Database();
    }

    public newLine (line: string): string {

        const args = line.trim().split(' ');
        const method = args[0];
        let name;
        let value;

        switch(method) {

            case 'HELP':
            case 'h':
                return 'Valid operations are:\nSET [name] [value]\nGET [name]\nDELETE [name]\nCOUNT[value]\nBEGIN\nROLLBACK\nCOMMIT\nEND';

            case 'SET':
                name = args[1];
                value = args[2];
                if ([name, value].indexOf(undefined) > -1) {
                    return 'SET requires a valid name and value.';
                }

                const idx = this.db.setName(name, value);
                if (idx === null) {
                    return 'Operation failed.';
                }
                return '';

            case 'GET':
                name = args[1];
                if ([name].indexOf(undefined) > -1) {
                    return 'GET requires a valid name.';
                }

                value = this.db.getValue(name);
                if (value !== null) {
                    return value;
                } else {
                    return 'NULL';
                }

            case 'DELETE':
                name = args[1];
                if ([name].indexOf(undefined) > -1) {
                    return 'DELETE requires a valid name.';
                }

                const error = this.db.deleteName(name);
                if (error !== '') {
                    return 'Operation failed. ' + error;
                }
                return '';

            case 'COUNT':
                value = args[1];
                if ([value].indexOf(undefined) > -1) {
                    return 'COUNT requires a valid value.';
                }

                const count = this.db.countValue(value);
                return count.toString();

            case 'BEGIN':
                this.db.beginTransaction();
                return '';

            case 'ROLLBACK':
                const success = this.db.rollbackTransaction();
                if (!success) {
                    return 'TRANSACTION NOT FOUND';
                }
                return '';

            case 'COMMIT':
                this.db.commitTransaction();
                return '';

            case 'END':
                return null;

            default:
                return method + ' is not a recognized operation.';

        }
    }
};