import {test} from 'node:test';
import assert from 'node:assert/strict';
import {battlePower} from '../src/battle.js';
test('real task completions improve battle power, with a bounded upgrade',()=>{
 assert.equal(battlePower(0),12);
 assert.equal(battlePower(1),14);
 assert.equal(battlePower(5),22);
 assert.equal(battlePower(20),52);
 assert.equal(battlePower(100),52);
 assert.equal(battlePower(-1),12);
});
