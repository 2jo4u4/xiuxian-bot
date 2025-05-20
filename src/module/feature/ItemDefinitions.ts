// filepath: src/module/feature/ItemDefinitions.ts

export type ItemType = "consumable" | "equipment" | "artifact" | "material";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ItemDefinition {
  id: string; // 唯一ID
  name: string; // 顯示名稱
  type: ItemType;
  rarity: Rarity;
  description?: string;
  slot?: "weapon" | "armor" | "ring" | "necklace" | string; // 裝備部位，消耗品/素材可省略
}

export const ItemList: ItemDefinition[] = [
  // 道具/消耗品
  {
    id: "elixir_qi",
    name: "回氣丹",
    type: "consumable",
    rarity: "common",
    description: "恢復少量靈力的丹藥。",
  },
  {
    id: "elixir_heal",
    name: "小還丹",
    type: "consumable",
    rarity: "uncommon",
    description: "恢復生命與靈力的丹藥。",
  },
  {
    id: "spirit_stone",
    name: "靈石",
    type: "material",
    rarity: "common",
    description: "修煉與交易的通用貨幣。",
  },
  {
    id: "talisman_break",
    name: "破障符",
    type: "consumable",
    rarity: "rare",
    description: "可破除部分結界。",
  },
  {
    id: "talisman_tp",
    name: "傳送符",
    type: "consumable",
    rarity: "rare",
    description: "可瞬間移動至指定地點。",
  },
  {
    id: "spirit_wood",
    name: "靈木",
    type: "material",
    rarity: "uncommon",
    description: "蘊含靈氣的木材。",
  },

  // 裝備
  {
    id: "sword_qingfeng",
    name: "青鋒劍",
    type: "equipment",
    rarity: "uncommon",
    slot: "weapon",
    description: "銳利的青鋒長劍。",
  },
  {
    id: "blade_lieyan",
    name: "烈焰刀",
    type: "equipment",
    rarity: "rare",
    slot: "weapon",
    description: "灼熱的火焰長刀。",
  },
  {
    id: "armor_ling",
    name: "靈甲",
    type: "equipment",
    rarity: "uncommon",
    slot: "armor",
    description: "可護身的輕甲。",
  },
  {
    id: "shield_xuantie",
    name: "玄鐵盾",
    type: "equipment",
    rarity: "rare",
    slot: "armor",
    description: "堅固的玄鐵盾。",
  },
  {
    id: "necklace_yupei",
    name: "玉佩",
    type: "equipment",
    rarity: "common",
    slot: "necklace",
    description: "精緻的玉佩。",
  },
  {
    id: "ring_ling",
    name: "靈戒",
    type: "equipment",
    rarity: "uncommon",
    slot: "ring",
    description: "蘊含靈力的戒指。",
  },

  // 法寶
  {
    id: "artifact_hulu",
    name: "紫電葫蘆",
    type: "artifact",
    rarity: "epic",
    slot: "weapon",
    description: "可收納雷電的神奇葫蘆。",
  },
  {
    id: "artifact_bag",
    name: "乾坤袋",
    type: "artifact",
    rarity: "epic",
    slot: "backpack",
    description: "可收納萬物的法寶。",
  },
  {
    id: "artifact_flying_sword",
    name: "飛劍",
    type: "artifact",
    rarity: "rare",
    slot: "weapon",
    description: "可御劍飛行的法寶。",
  },
  {
    id: "artifact_pearl",
    name: "聚靈珠",
    type: "artifact",
    rarity: "rare",
    slot: "necklace",
    description: "可聚集靈氣的珠子。",
  },
];

// 名稱與ID對照表（簡易別名查詢）
export const ItemAlias: Record<string, string> = {
  回氣丹: "elixir_qi",
  小還丹: "elixir_heal",
  靈石: "spirit_stone",
  破障符: "talisman_break",
  傳送符: "talisman_tp",
  靈木: "spirit_wood",
  青鋒劍: "sword_qingfeng",
  烈焰刀: "blade_lieyan",
  靈甲: "armor_ling",
  玄鐵盾: "shield_xuantie",
  玉佩: "necklace_yupei",
  靈戒: "ring_ling",
  紫電葫蘆: "artifact_hulu",
  乾坤袋: "artifact_bag",
  飛劍: "artifact_flying_sword",
  聚靈珠: "artifact_pearl",
};

// 依名稱或ID查找物品
export function getItemByNameOrId(
  nameOrId: string
): ItemDefinition | undefined {
  const id = ItemAlias[nameOrId] ?? nameOrId;
  return getItemById(id);
}

export function getItemById(id: string): ItemDefinition | undefined {
  return ItemList.find((item) => item.id === id);
}
