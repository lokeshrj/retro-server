const WebSocket = require('ws');
const uuid = require('uuid/v1');
// const store = require('./store');

// sample data
// let retroid = store.createRetro();
// let retro = store.getRetro(retroid);
// retro.addCol('col 1');
// retro.addCol('col 2');
// retro.getCol('col 1').addCard('card 1.1', 'description 1.1');
// retro.getCol('col 1').addCard('card 1.2', 'description 1.2');
// retro.getCol('col 2').addCard('card 2.1', 'description 2.1');
// retro.getCol('col 2').addCard('card 2.2', 'description 2.2');
// console.log(retro.getCol('col 1'));
// console.log(retro);

const wss = new WebSocket.Server({ port: 8080 });

const retros = {};

const connections = [];

function updateConnections() {
    connections.forEach(ws => {
        if (ws.readyState != WebSocket.OPEN) {   // prune dead connections
            delete ws;
        } else {
            ws.send(JSON.stringify({
                retros
            }));
        }
    })
}

function handleMessage(evt) {
    let msg = JSON.parse(evt);
    console.log(msg);
    let type = msg && msg.type;
    let id = msg && msg.id;
    switch(type) {
        case 'startretro':  // expecting { type: 'newsession }
            // check if exists, else create
            if (retros[id]) {
                // add this connection
            } else {
                retros[id] = {
                    wentwell: [],
                    improve: [],
                    actionItems: [],
                    //connections: []
                }
            }
            break;
        // case 'addcol':  // expecting { sid, type: 'addcol', colname }
        //     if (msg.sid && msg.colname) {
        //         let sid = msg.sid, colname = msg.colname;
        //         let retro = store.getRetro(sid)
        //         retro && retro.addCol(colname);

        //         ws.send(JSON.stringify({
        //             type: 'ack'
        //         }));
        //     }
        //     break;
        // case 'delcol':
        //     break;
        case 'addcard': // expecting { type: addcard, sid, colname, cardtitle, carddescription }
            let col = msg.col, card = msg.card; card.id = uuid();
            retros[id] && retros[id][col].push(card);
            break;
        case 'delcard':
            retros[id].wentwell = retros[id].wentwell.filter(card => card.title != msg.cardTitle);
            retros[id].improve = retros[id].improve.filter(card => card.title != msg.cardTitle);
            retros[id].actionItems = retros[id].actionItems.filter(card => card.title != msg.cardTitle);
            // let cardToDelete = retros[id] && [...retros[id].wentwell, ...retros[id].improve, ...retros[id].actionItems].find(card => card.title == msg.cardTitle);
            // delete cardToDelete;
            break;
        // case 'update':
        //     if (msg.sid && msg.retro) {

        //     }
        case 'upvote':
            let cardToUpvote = retros[id] && [...retros[id].wentwell, ...retros[id].improve, ...retros[id].actionItems].find(card => card.title == msg.cardTitle);
            cardToUpvote.votes++;
            break;
        case 'downvote':
            let cardToDownvote = retros[id] && retros[id].wentwell.find(card => card.title == msg.cardTitle);
            cardToDownvote.votes--;
            break;
    }
    updateConnections();
}

wss.on('connection', ws => {
    connections.push(ws);
    ws.on('message', evt => handleMessage(evt));
    updateConnections();
});