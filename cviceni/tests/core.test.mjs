import test from 'node:test';
import assert from 'node:assert/strict';
import {makeQuiz,stats,escapeHTML,TOPICS,LEVELS} from '../assets/core.js';
test('sada má 4–6 různých otázek a zachovává čtyři odpovědi',()=>{
 const source=Array.from({length:8},(_,i)=>({id:i,correct_answer:'a',wrong_answer_1:'b',wrong_answer_2:'c',wrong_answer_3:'d'}));
 for(const count of [4,5,6]){const quiz=makeQuiz(source,count);assert.equal(quiz.length,count);assert.equal(new Set(quiz.map(q=>q.id)).size,count);quiz.forEach(q=>assert.deepEqual([...q.options].sort(),['a','b','c','d']));}
 assert.throws(()=>makeQuiz(source.slice(0,3),4));assert.throws(()=>makeQuiz(source,7));assert.equal(source[0].options,undefined);
});
test('statistika váží jednotlivé odpovědi a rozlišuje prázdnou historii',()=>{assert.equal(stats([]).percent,null);assert.deepEqual(stats([{score:4,max_score:4},{score:0,max_score:6}]),{total:10,correct:4,percent:40});});
test('obsah databáze se escapuje a nabízí osm okruhů a tři úrovně',()=>{assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');assert.equal(TOPICS.length,8);assert.equal(Object.keys(LEVELS).length,3);});
