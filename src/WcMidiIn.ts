
export enum LOG_TO {
    CLIENT,
    SERVER
}

export enum DEFFERED_EVENT_TYPE{
    IN_SPP,
    IN_BAR,
    AT_SPP,
    AT_BAR,
    QUANTIZE_SPP,
    QUANTIZE_BAR
}

export enum MIDI_FILTER_ACTION_IF_NOT {
    DO_NOT_DELETE,
    DELETE_IF_NOT,
    DELETE_IF_IS
}

type _RangeOfRangeMap = number[];
export class RangeMap {
    val: _RangeOfRangeMap[] = [];

    addValues(fromStart: number, fromEnd?: number, toStart?: number, toEnd?: number) {
        let ary: _RangeOfRangeMap = [];
        for (let i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'undefined') {
                ary.push(arguments[i]);
            }
        }
        this.val.push(ary);
    }
}

class RoutingMidiChain {
    private portNumber: number;
    private wcmidiinWs: any;
    private chainId: number;

    constructor(wcmidioutWs: any, portNumber: number, chainId: number) {
        this.portNumber = portNumber;
        this.wcmidiinWs = wcmidioutWs;
        this.chainId = chainId;
    }


    routingActionAddSendPortByName(portName: string) {
        return new Promise((resolve) => {
            this.wcmidiinWs.routingActionAddSendPortByName(this.portNumber, this.chainId, portName, (arg: any) => {
                resolve(arg);
            })
        })
    }

    routingActionAddSendPortByNumber(portNumberOut: number) {
        return new Promise((resolve) => {
            this.wcmidiinWs.routingActionAddSendPortByNumber(this.portNumber, this.chainId, portNumberOut, (arg: any) => {
                resolve(arg);
            })
        })
    }

    routingActionAddSendRemoteServer(serverName:string, serverPort:number, remoteMidiPortNumber:number) {
        return new Promise((resolve) => {
            this.wcmidiinWs.routingActionAddSendRemoteServer(this.portNumber, this.chainId, serverName, serverPort, remoteMidiPortNumber, (arg: any) => {
                resolve(arg);
            })
        })
    }

    routingActionAddLogData(logto: LOG_TO) {
        return new Promise((resolve) => {
            this.wcmidiinWs.routingActionAddLogData(this.portNumber, this.chainId, logto, (arg: any) => {
                resolve(arg);
            })
        })
    }

    routingActionAddDeferedEvent(defferedEventType: DEFFERED_EVENT_TYPE, defferedTo:number) {
        return new Promise((resolve) => {
            this.wcmidiinWs.routingActionAddDeferedEvent(this.portNumber, this.chainId, defferedEventType, defferedTo , (arg: any) => {
                resolve(arg);
            })
        })
    }    

    routingActionAddFilterMidiChannelMsg(channels: RangeMap, eventTypes: RangeMap, data1: RangeMap, data2: RangeMap,
        midiFilterActionIfNot: MIDI_FILTER_ACTION_IF_NOT) {
        return new Promise((resolve) => {
            this.wcmidiinWs.routingActionAddFilterMidiChannelMsg(this.portNumber, this.chainId,
                channels.val, eventTypes.val, data1.val, data2.val, midiFilterActionIfNot, (arg: any) => {
                    resolve(arg);
                })
        })
    }

}


class _MidiInPort {
    private portNumber: number;
    private wcmidiinWs: any;

    routingMidiChains: RoutingMidiChain[] = [];

    constructor(wcmidioutWs: any, portNumber: number) {
        this.portNumber = portNumber;
        this.wcmidiinWs = wcmidioutWs;
    }

    isPortOpen(): Promise<boolean> {
        return new Promise((resolve) => {
            this.wcmidiinWs.isPortOpen(this.portNumber, (arg: boolean) => {
                resolve(arg);
            })
        })
    }

    ignoreTypes(midiSysex = true, midiTime = true, midiSense = true) {
        return new Promise((resolve) => {
            this.wcmidiinWs.ignoreTypes(this.portNumber, midiSysex, midiTime, midiSense, (arg: any) => {
                resolve(arg);
            })
        })
    }

    addCc14Bit(channel:number, cc:number) {
        return new Promise((resolve) => {
            this.wcmidiinWs.addCc14Bit(this.portNumber, channel, cc, (arg: any) => {
                resolve(arg);
            })
        })
    }




    addPropegateClockPort(portNumberToPropegate:number) {
        return new Promise((resolve) => {
            this.wcmidiinWs.addCc14Bit(this.portNumber, portNumberToPropegate,  (arg: any) => {
                resolve(arg);
            })
        })
    }

    /* // Use clearRoutingMidiChains
    clearPropegateClockPort(channel:number, cc:number) {
        return new Promise((resolve) => {
            this.wcmidiinWs.clearPropegateClockPort(this.portNumber, (arg: any) => {
                resolve(arg);
            })
        })
    }

    clearCc14Bit(channel:number, cc:number) {
        return new Promise((resolve) => {
            this.wcmidiinWs.clearCc14Bit(this.portNumber, (arg: any) => {
                resolve(arg);
            })
    })
    }
    */
    clearRoutingMidiChains() {
        return new Promise((resolve) => {
            this.wcmidiinWs.clearRoutingMidiChains(this.portNumber, (arg: any) => {
                this.routingMidiChains.length = 0;
                resolve(arg);
            })
        })
    }
    
    setTimeSig(timeSig=4, timeSigDivBy=4, fromSppPos = 0) {
        return new Promise((resolve) => {
            this.wcmidiinWs.setTimeSig(this.portNumber, timeSig, timeSigDivBy, fromSppPos,  (arg: any) => {
                resolve(arg);
            })
        })
    }

    routingMidiChainsAaddChain(): Promise<RoutingMidiChain> {
        return new Promise((resolve) => {
            this.wcmidiinWs.routingMidiChainsAaddChain(this.portNumber, (chainId: number) => {
                let rmc = new RoutingMidiChain(this.wcmidiinWs, this.portNumber, chainId);
                this.routingMidiChains.push(rmc)
                resolve(rmc);
            })
        })
    }
}

export class WcMidiIn {
    private wcmidiinWs: any;
    private _cashedOpenedPorts: { key: number; value: string; }[];

    constructor(wcmidiout: any) {
        this.wcmidiinWs = wcmidiout;
    }

    open() {
        //connect to the changed signal of a property
        this.wcmidiinWs.msgToClient.connect((str: string) => {
            this._msgToClient(str);
        });
        this.wcmidiinWs.dataToClient.connect((str: string) => {
            this._dataToClient(str);
        });
    }

    private _msgToClient(str: string) {
        console.log("from server:" + str)
    }

    //This should be overload by logic
    private _dataToClient(str: string) {
        console.log(str)
    }

    sendMsg(msg: string) {
        this.wcmidiinWs.msgToServer(msg);
    }

    getPortCount(): Promise<number> {
        return new Promise((resolve) => {
            this.wcmidiinWs.getPortCount((arg: number) => {
                resolve(arg);
            })
        })
    }

    getPortName(i: number): Promise<string> {
        return new Promise((resolve) => {
            this.wcmidiinWs.getPortName(i, (arg: string) => {
                resolve(arg);
            })
        })
    }

    getPortNumber(s: string): Promise<number> {
        return new Promise((resolve) => {
            this.wcmidiinWs.getPortNumber(s, (arg: number) => {
                resolve(arg);
            })
        })
    }

    openPort(portNumber: number) {
        return new Promise((resolve) => {
            this.wcmidiinWs.openPort(portNumber, () => {
                resolve();
            })
        })
    }

    getPorts(): Promise<{ key: number; value: string; }[]> {
        return new Promise((resolve) => {
            this.wcmidiinWs.getPorts((arg: any) => {
                resolve(arg);
            })
        })
    }

    getOpenedPorts(): Promise<{ key: number; value: string; }[]> {
        return new Promise((resolve) => {
            this.wcmidiinWs.getOpenedPorts((arg: any) => {
                this._cashedOpenedPorts = arg;
                resolve(arg);
            })
        })
    }



    openVirtualPort(portName: string) {
        return new Promise((resolve) => {
            this.wcmidiinWs.openVirtualPort(portName, (arg: any) => {
                resolve();
            })
        })
    }

    async port(n: number) {
        if (this._isPortCashed(n)) {
            return new _MidiInPort(this.wcmidiinWs, n);
        }

        await this.getOpenedPorts();
        if (this._isPortCashed(n)) {
            return new _MidiInPort(this.wcmidiinWs, n);
        }
        await this.openPort(n);
        await this.getOpenedPorts();
        return new _MidiInPort(this.wcmidiinWs, n);
    }

    private _isPortCashed(n: number): boolean {
        if (this._cashedOpenedPorts) {
            if (Object.keys(this._cashedOpenedPorts).indexOf(n.toString()) > -1) {
                return true;
            }
        }
        return false;
    }



}