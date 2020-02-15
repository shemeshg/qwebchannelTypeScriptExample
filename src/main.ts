import { sayHello } from './greet';
import {QWebChannel} from 'qwebchannel'
import {WcMidiOut} from './WcMidiOut'


function showHello(divName: string, name: string) {
    const elt = document.getElementById(divName);
    elt.innerText = sayHello(name);
    

}

showHello('greeting', 'TypeScript');




class Channel{
    private wsUri:string;
    private socket:WebSocket;
    private channel:QWebChannel;
    
    wcmidiout:WcMidiOut;
    
    constructor (ipAddress:string = "localhost", port:number = 12345){
        this.wsUri  = `ws://${ipAddress}:${port}`;
    }

    open(){
        this.socket = new WebSocket(this.wsUri);
        this.socket.onclose = ()=> {
            return this._onclose();
        };
        this.socket.onerror = (error) =>{
            return this._onerror(error);
        };
        
        this.socket.onopen = ()=>{
            this._onopen();
        }         
    }

 

    private _onopen(){
        this.channel  = new QWebChannel(this.socket, (channel:any) => { 
            this.wcmidiout = new WcMidiOut(this.channel.objects.wcmidiout);
            this.wcmidiout.open();
        })
    }


    private _onclose(){
        console.error("web channel closed");
    }

    private _onerror(error:any){
        console.error("web channel error: " + error);
    }

}

var _window:any;
_window = window;
_window.g = new Channel();
