import express, { type Request, type Response } from "express";
import http from "http";
import path from "path";
import { Server, type Socket } from "socket.io";
import { PlayerService } from "./services/player";
import { type Player } from "./classes/player";
import "reflect-metadata";
import Container from "typedi";
import { type PlayerResponse } from "./types";

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
  const playerService = Container.get<PlayerService>(PlayerService);
  // 참가자 본인 입장(소켓 연결)
  socket.on("enter", (player: Player, callback) => {
    const result: boolean = playerService.validateNickName(player.nickname);
    callback(result);

    // 닉네임 검증
    if (result) {
      // 성공한 경우에만 플레이어 추가
      const response: PlayerResponse = playerService.addPlayer(player, socket.id);
      sendWithoutMe(socket, "enter", response.myInfo);
      sendToMe(socket, "game-start", response);
    }
  });
});

/**
 * 자신에게만 보내줌
 * @date 3/7/2024 - 1:24:32 PM
 * @author 양소영
 *
 * @param {Socket} socket
 * @param {string} event
 * @param {*} data
 */
const sendToMe = (socket: Socket, event: string, data: any): void => {
  io.to(socket.id).emit(event, data);
};

/**
 * 본인 제외한 사람들에게 데이터를 전달함
 * @date 3/7/2024 - 1:21:55 PM
 * @author 양소영
 *
 * @param {Socket} socket
 * @param {string} event
 * @param {*} data
 */
const sendWithoutMe = (socket: Socket, event: string, data: any): void => {
  socket.broadcast.emit(event, data);
};

httpServer.listen(port, () => {
  console.log(`${endpoint}:${port}`);
});

export const viteNodeApp = app;
