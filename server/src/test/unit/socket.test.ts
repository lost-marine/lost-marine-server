import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as clientSock } from "socket.io-client";
import { Server, type Socket } from "socket.io";
import { describe, expect, test } from "@jest/globals";
import { createBuilder } from "@/util/builder";
import { Player } from "@/classes/player";
import { PlayerService } from "@/services/player";
import Container from "typedi";
import { PlanktonService } from "@/services/plankton";
import { PLANKTON_SPAWN_LIST } from "@/constants/spawnList";
import { type PlayerResponse, type ValidateRespone } from "@/types";

let io: Server, serverSocket: Socket, clientSocket: clientSock;
let tester: Player;
let planktonManager: PlanktonService;
let playerService: PlayerService;
// 테스트가 시작되기 전에 수행됩니다.
beforeAll((done) => {
  const httpServer = createServer();
  Container.set("width", 2688);
  Container.set("height", 1536);
  Container.set("planktonCnt", Math.floor(PLANKTON_SPAWN_LIST.length / 2));
  planktonManager = Container.get<PlanktonService>(PlanktonService);
  playerService = Container.get<PlayerService>(PlayerService);
  tester = createBuilder(Player).setCenterX(0).setCenterY(0).setNickname("rhemeddj").setPoint(5000).setSpeciesId(1).build();
  io = new Server(httpServer);
  httpServer.listen(() => {
    const port: number = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
    io.on("connection", (socket: Socket) => {
      serverSocket = socket;
    });
    clientSocket.on("connect", done);
  });
});

// 모든 테스트가 완료된 후 수행됩니다.
afterAll(() => {
  io.close();
  clientSocket.disconnect();
});

const onceSocketConnected: jest.Mock<Promise<unknown>, [socket: Socket | clientSock, event: string], unknown> = jest.fn(
  async (socket, event) => {
    return await new Promise((resolve) => {
      socket.once(event, (data: unknown) => {
        resolve(data);
      });
    });
  }
);

describe("socket test", () => {
  test.only("init-game-screen", () => {
    const planktonInitializer: jest.SpyInstance = jest.spyOn(planktonManager, "initPlankton");
    planktonManager.initPlankton();
    expect(planktonInitializer).toHaveBeenCalled();
    expect(planktonInitializer).toHaveBeenCalledTimes(1);
    expect(planktonInitializer.mock.results.values[0]).toBeUndefined();
  });

  test.only("nickname-validate", async () => {
    clientSocket.emit("nickname-validate", tester, (res: any) => {
      console.log(res);
    });
    await onceSocketConnected(serverSocket, "nickname-validate").then((r: Player) => {
      const nicknameValidator: jest.SpyInstance = jest.spyOn(playerService, "validateNickName");
      playerService.validateNickName(tester.nickname);
      expect(nicknameValidator).toBeCalledWith(tester.nickname);
      expect(nicknameValidator).toBeCalledTimes(1);
      expect(nicknameValidator).toHaveReturned();
      expect(nicknameValidator.mock.results[0]?.value.isSuccess).toBeFalsy();
      jest.clearAllMocks();
    });
  });

  test.only("player-enter", async () => {
    clientSocket.emit("player-enter", undefined, (res: any) => {
      console.log(res);
    });
    await onceSocketConnected(serverSocket, "player-enter").then((inputData: Player) => {
      let validResponse: ValidateRespone;
      let gameStartReq: PlayerResponse | undefined;

      try {
        if (inputData === null) {
          console.log("throw error");
          throw new Error("Invalid Player");
        }
        if (playerService.validateNickName(inputData.nickname).isSuccess) {
          void serverSocket.join("room00");
          gameStartReq = playerService.addPlayer(inputData, serverSocket.id);
        } else {
          throw new Error("잘못된 닉네임입니다.");
        }
        validResponse = {
          isSuccess: true,
          msg: "플레이어가 입장에 성공하였습니다!"
        };
      } catch (error: unknown) {
        validResponse = {
          isSuccess: false,
          msg: error instanceof Error ? error.message : "알 수 없는 이유로 실패하였습니다."
        };
      }

      expect(validResponse.isSuccess).toBeFalsy();
      expect(gameStartReq).toBeUndefined();
    });
  });

  test.only("player-evolution-valid", () => {
    const evolutionHandler: jest.SpyInstance = jest.spyOn(playerService, "validateEvolution");
    playerService.validateEvolution(7, tester);
    expect(evolutionHandler).toBeCalledWith(7, tester);
    expect(evolutionHandler).toBeCalledTimes(1);
    expect(evolutionHandler).toHaveReturned();
  });
});
