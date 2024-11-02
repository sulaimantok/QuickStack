import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
//import { Server } from 'socket.io'

// redirects to default route "general" for the app
export async function GET(request: NextRequest, response: NextResponse) {
/*
  if (response.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      socket.on('input-change', msg => {
        socket.broadcast.emit('update-input', msg)
      })
    })
  }
  res.end()*/
    return redirect(`/project/app/overview?appId=${new URL(request.url).searchParams.get("appId")}`);
}