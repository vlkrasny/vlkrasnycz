export const TOPICS = [
  ['si', 'Soustava SI a převody jednotek', 'Základ, na kterém fyzika stojí.', 'm · kg · s', '↔'],
  ['vektory', 'Skalární a vektorové veličiny', 'Směr, velikost a skládání vektorů.', 'a⃗ + b⃗ = c⃗', '↗'],
  ['kinematika', 'Kinematika', 'Popiš pohyb v prostoru a čase.', 'v = s / t', '➝'],
  ['dynamika', 'Dynamika', 'Objev souvislost mezi silou a pohybem.', 'F = m · a', '⚖'],
  ['energie', 'Mechanická práce a energie', 'Práce, výkon a zákony zachování.', 'Eₖ = ½ m · v²', 'ϟ'],
  ['gravitace', 'Gravitační pole', 'Přitažlivost, volný pád a tíha.', 'F = G · m₁m₂ / r²', '◎'],
  ['tuhe_teleso', 'Mechanika tuhého tělesa', 'Rovnováha, moment síly a otáčení.', 'M = F · r', '⚙'],
  ['tekutiny', 'Mechanika tekutin', 'Tlak, vztlak a proudění.', 'p = ρ · g · h', '≈'],
];
export const LEVELS = {zakladni:'Základní', stredni:'Střední', tezke:'Těžká'};
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const topicName = id => TOPICS.find(t => t[0] === id)?.[1] ?? id;
export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i=copy.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}
export function makeQuiz(questions, count) {
  if (![4,5,6].includes(count) || questions.length < count) throw new Error('Pro sadu není dostatek otázek.');
  return shuffle(questions).slice(0,count).map(q=>({...q, options:shuffle([q.correct_answer,q.wrong_answer_1,q.wrong_answer_2,q.wrong_answer_3])}));
}
export function stats(attempts) {
  const total=attempts.reduce((n,a)=>n+a.max_score,0), correct=attempts.reduce((n,a)=>n+a.score,0);
  return {total,correct,percent:total ? Math.round(correct/total*100) : null};
}
