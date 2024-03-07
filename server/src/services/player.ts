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
}
