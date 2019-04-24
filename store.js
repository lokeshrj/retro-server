const uuid = require('uuid/v1');

function Retro() {
    this.cols = [];
    this.retroid = uuid();
}

Retro.prototype.addCol = function(colname) {
    let col = new Col(colname);
    this.cols.push(col);
    return col;
}

Retro.prototype.getCol = function(colname) {
    return this.cols.filter(col => col.name == colname)[0];
}

Retro.prototype.deleteCol = function(colname) {
    this.cols = this.cols.filter(col => col.name != colname);
}

function Col(name) {
    this.name = name;
    this.cards = [];
}

Col.prototype.addCard = function(cardtitle, carddesc) {
    this.cards.push(new Card(cardtitle, carddesc));
}

Col.prototype.deleteCard = function(cardtitle) {
    this.cards = this.cards.filter(card => card.title != cardtitle);
}

function Card(title, description) {
    this.title = title;
    this.description = description;
}

let retros = {};

module.exports = {
    createRetro: function() {
        let retro = new Retro();
        return retro.retroid;
    },
    getRetro: function(sid) {
        return retros[sid];
    },
}

// let cards = [
//     {
//         title: 'A Point',
//         desc: 'Some descriptive text'
//     },
//     {
//         title: 'Another point',
//         desc: 'Some other descriptive text'
//     }
// ];

// let cols = [
//     'Went Well',
//     'To Improve',
//     'Action Items'
// ];