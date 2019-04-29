const WebSocket = require('ws');
const uuid = require('uuid/v1');

const wss = new WebSocket.Server({ port: 8080 });

const retros = {};

const connections = {
    // retro id: [ client websockets ],
};

function updateConnections() {
    console.log('Object.keys(connections)', Object.keys(connections));
    console.log('Object.keys(retros)', Object.keys(retros));
    Object.keys(connections).forEach(retroid => {
        let clients = connections[retroid];
        let retro = retros[retroid];
        console.log('clients.length', clients.length, 'retro', retro);
        clients.forEach(ws => {
            if (ws.readyState != WebSocket.OPEN) {   // prune dead connections
                delete ws;
            } else {
                ws.send(JSON.stringify({
                    retro
                }));
            }
        })
    });
}

function handleMessage(evt, ws) {
    let msg = JSON.parse(evt);
    console.log(msg);
    let type = msg && msg.type;
    let id = msg && msg.id;
    switch (type) {
        case 'startretro':
            // check if exists, else create
            if (retros[id]) {
                console.log('retro exists');
                connections[id].push(ws);
            } else {
                console.log('create retro');
                retros[id] = {
                    wentwell: [],
                    improve: [],
                    actionItems: [],
                    connections: []
                }
                connections[id] = [ws];
            }
            //console.log('pushing ', ws, 'to ', retros[id]);

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
            let cardToDownvote = retros[id] && [...retros[id].wentwell, ...retros[id].improve, ...retros[id].actionItems].find(card => card.title == msg.cardTitle);
            cardToDownvote.votes--;
            break;
    }
    updateConnections();
}

wss.on('connection', ws => {
    //connections.push(ws);
    ws.on('message', evt => handleMessage(evt, ws));
    updateConnections();
});