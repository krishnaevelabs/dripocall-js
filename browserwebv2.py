import asyncio
import datetime
import random
import websockets
import serial
import io
import serial.tools.list_ports

def ports():
        try:
            ports = list(serial.tools.list_ports.comports())
            if ports:
                for p in ports:
                    #print(p.vid,p.pid)                    
                    if p.vid == 4292 and p.pid == 60000 or p.vid == 1240 and p.pid==61336:
                        global vid, pid, device
                        vid = p.vid
                        pid = p.pid
                        device = p.device
                        print(vid ,device,pid)
                        break
                    else:
                        print("")
            else:
                    print("no active comports found")               
        except:
            print("No device connected")
ports()

ser = serial.Serial(device,9600, timeout=0.1) 
sio = io.TextIOWrapper(io.BufferedRWPair(ser, ser))

def serialRead():
    try:
        ##print("hh")
        hello = sio.readline()
        if hello:
            return(hello)
    except:
        print("Serial Error")
        





async def time(websocket, path):
    while True:
        try:
                val=serialRead()
                if(val):
                    print(val)
                    await websocket.send(val)
                    await asyncio.sleep(random.random() * 3)
        except Exception as e:
                print(e)
                        
async def main():
    async with websockets.serve(time, "0.0.0.0", 5678):
        await asyncio.Future()
asyncio.run(main())



# startServer=websockets.serve(time,'localhost',5678)
# asyncio.get_event_loop().run_until_complete(startServer)
# asyncio.get_event_loop().run_forever()
