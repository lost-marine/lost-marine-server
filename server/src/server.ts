import express, { type Request, type Response } from "express";
import http from "http";
import path from "path";
import { Server, type Socket } from "socket.io";

const dirname = path.resolve();
const port: number = Number(3200); // 소켓 서버 포트
const endpoint: string = "localhost";
const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  },
  pingInterval: 1000,
  pingTimeout: 5000
});

app.get("/", (req: Request, res: Response) => {
  const fullPath: string = path.join(dirname, "/src/index.html");
  res.sendFile(fullPath);
});

io.on("connection", (socket: Socket) => {
  // 참가자 본인 입장(소켓 연결)
  socket.on("enter", (data: string, callback) => {
    console.log("소켓 연결 테스트");
    const msg: string = "소켓 연결 성공";
    sendWithoutMe(socket, "enter", msg);
    callback(msg);
  });
});

// 본인 제외한 사람에게 전송
const sendWithoutMe = (socket: Socket, event: string, data: any): void => {
  socket.broadcast.emit(event, data);
};

httpServer.listen(port, () => {
  console.log(`${endpoint}:${port}`);
});

export const viteNodeApp = app;
