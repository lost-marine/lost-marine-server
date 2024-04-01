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
  type Species,
  type EvolveRequest,
  type NicknameRequest,
  type PlayerAttackResponse,
  type itemRequest,
  type itemSyncResponse,
  type AttackedPlayerResponse
} from "./types";
import { PlanktonService } from "./services/plankton";
import { type Plankton } from "./classes/plankton";
import { PLANKTON_SPAWN_LIST } from "./constants/spawnList";
import { SPECIES_ASSET } from "./constants/asset";
import { getErrorMessage, getSuccessMessage } from "./message/message-handler";
import { typeEnsure, recordEnsure } from "@/util/assert";
import g from "@/types/global";
import { error } from "console";
import { getPlayer, setPlayer, zADDPlayer, zREMPlayer, getTenRanker } from "./repository/redis";
import { logger } from "@/util/winston";
import _ from "lodash";

const dirname = path.resolve();
const port: number = 3200; // 소켓 서버 포트
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
// async function updatePlayerPositions(): Promise<void> {
//   const playerList = await playerService.getPlayerList();
//   sendToAll("others-position-sync", playerList);
// }

// 최초 실행 후 2초마다 updatePlayerPositions 함수를 호출
// setInterval(() => {
//   updatePlayerPositions().catch((error) => {
//     console.error(error);
//   });
// }, 300);

Container.set("planktonCnt", Math.floor(PLANKTON_SPAWN_LIST.length / 8));
const planktonManager = Container.get<PlanktonService>(PlanktonService);

io.on("connection", (socket: Socket) => {
  if (playerService.count === 0) {
    planktonManager.initPlankton();
  }

  // 닉네임 확인
  socket.on("nickname-validate", async (nickname: NicknameRequest, callback) => {
    let validateResponse: ValidateRespone = {
      isSuccess: true,
      msg: getSuccessMessage("NICKNAME_VALIDATE_SUCCESS")
    };
    try {
      const result = await playerService.validateNickName(typeEnsure(nickname, "INVALID_INPUT"));

      validateResponse = result;
    } catch (error) {
      validateResponse.isSuccess = false;
      validateResponse.msg = getErrorMessage(error);
    }
    callback(validateResponse);
  });

  // 참가자 본인 입장(소켓 연결)
  socket.on("player-enter", async (player: Player, callback) => {
    const validResponse: ValidateRespone = {
      isSuccess: true,
      msg: getSuccessMessage("PLAYER_ENTER_SUCCESS")
    };
    const result = await playerService.validateNickName(typeEnsure(player, "INVALID_INPUT"));
    if (result.isSuccess) {
      void socket.join(roomId);
      const addResult = await playerService.addPlayer(player, socket.id);
      const gameStartReq: PlayerResponse | null = addResult;
      if (gameStartReq !== null) {
        const planktonList: Plankton[] = Array.from(g.planktonList.values());
        logger.info("소켓 연결 성공 : " + JSON.stringify(addResult));
        await zADDPlayer(typeEnsure(addResult?.myInfo.playerId), 0);
        sendWithoutMe(socket, "player-enter", gameStartReq.myInfo);
        sendToMe(socket.id, "game-start", { ...gameStartReq, planktonList } satisfies GameStartData);
        sendToAll("ranking-receive", await getTenRanker());
      }
    } else {
      validResponse.isSuccess = false;
      validResponse.msg = getErrorMessage(error);
      callback(validResponse);
    }
  });
  // 진화요청(Client→ Server)
  socket.on("player-evolution", async (data: EvolveRequest, callback) => {
    let validateResponse: ValidateRespone = {
      isSuccess: true,
      msg: getSuccessMessage("PLAYER_EVOLVE_SUCCESS")
    };

    try {
      recordEnsure(data, "INVALID_INPUT");
      const beforeEvolvePlayer: Player = typeEnsure(await getPlayer(data.playerId), "CANNOT_FIND_PLAYER");
      validateResponse = playerService.validateEvolution(data.speciesId, beforeEvolvePlayer);
      if (validateResponse.isSuccess) {
        await playerService.playerEvolution(data.speciesId, beforeEvolvePlayer);
        await setPlayer(data.playerId, beforeEvolvePlayer);
        validateResponse.nowExp = beforeEvolvePlayer.nowExp;
        sendToAll("ranking-receive", await getTenRanker());
        sendWithoutMe(socket, "others-evolution-sync", { playerId: data.playerId, speciesId: data.speciesId });
      }
    } catch (error: unknown) {
      validateResponse.isSuccess = false;
      validateResponse.msg = getErrorMessage(error);
      logger.error(validateResponse.msg);
    } finally {
      callback(validateResponse);
    }
  });

  // throttle 처리
  const throttlePositionSync = _.throttle(sendWithoutMe, 30);
  // 플레이어 본인 위치 전송
  socket.on("my-position-sync", async (data: Player) => {
    try {
      const result = await playerService.updatePlayerInfo(data);

      // 다른 플레이어에게 변경사항 알려줌
      throttlePositionSync(socket, "others-position-sync", result);
    } catch (error) {
      // 플레이어가 존재하지 않는 경우 퇴장 요청 날림
      sendToAll("player-quit", data.playerId);
      logger.error("플레이어가 존재하지 않음 : " + error);
    }
  });

  // 플레이어 본인 퇴장
  socket.on("player-quit", async (playerId: number) => {
    try {
      await playerService.deletePlayerByPlayerId(typeEnsure(playerId));
      await zREMPlayer(playerId);
      sendToAll("ranking-receive", await getTenRanker());
      sendWithoutMe(socket, "player-quit", playerId);
    } catch (error) {
      // 플레이어 삭제에 실패하면 에러 메세지
      logger.error("플레이어 삭제 실패 : " + error);
    }
    // playerId가 올바른 input이 아니라면 어떻게 해야할지
    // 논의가 필요합니다.
  });

  // 새로고침이나 창닫음으로 연결이 끊기는 경우
  socket.on("disconnect", async () => {
    const result = await playerService.deletePlayerBySocketId(socket.id);

    if (result !== -1) {
      sendWithoutMe(socket, "player-quit", result);
    }
  });

  // 플랑크톤 섭취 이벤트
  socket.on("plankton-eat", async (data: { playerId: number; planktonId: number }, callback) => {
    // logger.info("플랑크톤 ID: " + data.planktonId + " 에 대한 섭취 시도");
    let result: PlanktonEatResponse = {
      isSuccess: true,
      planktonCount: 0,
      microplasticCount: 0,
      msg: getSuccessMessage("EAT_PLANKTON_SUCCESS")
    };
    try {
      recordEnsure(data, "INVALID_INPUT");
      const player: Player = typeEnsure(await getPlayer(data.playerId));
      result = await planktonManager.eatedPlankton(data.planktonId, data.playerId);
      if (result.isSuccess) {
        // logger.info("Player eat plankton");
        await zADDPlayer(data.playerId, player.totalExp + 1);
        sendToAll("ranking-receive", await getTenRanker());
      }
    } catch (error: unknown) {
      result.isSuccess = false;
      result.msg = getErrorMessage(error);
      logger.error("플랑크톤 섭취 실패!!!");
    } finally {
      callback(result);
      if (result.isSuccess) {
        sendWithoutMe(socket, "plankton-delete", data.planktonId);
      }
      if (planktonManager.eatedPlanktonCnt > 3) {
        // respone을 위한 플랑크톤 개수 조절이 필요합니다.
        sendToAll("plankton-respawn", await planktonManager.spawnPlankton());
      }
    }
  });

  // 플레이어 간 공격
  socket.on("player-crash", async (data: PlayerCrashRequest) => {
    const validateResponse: ValidateRespone = {
      isSuccess: true,
      msg: getSuccessMessage("COLLISION_VALIDATE_SUCCESS")
    };
    // 요청이 왔는데 플레이어가 존하지않으면 나갔다고 처리
    let isExist: boolean = true;
    if (data.playerAId === undefined) {
      isExist = false;
      sendWithoutMe(socket, "player-quit", data.playerAId);
    }
    if (data.playerBId === undefined) {
      isExist = false;
      sendWithoutMe(socket, "player-quit", data.playerBId);
    }
    if (isExist) {
      try {
        await playerService.isCrashValidate(data);

        if (validateResponse.isSuccess) {
          const result = await playerService.attackPlayer(data);

          if (result !== undefined && result.length === 2) {
            await attackPlayer(result);
          }

          // 반대의 경우
          const reverseResult = await playerService.attackPlayer({ playerAId: data.playerBId, playerBId: data.playerAId });

          if (reverseResult !== undefined && reverseResult.length === 2) {
            await attackPlayer(reverseResult);
          }
        }
      } catch (error) {
        logger.error("공격 시 에러" + error);

        validateResponse.isSuccess = false;
        validateResponse.msg = getErrorMessage(error);
      }
    }
  });

  socket.on("chat-message-send", async (data: ChatMessageSendResponse) => {
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
      const sender: Player = typeEnsure(await getPlayer(data.playerId), "CANNOT_FIND_PLAYER");
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
      // callback(response);
      if (response.isSuccess) {
        sendToAll("chat-message-receive", sendFormat);
      }
    }
  });

  socket.on("item-eat", async (request: itemRequest) => {
    try {
      const response = await playerService.eatItem(request);

      sendToMe(response.playerAttackResponse.socketId, "player-status-sync", response.playerAttackResponse);
      sendToAll("item-sync", response.itemSync);

      setItemSync(response.itemSync);
    } catch (error) {
      logger.error("item-eat 에러" + error);
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

httpServer.listen(port, () => {});

const attackPlayer = async (result: PlayerAttackResponse[]): Promise<void> => {
  const attackedPlayerResponse: AttackedPlayerResponse = {
    playerId: result[1].playerId,
    damage: result[0].power
  };

  sendToAll("player-crash", attackedPlayerResponse);
  // 플레이어 상태 정보 수정
  for (const player of result) {
    const mySocketId: string = player.socketId;
    const { socketId, power, ...playerResponse } = player;
    // 싱크 맞추는 부분에 대한 최적화 필요
    sendToMe(mySocketId, "player-status-sync", playerResponse);

    // 게임 오버인 경우
    if (player.isGameOver) {
      const gameOverResponse = await playerService.getGameOver(result);
      sendToMe(mySocketId, "game-over", gameOverResponse.playerGameOver);
      sendToAll("player-quit", player.playerId);
      sendToAll("system-log", gameOverResponse.killLog);

      // 공격자의 포인트 정보 갱신
      const playerAttackResponse: PlayerAttackResponse = gameOverResponse.playerAttackResponse;
      const { socketId, ...attackerResponse } = playerAttackResponse;
      sendToMe(playerAttackResponse.socketId, "player-status-sync", attackerResponse);
      await playerService.deletePlayerByPlayerId(player.playerId);
    }
    sendToAll("ranking-receive", await getTenRanker());
  }
};

const setItemSync = (item: itemSyncResponse): void => {
  setTimeout(() => {
    item.isActive = true;
    sendToAll("item-sync", item);
  }, 30000);
};

export const viteNodeApp = app;
