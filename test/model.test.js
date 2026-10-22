import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,completeTask,pickReward} from '../src/model.js';
test('completion credits coins and XP exactly once',()=>{const s=defaults();s.tasks.push({id:'task',done:false});assert.equal(completeTask(s,'task'),true);assert.equal(s.coins,50);assert.equal(s.xp,30);assert.equal(s.completed,1);assert.equal(completeTask(s,'task'),false);assert.equal(completeTask(s,'missing'),false);assert.equal(s.coins,50);});
test('weighted draw reaches each prize at its interval and never returns blank',()=>{const rewards=defaults().rewards;let start=0;const total=rewards.reduce((sum,r)=>sum+r.weight,0);for(const reward of rewards){assert.equal(pickReward(rewards,()=> (start+.1)/total).id,reward.id);start+=reward.weight;}assert.equal(pickReward(rewards,()=>.999999).id,rewards.at(-1).id);});
