// 定義一個選項的介面
interface GameOption {
  id: string; // 選項的唯一識別符，例如 "option1_1"
  text: string; // 顯示給玩家的選項文字
  nextSceneId?: string | null; // 選擇此選項後將跳轉到的下一個場景ID
  outcomeText: string; // 選擇此選項後的簡短結果描述
}

// 定義一個遊戲場景的介面
interface GameScene {
  id: string; // 場景的唯一識別符，例如 "scene_cave_discovery"
  title: string; // 場景標題
  description: string; // 場景的主要描述文字
  options: GameOption[]; // 該場景提供的選項列表
  isStartingScene?: boolean; // 是否為起始場景
  isEndingScene?: boolean; // 是否為結局場景
}

// 定義整個遊戲故事的介面 (所有場景的集合)
interface GameStory {
  [sceneId: string]: GameScene; // 以場景ID為鍵，儲存所有場景
}

// 定義遊戲狀態的介面 (可選，用於追蹤玩家進度或屬性)
interface GameState {
  currentSceneId: string; // 當前所在的場景ID
  playerStats?: {
    // 玩家屬性，可根據遊戲需求擴充
    strength: number;
    intelligence: number;
    reputation: number;
    // ... 其他屬性
  };
  inventory?: string[]; // 玩家物品清單，可儲存獲得的寶物ID
  flags?: {
    // 標記，用於追蹤某些事件是否發生
    hasNineTurnsSkill?: boolean;
    hasSpiritDeerCompanion?: boolean;
    // ... 其他標記
  };
}

// 故事引擎：管理故事進度與互動
export class StoryEngine {
  private story: GameStory;
  private state: GameState;

  constructor(story: GameStory, initialState?: Partial<GameState>) {
    this.story = story;
    // 初始化狀態
    const startSceneId =
      initialState?.currentSceneId ??
      Object.keys(story).find((key) => story[key].isStartingScene) ??
      Object.keys(story)[0];

    this.state = {
      currentSceneId: startSceneId,
      playerStats: initialState?.playerStats || {
        strength: 0,
        intelligence: 0,
        reputation: 0,
      },
      inventory: initialState?.inventory || [],
      flags: initialState?.flags || {},
    };
  }

  // 取得目前場景
  getCurrentScene(): GameScene {
    return this.story[this.state.currentSceneId];
  }

  // 取得目前狀態
  getState(): GameState {
    return this.state;
  }

  // 選擇一個選項，推進劇情，回傳 outcomeText
  chooseOption(optionId: string): string | undefined {
    const scene = this.getCurrentScene();
    const option = scene.options.find((opt) => opt.id === optionId);
    if (!option) return undefined;
    // 處理結果描述
    const outcome = option.outcomeText;
    // 推進場景
    if (option.nextSceneId && this.story[option.nextSceneId]) {
      this.state.currentSceneId = option.nextSceneId;
    } else {
      // 沒有 nextSceneId 代表遊戲結束或特殊結局
      this.state.currentSceneId = scene.id; // 保持在當前場景
    }
    return outcome;
  }

  // 是否已到結局（無可選選項或所有選項都無 nextSceneId）
  isEnd(): boolean {
    return this.getCurrentScene().isEndingScene ?? false;
  }
}

export type { GameStory };
