import asyncio
import datetime
import random
import websockets
import serial
import io

ser = serial.Serial(
port='/dev/ttyACM0',\
baudrate=9600,\
timeout=0.1)

#sio = io.TextIOWrapper(io.BufferedRWPair(ser, ser))
 
print("connected to: " + ser.portstr)

async def time(websocket, path):
    while True:
        x=ser.readline().decode('utf-8')
        if(x):
            print(x)
            await websocket.send(x)
            await asyncio.sleep(random.random() * 3)
        
async def main():
    async with websockets.serve(time, "0.0.0.0", 5678):
        await asyncio.Future()  # run forever
asyncio.run(main())