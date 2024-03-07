import "reflect-metadata";
import { Service } from "typedi";
import { Player } from "../classes/player";
import { type PlayerResponse } from "@/types";

@Service()
export class PlayerService {
  constructor() {
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
    const nickname = player.nickname;
    const count: number = global.playerList?.size + 1;
    const myInfo = new Player(count, nickname, 100, 200, socketId);

    return myInfo;
  }

  /**
   * 닉네임 검증 로직
   * @date 3/6/2024 - 5:52:27 PM
   *
   * @param {string} nickname
   * @returns {boolean}
   */
  validateNickName(nickname: string): boolean {
    const regexp: RegExp = /^[가-힣A-Za-z0-9]{2,12}$/;
    const result: boolean = regexp.test(nickname);
    return result;
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
    global.playerList?.set(player.playerId, player);
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
    const item: Player | undefined = global.playerList?.get(playerId);
    console.log(item);

    item?.updatePlayerInfo(player);
    global.playerList?.set(playerId, item);

    return this.getPlayerList();
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

    global.playerList?.forEach((value, key) => {
      if (value.socketId === socketId) {
        playerId = key;
        global.playerList?.delete(key);
      }
    });
    return playerId;
  }
}
