const Core = require('./core');

class Starmade extends Core {
    constructor() {
        super();
        this.encoding = 'latin1';
        this.byteorder = 'be';
    }

    async run(state) {
        const b = Buffer.from([0x00,0x00,0x00,0x09,0x2a,0xff,0xff,0x01,0x6f,0x00,0x00,0x00,0x00]);

        const payload = await this.withTcp(async socket => {
            return await this.tcpSend(socket, b, buffer => {
                if (buffer.length < 4) return;
                const reader = this.reader(buffer);
                const packetLength = reader.uint(4);
                if (buffer.length < packetLength + 12) return;
                return reader.rest();
            });
        });

        const reader = this.reader(payload);

        const data = [];
        state.raw.data = data;

        reader.skip(2);
        while(!reader.done()) {
            const mark = reader.uint(1);
            if(mark === 1) {
                // signed int
                data.push(reader.int(4));
            } else if(mark === 3) {
                // float
                data.push(reader.float());
            } else if(mark === 4) {
                // string
                const length = reader.uint(2);
                data.push(reader.string(length));
            } else if(mark === 6) {
                // byte
                data.push(reader.uint(1));
            }
        }

        if(data.length < 9) {
            throw new Error("Not enough units in data packet");
        }

        if(typeof data[3] === 'number') state.raw.version = data[3].toFixed(7).replace(/0+$/, '');
        if(typeof data[4] === 'string') state.name = data[4];
        if(typeof data[5] === 'string') state.raw.description = data[5];
        if(typeof data[7] === 'number') state.raw.numplayers = data[7];
        if(typeof data[8] === 'number') state.maxplayers = data[8];

        if('numplayers' in state.raw) {
            for(let i = 0; i < state.raw.numplayers; i++) {
                state.players.push({});
            }
        }
    }
}

module.exports = Starmade;
