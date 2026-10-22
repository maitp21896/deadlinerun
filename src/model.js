export const defaults = () => ({ coins: 30, xp: 0, completed: 0, tasks: [], tickets: [], rewards: [
 { id: 'film', icon: '🎬', name: 'Một tập phim nhỏ', detail: 'Xem phim 15 phút', weight: 4 },
 { id: 'snack', icon: '🍪', name: 'Snack time!', detail: 'Một món ăn vặt yêu thích', weight: 3 },
 { id: 'game', icon: '🎮', name: 'Chơi một chút', detail: 'Chơi game 20 phút', weight: 2 },
 { id: 'chill', icon: '☁️', name: 'Nghỉ thật chill', detail: 'Thả lỏng 10 phút', weight: 4 }
] });
export function completeTask(state,id) { const task=state.tasks.find(t=>t.id===id); if(!task || task.done) return false; task.done=true; state.coins+=20; state.xp+=30; state.completed++; return true; }
export function pickReward(rewards,random=Math.random){ const total=rewards.reduce((sum,r)=>sum+r.weight,0); let n=random()*total; return rewards.find(r=>(n-=r.weight)<0)||rewards.at(-1); }
