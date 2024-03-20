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
  type PlanktonEatResponse,
  type ChatMessageSendResponse,
  type ChatMessageReceiveRequest,
  type PlayerAttackResponse,
  type Species,
  type EvolveRequest,
  type NicknameRequest
} from "./types";
import { PlanktonService } from "./services/plankton";
import { type Plankton } from "./classes/plankton";
import { PLANKTON_SPAWN_LIST } from "./constants/spawnList";
import { SPECIES_ASSET } from "./constants/asset";
import { getErrorMessage, getSuccessMessage } from "./message/message-handler";
import { typeEnsure, recordEnsure } from "@/util/assert";
import g from "@/types/global";

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
}, 300);

Container.set("width", 2688);
Container.set("height", 1536);
Container.set("planktonCnt", Math.floor(PLANKTON_SPAWN_LIST.length / 2));

io.on("connection", (socket: Socket) => {
  const planktonManager = Container.get<PlanktonService>(PlanktonService);

  if (g.playerList?.size === 0) {
    planktonManager.initPlankton();
  }

  // 닉네임 확인
  socket.on("nickname-validate", (nickname: NicknameRequest, callback) => {
    let validateResponse: ValidateRespone = {
      isSuccess: true,
      msg: getSuccessMessage("NICKNAME_VALIDATE_SUCCESS")
    };
    try {
      validateResponse = playerService.validateNickName(typeEnsure(nickname, "INVALID_INPUT"));
    } catch (error: unknown) {
      validateResponse.isSuccess = false;
      validateResponse.msg = getErrorMessage(error);
    } finally {
      callback(validateResponse);
    }
  });

  // 참가자 본인 입장(소켓 연결)
  socket.on("player-enter", (player: Player, callback) => {
    const validResponse: ValidateRespone = {
      isSuccess: true,
      msg: getSuccessMessage("PLAYER_ENTER_SUCCESS")
    };
    let gameStartReq: PlayerResponse = {
      myInfo: player,
      playerList: Array.from(g.playerList.values())
    };

    try {
      if (playerService.validateNickName(typeEnsure(player, "INVALID_INPUT")).isSuccess) {
        void socket.join(roomId);
        gameStartReq = playerService.addPlayer(player, socket.id);
      } else {
        throw new Error("INVALID_INPUT");
      }
    } catch (error: unknown) {
      validResponse.isSuccess = false;
      validResponse.msg = getErrorMessage(error);
    } finally {
      callback(validResponse);

      if (validResponse.isSuccess) {
        const planktonList: Plankton[] = Array.from(g.planktonList.values());
        sendWithoutMe(socket, "player-enter", gameStartReq.myInfo);
        sendToMe(socket.id, "game-start", { ...gameStartReq, planktonList } satisfies GameStartData);
      }
    }
  });
  // 진화요청(Client→ Server)
  socket.on("player-evolution", (data: EvolveRequest, callback) => {
    let validateResponse: ValidateRespone = {
      isSuccess: true,
      msg: getSuccessMessage("PLAYER_EVOLVE_SUCCESS")
    };

    try {
      recordEnsure(data, "INVALID_INPUT");
      const beforeEvolvePlayer: Player = typeEnsure(g.playerList.get(data.playerId), "CANNOT_FIND_PLAYER");
      validateResponse = playerService.validateEvolution(data.speciesId, beforeEvolvePlayer);
      if (validateResponse.isSuccess) {
        playerService.playerEvolution(data.speciesId, beforeEvolvePlayer);
        const { socketId, ...playerResponse } = beforeEvolvePlayer;
        g.playerList.set(data.playerId, beforeEvolvePlayer);
        sendToMe(beforeEvolvePlayer.socketId, "player-status-sync", playerResponse);
      }
    } catch (error: unknown) {
      validateResponse.isSuccess = false;
      validateResponse.msg = getErrorMessage(error);
    } finally {
      callback(validateResponse);
    }
  });

  // game start

  // 플레이어 본인 위치 전송
  socket.on("my-position-sync", (data: Player) => {
    try {
      const result = playerService.updatePlayerInfo(data);
      // 다른 플레이어에게 변경사항 알려줌
      sendWithoutMe(socket, "others-position-sync", result);
    } catch (error) {
      // TO-DO: 플레이어가 서버에서 관리하지 않은 미검증된 사용자의 요청인 경우
      // 처리 방법 상의가 필요합니다.
    }
  });

  // 플레이어 본인 퇴장
  socket.on("player-quit", (playerId: number) => {
    playerService.deletePlayerByPlayerId(typeEnsure(playerId));
    sendWithoutMe(socket, "player-quit", playerId);

    // playerId가 올바른 input이 아니라면 어떻게 해야할지
    // 논의가 필요합니다.
  });

  // 새로고침이나 창닫음으로 연결이 끊기는 경우
  socket.on("disconnect", () => {
    const result = playerService.deletePlayerBySocketId(socket.id);
    sendWithoutMe(socket, "player-quit", result);
  });

  // 플랑크톤 섭취 이벤트
  socket.on("plankton-eat", (data: { playerId: number; planktonId: number }, callback) => {
    let result: PlanktonEatResponse = {
      isSuccess: true,
      msg: getSuccessMessage("EAT_PLANKTON_SUCCESS")
    };
    try {
      recordEnsure(data, "INVALID_INPUT");
      result = planktonManager.eatedPlankton(data.planktonId, data.playerId);
    } catch (error: unknown) {
      result.isSuccess = false;
      result.msg = getErrorMessage(error);
    } finally {
      callback(result);
      if (result.isSuccess) {
        sendWithoutMe(socket, "plankton-delete", data.planktonId);
      }
      if (planktonManager.eatedPlanktonCnt > 2) {
        // respone을 위한 플랑크톤 개수 조절이 필요합니다.
        sendToAll("plankton-respawn", planktonManager.spawnPlankton());
      }
    }
  });

  // 플레이어 간 공격
  socket.on("player-crash", (data: PlayerCrashRequest, callback) => {
    const validateResponse: ValidateRespone = {
      isSuccess: true,
      msg: getSuccessMessage("COLLISION_VALIDATE_SUCCESS")
    };
    try {
      playerService.isCrashValidate(data);
    } catch (error: unknown) {
      console.log(error);
      validateResponse.isSuccess = false;
      validateResponse.msg = getErrorMessage(error);
    } finally {
      callback(validateResponse);
    }

    // 충돌 검증이 성공적인 경우만 공격 시도
    if (validateResponse.isSuccess) {
      const result: PlayerAttackResponse[] | undefined = playerService.attackPlayer(data);

      if (result !== undefined && result.length === 2) {
        // 플레이어 상태 정보 수정
        result.forEach((player) => {
          const mySocketId: string = player.socketId;
          const { socketId, ...playerResponse } = player;
          sendToMe(mySocketId, "player-status-sync", playerResponse);

          // 게임 오버인 경우
          if (player.isGameOver) {
            console.log("game-over");
            sendToMe(player.socketId, "game-over", playerService.getGameOver(result));
            sendWithoutMe(socket, "player-quit", player.playerId);
            playerService.deletePlayerByPlayerId(player.playerId);
          }
        });
      }
    }
  });

  socket.on("chat-message-send", (data: ChatMessageSendResponse, callback) => {
    const response: ValidateRespone = {
      isSuccess: false,
      msg: "유효하지 않은 플레이어입니다."
    };
    let sendFormat: ChatMessageReceiveRequest = {
      speciesname: "",
      playerId: -1,
      nickname: "",
      timeStamp: Date.now(),
      msg: ""
    };

    try {
      recordEnsure(data, "INVALID_INPUT");
      const sender: Player = typeEnsure(g.playerList.get(data.playerId), "CANNOT_FIND_PLAYER");
      const targetSpecies: Species = typeEnsure(SPECIES_ASSET.get(sender.speciesId), "CANNOT_FIND_TIER");

      response.isSuccess = true;
      response.msg = "채팅을 성공적으로 전달합니다.";

      sendFormat = {
        speciesname: targetSpecies.name,
        playerId: data.playerId,
        nickname: sender.nickname,
        timeStamp: Date.now(),
        msg: data.msg
      };
    } catch (error: unknown) {
      response.isSuccess = false;
      response.msg = getErrorMessage(error);
    } finally {
      callback(response);

      if (response.isSuccess) {
        sendToAll("chat-message-receive", sendFormat);
      }
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
