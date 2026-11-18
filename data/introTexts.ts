// Textos de introdução dos exercícios, mostrados no "i" junto ao título (em vez
// de um parágrafo no ecrã). As traduções já existem (procuradas pelo texto em
// inglês via tr2).

import { Lang, tr2 } from '../i18n/i18n';

const INTROS: Record<string, { pt: string; en: string }> = {
  thought: {
    pt: 'O medo costuma mentir: exagera o perigo e a probabilidade. Aqui pões o pensamento à prova, passo a passo — nomeias a armadilha, pesas as provas e escreves uma versão mais realista.',
    en: 'Fear tends to lie: it exaggerates danger and likelihood. Here you put the thought on trial, step by step — name the trap, weigh the evidence, and write a more realistic version.',
  },
  experiments: {
    pt: 'Uma experiência comportamental é como um mini-teste à fobia: antes de fazeres algo que evitas, escreves o que achas que vai acontecer. Depois comparas com o que aconteceu mesmo. Quase sempre a catástrofe prevista não acontece — e é esse contraste que reescreve o medo.',
    en: 'A behavioural experiment is a mini-test of the phobia: before doing something you avoid, you write down what you think will happen. Then you compare it with what actually happened. Almost always the predicted catastrophe does not happen — and that contrast is what rewrites the fear.',
  },
  challenges: {
    pt: 'Pequenos passos para treinar a tolerância à incerteza e ao desconforto. A ideia não é gostar — é deixar entrar e perceber que a incerteza não magoa.',
    en: 'Small steps to train tolerance of uncertainty and discomfort. The idea is not to like it — it is to let it in and see that uncertainty does not hurt.',
  },
  memory: {
    pt: 'Esta secção ajuda-te a trabalhar uma memória difícil ligada ao medo (por exemplo, uma virose em criança). Vais seguir com os olhos uma luz que se move de um lado para o outro, enquanto deixas a memória estar presente ao de leve. Muitas pessoas sentem que, aos poucos, a memória perde intensidade.',
    en: 'This section helps you work on a difficult memory linked to the fear (for example, a childhood stomach bug). You will follow a light moving side to side with your eyes, while letting the memory be lightly present. Many people find that, little by little, the memory loses intensity.',
  },
  urgesurf: {
    pt: 'Quando dá vontade de fazer um comportamento de segurança — verificar, perguntar, lavar, evitar — essa vontade é como uma onda: sobe, atinge um pico e desce sozinha, se não lhe obedeceres.\n\nAqui não lutas contra o impulso nem o cumpres. Só o observas enquanto passa. Cada vez que o fazes, o cérebro aprende que não precisava dele.',
    en: 'When you feel the urge to do a safety behaviour — check, ask, wash, avoid — that urge is like a wave: it rises, peaks and falls on its own, if you do not obey it.\n\nHere you neither fight the urge nor carry it out. You just observe it as it passes. Each time you do, the brain learns it did not need it.',
  },
};

export function introText(key: string, lang: Lang): string | undefined {
  const o = INTROS[key];
  return o ? tr2(lang, o.pt, o.en) : undefined;
}
