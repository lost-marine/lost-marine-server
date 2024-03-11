import express, { type Request, type Response } from "express";
import http from "http";
import path from "path";
import { Server, type Socket } from "socket.io";
import { PlayerService } from "./services/player";
import { type Player } from "./classes/player";
import "reflect-metadata";
import Container from "typedi";
import {
  type PlayerCrashRequest,
  type GameStartData,
  type ValidateRespone,
  type PlayerResponse,
  type PlanktonEatResponse
} from "./types";
import { PlanktonService } from "./services/plankton";
import { type Plankton } from "./classes/plankton";

const dirname = path.resolve();
const port: number = 3200; // 소켓 서버 포트
const endpoint: string = "localhost";
const app = express();
const roomId: string = "room0";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

const httpServer = http.createServer(app);
const playerService = Container.get<PlayerService>(PlayerService);

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

// 플레이어 위치 싱크
setInterval(() => {
  sendToAll("others-position-sync", playerService.getPlayerList());
}, 20000);

io.on("connection", (socket: Socket) => {
  Container.set("width", 2688);
  Container.set("height", 1536);
  Container.set("planktonCnt", 50);
  const planktonManager = Container.get<PlanktonService>(PlanktonService);

  if (global.playerList?.size === 0) {
    planktonManager.initPlankton();
  }

  // 참가자 본인 입장(소켓 연결)
  socket.on("enter", (player: Player, callback) => {
    const isSuccess: boolean = playerService.validateNickName(player.nickname);
    const msg: string = "닉네임 검증 결과 " + (isSuccess ? "성공" : "실패") + "입니다.";
    const response: ValidateRespone = {
      isSuccess,
      msg
    };
    callback(response);

    // 닉네임 검증
    if (isSuccess) {
      // 성공한 경우에만 플레이어 추가
      void socket.join(roomId);
      console.log("룸에 들어오게 처리함");
      const response: PlayerResponse = playerService.addPlayer(player, socket.id);
      const planktonList: Plankton[] = [...global.planktonList.values()];
      sendWithoutMe(socket, "enter", response.myInfo);
      sendToMe(socket.id, "game-start", { ...response, planktonList } satisfies GameStartData);
    }
  });

  // game start

  // 플레이어 본인 위치 전송
  socket.on("my-position-sync", (data: Player) => {
    const result = playerService.updatePlayerInfo(data);
    // 다른 플레이어에게 변경사항 알려줌
    sendWithoutMe(socket, "others-position-sync", result);
  });

  // 플레이어 본인 퇴장
  socket.on("quit", (playerId: number) => {
    playerService.deletePlayerByPlayerId(playerId);
    sendWithoutMe(socket, "quit", playerId);
  });

  // 새로고침이나 창닫음으로 연결이 끊기는 경우
  socket.on("disconnect", () => {
    const result = playerService.deletePlayerBySocketId(socket.id);
    sendWithoutMe(socket, "quit", result);
  });

  // 플랑크톤 섭취 이벤트
  socket.on("plankton-eat", (data: { playerId: number; planktonId: number }, callback) => {
    const result: PlanktonEatResponse = planktonManager.eatedPlankton(data.planktonId, data.playerId);

    callback(result);

    if (result.isSuccess) {
      sendWithoutMe(socket, "plankton-delete", data.planktonId);
    }

    if (planktonManager.eatedPlanktonCnt > 2) {
      // respone을 위한 플랑크톤 개수 조절이 필요합니다.
      sendToAll("plankton-respawn", planktonManager.spawnPlankton());
    }
  });

  // 플레이어 간 공격
  socket.on("player-crash", (data: PlayerCrashRequest, callback) => {
    const validateResponse: ValidateRespone = playerService.isCrashValidate(data);
    callback(validateResponse);

    // 충돌 검증이 성공적인 경우만 공격 시도
    if (validateResponse.isSuccess) {
      const result: Player[] = playerService.attackPlayer(data);

      // 플레이어 상태 정보 수정
      result.forEach((player) => {
        sendToMe(player.socketId, "player-status-sync", player);
        if (player.isGameOver) {
          sendToMe(player.socketId, "game-over", player);
          sendWithoutMe(socket, "quit", player);
          playerService.deletePlayerByPlayerId(player.playerId);
        }
      });
    }
  });
});

/**
 * 전체 사용자에게 데이터를 전달함
 * @date 3/7/2024 - 1:48:07 PM
 * @author 양소영
 *
 * @param {Socket} socket
 * @param {string} event
 * @param {*} data
 */
const sendToAll = (event: string, data: any): void => {
  io.to(roomId).emit(event, data);
};

/**
 * 자신에게만 보내줌
 * @date 3/7/2024 - 1:24:32 PM
 * @author 양소영
 *
 * @param {Socket} socket
 * @param {string} event
 * @param {*} data
 */
const sendToMe = (socketId: string, event: string, data: any): void => {
  io.to(socketId).emit(event, data);
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
  socket.to(roomId).except(socket.id).emit(event, data);
};

httpServer.listen(port, () => {
  console.log(`${endpoint}:${port}`);
});

export const viteNodeApp = app;
