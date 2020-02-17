
export enum LOG_TO{
    CLIENT,
    SERVER
}

class RoutingMidiChain{
    private portNumber:number;
    private wcmidiinWs:any;
    private chainId:number;

    constructor(wcmidioutWs:any, portNumber:number, chainId:number){
        this.portNumber = portNumber;
        this.wcmidiinWs = wcmidioutWs;
        this.chainId = chainId;
    }

    
    routingActionAddSendPortByName(portName:string){
        return new Promise((resolve)=>{
            this.wcmidiinWs.routingActionAddSendPortByName(this.portNumber, this.chainId, portName, (arg:any)=>{
                resolve(arg);
            })
        })  
    }

    routingActionAddSendPortByNumber(portNumberOut:number){
        return new Promise((resolve)=>{
            this.wcmidiinWs.routingActionAddSendPortByNumber(this.portNumber, this.chainId, portNumberOut, (arg:any)=>{
                resolve(arg);
            })
        })  
    }

    routingActionAddLogData(logto:LOG_TO){
        return new Promise((resolve)=>{
            this.wcmidiinWs.routingActionAddLogData(this.portNumber, this.chainId, logto, (arg:any)=>{
                resolve(arg);
            })
        })          
    }

}


class _MidiInPort{
    private portNumber:number;
    private wcmidiinWs:any;

    routingMidiChains:RoutingMidiChain[] = [];

    constructor(wcmidioutWs:any, portNumber:number){
        this.portNumber = portNumber;
        this.wcmidiinWs = wcmidioutWs;
    }

    isPortOpen():Promise<boolean>{
        return new Promise((resolve)=>{
            this.wcmidiinWs.isPortOpen( this.portNumber, (arg:boolean)=>{
                resolve(arg);
            })
        })      
    }

    ignoreTypes(midiSysex = true, midiTime = true,  midiSense = true){
        return new Promise((resolve)=>{
            this.wcmidiinWs.ignoreTypes(this.portNumber, midiSysex, midiTime, midiSense, (arg:any)=>{
                resolve(arg);
            })
        })  
    }

    routingMidiChainsReset(){
        return new Promise((resolve)=>{
            this.wcmidiinWs.routingMidiChainsReset(this.portNumber, (arg:any)=>{
                this.routingMidiChains.length = 0;
                resolve(arg);                
            })
        })          
    }

    routingMidiChainsAaddChain():Promise<RoutingMidiChain>{
        return new Promise((resolve)=>{
            this.wcmidiinWs.routingMidiChainsAaddChain(this.portNumber, (chainId:number)=>{
                let rmc = new RoutingMidiChain(this.wcmidiinWs,this.portNumber, chainId);
                this.routingMidiChains.push(rmc)
                resolve(rmc);                
            })
        })          
    }
}

export class WcMidiIn{
    private wcmidiinWs:any;
    private _cashedOpenedPorts:{ key: number; value: string; }[];

    constructor (wcmidiout:any){
        this.wcmidiinWs = wcmidiout;
    }

    open(){
        //connect to the changed signal of a property
        this.wcmidiinWs.msgToClient.connect( (str:string)=> {
            this._msgToClient(str);
        }); 
        this.wcmidiinWs.dataToClient.connect( (str:string)=> {
            this._dataToClient(str);
        });         
    }
        
    private _msgToClient(str:string){
        console.log("from server:" + str)
    }  
    
    //This should be overload by logic
    private _dataToClient(str:string){
        console.log(str)
    }  

    sendMsg (msg:string){
        this.wcmidiinWs.msgToServer(msg);
    }   
    
    getPortCount():Promise<number>{
        return new Promise((resolve)=>{
            this.wcmidiinWs.getPortCount( (arg:number)=>{
                resolve(arg);
            })
        })
    }

    getPortName(i:number):Promise<string>{
        return new Promise((resolve)=>{
            this.wcmidiinWs.getPortName( i, (arg:string)=>{
                resolve(arg);
            })
        })        
    }

    getPortNumber(s:string):Promise<number>{
        return new Promise((resolve)=>{
            this.wcmidiinWs.getPortNumber( s, (arg:number)=>{
                resolve(arg);
            })
        })   
    }

    openPort(  portNumber:number){
        return new Promise((resolve)=>{
            this.wcmidiinWs.openPort( portNumber, ()=>{
                resolve();
            })
        })         
    }

    getPorts():Promise<{ key: number; value: string; }[]>{
        return new Promise((resolve)=>{
            this.wcmidiinWs.getPorts( (arg:any)=>{
                resolve(arg);
            })
        })     
    }

    getOpenedPorts():Promise<{ key: number; value: string; }[]>{
        return new Promise((resolve)=>{
            this.wcmidiinWs.getOpenedPorts( (arg:any)=>{
                this._cashedOpenedPorts = arg;
                resolve(arg);
            })
        })     
    }



    openVirtualPort( portName:string){
        return new Promise((resolve)=>{
            this.wcmidiinWs.openVirtualPort( portName, (arg:any)=>{
                resolve();
            })
        })           
    }

    async port(n:number){
        if (this._isPortCashed(n)){
                return new _MidiInPort(this.wcmidiinWs, n);
        }

        await this.getOpenedPorts();
        if (this._isPortCashed(n)){
            return new _MidiInPort(this.wcmidiinWs,n);
        }
        await this.openPort(n);
        await this.getOpenedPorts(); 
        return new _MidiInPort(this.wcmidiinWs, n);       
    }

    private _isPortCashed(n:number):boolean{
        if (this._cashedOpenedPorts){
            if ( Object.keys(this._cashedOpenedPorts).indexOf(n.toString()) > -1){
                return true;
            }
        }
        return false;
    }

    

}