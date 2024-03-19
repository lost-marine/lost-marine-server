import "reflect-metadata";
import Container, { Service } from "typedi";
import { Player } from "@/classes/player";
import {
  type PlayerCrashRequest,
  type ValidateRespone,
  type PlayerResponse,
  type PlayerAttackResponse,
  type plyaerGameOverResponse,
  type Species
} from "@/types";
import { MapService } from "./map";
// import { type Position } from "@/classes/position";
import { type Area } from "@/classes/area";
import { createBuilder } from "@/util/builder";
// import { SPECIES_ASSET, TIER_ASSET } from "@/constants/asset";
import { validateCanCrushArea } from "@/util/crushValid";
import { isAttacking } from "@/util/attack";
import { evolutionHandler } from "@/util/evolutionHandler";
import { SPECIES_ASSET } from "@/constants/asset";

@Service()
export class PlayerService {
  count: number;

  constructor() {
    this.count = 0;
    global.playerList = new Map();
  }

  /**
   * 플레이어 초기화
   * @date 3/6/2024 - 11:30:22 AM
   *
   * @param {Player} player
   * @param {string} socketId
   * @returns {PlayerResponse}
   */
  initPlayer(player: Player, socketId: string): Player {
    const mapService = Container.get<MapService>(MapService);
    const spawnArea: Area = mapService.getSpawnableArea(0);
    const nickname = player.nickname;
    const speciesInfo: Species | undefined = SPECIES_ASSET.get(player.speciesId);
    if (speciesInfo === undefined) throw new Error("Invalid Player Infomation");
    const myInfo: Player = createBuilder(Player)
      .setPlayerId(this.count++)
      .setNickname(nickname)
      .setCenterX(spawnArea.centerX)
      .setCenterY(spawnArea.centerY)
      .setSocketId(socketId)
      .setSpeciesId(player.speciesId)
      .setWidth(speciesInfo.width)
      .setHeight(speciesInfo.height)
      .build();
    console.log(myInfo);
    return myInfo;
  }

  /**
   * 닉네임 검증 로직
   * @date 3/6/2024 - 5:52:27 PM
   *
   * @param {string} nickname
   * @returns {boolean}
   */
  validateNickName(nickname: string): ValidateRespone {
    const regexp: RegExp = /^[ㄱ-ㅎㅏ-ㅣ가-힣A-Za-z0-9]{2,12}$/;
    let isSuccess: boolean = regexp.test(nickname);
    let msg: string = "닉네임 검증 결과 " + (isSuccess ? "성공" : "실패") + "입니다.";
    // 닉네임 중복 검사
    if (isSuccess) {
      global.playerList?.forEach((player) => {
        if (player?.nickname === nickname) {
          isSuccess = false;
          msg = "중복된 아이디입니다.";
        }
      });
    }

    const response: ValidateRespone = {
      isSuccess,
      msg
    };

    return response;
  }

  /**
   * 진화 가능한지 아닌지 확인합니다.
   * 각각의 rule을 돌며 모든 검증이 완료된 경우에만, isSuccess: true를 반환합니다.
   * @date 3/13/2024 - 3:40:15 PM
   * @author 박연서
   *
   * @param {number} targetSpeciesId
   * @param {Player} player
   * @returns {ValidateRespone}
   */
  validateEvolution(targetSpeciesId: number, player: Player): ValidateRespone {
    for (const rule of evolutionHandler.rules) {
      if (!rule.match(targetSpeciesId, player)) {
        return rule.action(targetSpeciesId, player);
      }
    }
    return {
      isSuccess: true,
      msg: "진화가 가능합니다."
    };
  }

  playerEvolution(targetSpeciesId: number, player: Player): void {
    const targetSpecies: Species | undefined = SPECIES_ASSET.get(targetSpeciesId);
    if (targetSpecies !== undefined) {
      player.evolutePlayer(targetSpecies);
    }
  }

  /**
   * playerList를 배열로 변환하여 반환해줌
   * @date 3/6/2024 - 4:53:52 PM
   *
   * @returns {Player[]}
   */
  getPlayerList(): Player[] {
    const valuesArray = Array.from(global.playerList?.values() as Iterable<Player>);
    return Array.from(valuesArray);
  }

  /**
   * 플레이어 추가
   * @date 3/6/2024 - 4:54:22 PM
   *
   * @param {Player} player
   * @param {string} socketId
   * @returns {PlayerResponse}
   */
  addPlayer(player: Player, socketId: string): PlayerResponse {
    const myInfo = this.initPlayer(player, socketId);
    global.playerList?.set(myInfo.playerId, myInfo);
    const playerList = this.getPlayerList();

    const result: PlayerResponse = {
      myInfo,
      playerList
    };
    return result;
  }

  /**
   * 플레이어 정보 업데이트(위치, 상태)
   * @date 3/7/2024 - 11:02:47 AM
   *
   * @param {Player} player
   * @returns {Player[]}
   */
  updatePlayerInfo(player: Player): Player[] {
    const playerId = player.playerId;
    // 플레이어 존재하는 경우에만
    if (global.playerList.has(playerId) === true) {
      const item: Player = global.playerList?.get(playerId);
      item?.updatePlayerInfo(player);
      global.playerList?.set(playerId, item);
    }

    return this.getPlayerList();
  }

  /** Description placeholder
   * TODO: 성공 가능 여부 유효성 검증 필요
   * @date 3/8/2024 - 10:51:45 AM
   * @author 양소영
   *
   * @param {PlayerCrashRequest} data
   */
  isCrashValidate(request: PlayerCrashRequest): void {
    // 플레이어 두 명이 playerList에 존재하는지 검증
    if (
      request === undefined ||
      global.playerList.get(request.playerAId) === undefined ||
      global.playerList.get(request.playerBId) === undefined
    ) {
      throw new Error("ATTACK_PLAYER_NO_EXIST_ERROR");
    }
    // 플레이어 두 명이 충돌 가능 영역에 있는지 검증
    const firstPlayer: Player = global.playerList.get(request.playerAId);
    const secondPlayer: Player = global.playerList.get(request.playerBId);
    if (!validateCanCrushArea(firstPlayer.playerToArea(), secondPlayer.playerToArea())) {
      throw new Error("ATTACK_PLAYER_NO_COLLISION_AREA");
    }
  }

  /**
   * 플레이어 간 공격 처리
   * TODO: 두 명의 플레이어 중 누가 공격을 했는지 검증 필요
   * @date 3/8/2024 - 11:20:37 AM
   * @author 양소영
   *
   * @param {PlayerCrashRequest} data
   * @returns {Player[]}
   */
  attackPlayer(request: PlayerCrashRequest): PlayerAttackResponse[] {
    const playerA: Player = global.playerList.get(request.playerAId);
    const playerB: Player = global.playerList.get(request.playerBId);

    const areaA: Area = playerA.playerToArea();
    const areaB: Area = playerB.playerToArea();

    if (isAttacking(areaA, areaB)) {
      console.log(playerA);
      console.log("공격!!");
      playerA.updateAttackerInfo();
      playerB.updateDefenderInfo(playerA);
    }
    const attacker: PlayerAttackResponse = {
      playerId: playerA.playerId,
      health: playerA.health,
      point: playerA.point,
      centerX: playerA.centerX,
      centerY: playerA.centerY,
      isGameOver: playerA.isGameOver,
      socketId: playerA.socketId
    };

    const defender: PlayerAttackResponse = {
      playerId: playerB.playerId,
      health: playerB.health,
      point: playerB.point,
      centerX: playerB.centerX,
      centerY: playerB.centerY,
      isGameOver: playerB.isGameOver,
      socketId: playerB.socketId
    };

    return [attacker, defender];
  }

  /**
   * 게임 오버인 경우의 반환값 생성
   * @date 3/13/2024 - 3:28:46 PM
   * @author 양소영
   *
   * @param {PlayerAttackResponse} player
   * @returns {plyaerGameOverResponse}
   */
  getGameOver(player: PlayerAttackResponse): plyaerGameOverResponse {
    const gameoverPlayer: Player = global.playerList.get(player.playerId);

    const response: plyaerGameOverResponse = {
      playerId: gameoverPlayer.playerId,
      planktonCount: gameoverPlayer.planktonCount,
      microplasticCount: gameoverPlayer.microplasticCount,
      playerCount: gameoverPlayer.playerCount,
      point: gameoverPlayer.point
    };

    return response;
  }

  /**
   * 플랑크톤 먹은 경우 먹은 갯수 갱신
   * @date 3/8/2024 - 9:33:23 AM
   * @author 양소영
   *
   * @param {number} playerId
   * @param {number} planktonId
   */
  eatPlankton(playerId: number): Player {
    const player: Player = global.playerList?.get(playerId);

    if (player !== undefined) {
      player.planktonCount++;
    }
    return player;
  }

  /**
   * 플레이어 아이디로 삭제
   * @date 3/7/2024 - 9:13:23 AM
   *
   * @param {number} playerId
   */
  deletePlayerByPlayerId(playerId: number): void {
    global.playerList?.delete(playerId);
  }

  /**
   * 소켓 아이디로 삭제
   * @date 3/7/2024 - 9:14:10 AM
   *
   * @param {string} socketId
   * @returns {number}
   */
  deletePlayerBySocketId(socketId: string): number {
    let playerId: number = 0;

    global.playerList?.forEach((player, key) => {
      if (player?.socketId === socketId) {
        playerId = key;
        global.playerList?.delete(key);
      }
    });
    return playerId;
  }
}
