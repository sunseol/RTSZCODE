// 자원 시스템 — 팀별 gold/food 보유량 관리
export class ResourceSystem {
  constructor(initialPlayer = {}) {
    this.stores = {
      player: {
        gold: initialPlayer.gold ?? 200,
        food: initialPlayer.food ?? 100,
      },
      enemy: { gold: 9999, food: 9999 }, // 적 AI는 무제한 (간소화)
    };
    this.foodCap = { player: 50, enemy: 9999 };
  }

  get(team, type) {
    return this.stores[team][type];
  }

  canAfford(team, cost) {
    const s = this.stores[team];
    if (cost.gold && s.gold < cost.gold) return false;
    if (cost.food && s.food < cost.food) return false;
    return true;
  }

  spend(team, cost) {
    if (!this.canAfford(team, cost)) return false;
    if (cost.gold) this.stores[team].gold -= cost.gold;
    if (cost.food) this.stores[team].food -= cost.food;
    return true;
  }

  add(team, type, amount) {
    this.stores[team][type] += amount;
  }
}
