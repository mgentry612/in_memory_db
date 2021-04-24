const Controller = require('../built/database/controller.js');

const runTests = (controller, lines) => {
    for (const line of lines) {
        const command = line[0];
        const lineExpectedOutput = line[1];
        const message = controller.newLine(command);
        expect(message).toEqual(lineExpectedOutput);
    }
}

test ('Example #1', () => {

    const lines = [
        ['GET a', 'NULL'],
        ['SET a foo', ''],
        ['SET b foo', ''],
        ['COUNT foo', '2'],
        ['COUNT bar', '0'],
        ['DELETE a', ''],
        ['COUNT foo', '1'],
        ['SET b baz', ''],
        ['COUNT foo', '0'],
        ['GET b', 'baz'],
        ['GET B', 'NULL'],
        ['END', null],
    ];

    const controller = new Controller();
    runTests(controller, lines);
    
});

test ('Example #2', () => {

    const lines = [
        ['SET a foo', ''],
        ['SET a foo', ''],
        ['COUNT foo', '1'],
        ['GET a', 'foo'],
        ['DELETE a', ''],
        ['GET a', 'NULL'],
        ['COUNT foo', '0'],
        ['END', null],
    ];

    const controller = new Controller();
    runTests(controller, lines);
    
});

test ('Example #3', () => {

    const lines = [
        ['BEGIN', ''],
        ['SET a foo', ''],
        ['GET a', 'foo'],
        ['BEGIN', ''],
        ['SET a bar', ''],
        ['GET a', 'bar'],
        ['SET a baz', ''],
        ['ROLLBACK', ''],
        ['GET a', 'foo'],
        ['ROLLBACK', ''],
        ['GET a', 'NULL'],
        ['END', null],
    ];

    const controller = new Controller();
    runTests(controller, lines);
    
});

test ('Example #4', () => {

    const lines = [
        ['SET a foo', ''],
        ['SET b baz', ''],
        ['BEGIN', ''],
        ['GET a', 'foo'],
        ['SET a bar', ''],
        ['COUNT bar', '1'],
        ['BEGIN', ''],
        ['COUNT bar', '1'],
        ['DELETE a', ''],
        ['GET a', 'NULL'],
        ['COUNT bar', '0'],
        ['ROLLBACK', ''],
        ['GET a', 'bar'],
        ['COUNT bar', '1'],
        ['COMMIT', ''],
        ['GET a', 'bar'],
        ['GET b', 'baz'],
        ['END', null],
    ];

    const controller = new Controller();
    runTests(controller, lines);
    
});
