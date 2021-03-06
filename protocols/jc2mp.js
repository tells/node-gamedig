const Gamespy3 = require('./gamespy3');

// supposedly, gamespy3 is the "official" query protocol for jcmp,
// but it's broken (requires useOnlySingleSplit), and may not include some player names
class Jc2mp extends Gamespy3 {
    constructor() {
        super();
        this.useOnlySingleSplit = true;
        this.isJc2mp = true;
        this.encoding = 'utf8';
    }
    async run(state) {
        await super.run(state);
        if(!state.players.length && parseInt(state.raw.numplayers)) {
            for(let i = 0; i < parseInt(state.raw.numplayers); i++) {
                state.players.push({});
            }
        }
    }
}

module.exports = Jc2mp;
