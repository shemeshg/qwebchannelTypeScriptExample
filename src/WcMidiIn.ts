



class _MidiInPort{
    private portNumber:number;
    private wcmidiinWs:any;

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