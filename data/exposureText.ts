// Textos da sessão de exposição (modelo de aprendizagem inibitória: testar uma
// previsão em vez de esperar que a ansiedade desça), nas 10 línguas.

import type { Lang } from '../i18n/i18n';

export const CHECKIN_EVERY_SEC = 120;
export const PROB_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

type T = {
  sBefore: string; sDuring: string; sAfter: string;
  predictTitle: string; predictHint: string; fearQ: string; fearPh: string; probQ: string;
  howQ: string; modeNow: string; modeNowDesc: string; modeLog: string; modeLogDesc: string;
  next: string; start: string; timerHint: string; checkQ: string; checkSaved: string; finish: string; curve: string;
  happenedQ: string; yes: string; partly: string; no: string; probAfterQ: string; learnedQ: string; learnedPh: string;
  save: string; resultTitle: string; predicted: string; nowProb: string; happened: string; doneBody: string; backToLadder: string;
  min: string; fear: string; learned: string; duration: string;
  tabSteps: string; tabGuide: string; ready: string; add: string; reorderHint: string;
};

const TXT: Record<Lang, T> = {
  pt: {
    sBefore: 'Antes', sDuring: 'Durante', sAfter: 'Depois',
    predictTitle: 'A tua previsão', predictHint: 'O objetivo não é esperar que a ansiedade baixe — é pôr à prova o que o medo diz que vai acontecer.',
    fearQ: 'O que temes que aconteça?', fearPh: 'Ex.: "Vou vomitar", "não vou aguentar"…', probQ: 'Quão provável te parece?',
    howQ: 'Como queres fazer?', modeNow: 'Estou a fazer agora', modeNowDesc: 'Temporizador e uma pergunta rápida a cada 2 minutos', modeLog: 'Já fiz', modeLogDesc: 'Só registar o que aconteceu',
    next: 'Continuar', start: 'Começar', timerHint: 'Fica na situação e repara no que acontece. Não precisas de esperar que o desconforto desça.', checkQ: 'Como está o desconforto agora?', checkSaved: 'Registado', finish: 'Terminei', curve: 'Desconforto ao longo da sessão',
    happenedQ: 'Aconteceu o que temias?', yes: 'Sim', partly: 'Em parte', no: 'Não', probAfterQ: 'E agora, quão provável te parece?', learnedQ: 'O que aprendi', learnedPh: 'Ex.: "Senti enjoo e passou", "consegui ficar até ao fim"…',
    save: 'Guardar sessão', resultTitle: 'Previsão vs. realidade', predicted: 'Antes', nowProb: 'Agora', happened: 'Aconteceu?', doneBody: 'Cada vez que pões uma previsão à prova, o cérebro aprende algo novo — mesmo quando o desconforto não baixa.', backToLadder: 'Voltar aos degraus',
    min: 'min', fear: 'Previsão', learned: 'Aprendi', tabSteps: "Degraus", tabGuide: "Guia", ready: "Escada pronta", add: "Adicionar", reorderHint: "Usa as setas para mudar a ordem.", duration: 'Duração',
  },
  'pt-BR': {
    sBefore: 'Antes', sDuring: 'Durante', sAfter: 'Depois',
    predictTitle: 'Sua previsão', predictHint: 'O objetivo não é esperar a ansiedade baixar — é testar o que o medo diz que vai acontecer.',
    fearQ: 'O que você teme que aconteça?', fearPh: 'Ex.: "Vou vomitar", "não vou aguentar"…', probQ: 'Quão provável parece?',
    howQ: 'Como você quer fazer?', modeNow: 'Estou fazendo agora', modeNowDesc: 'Cronômetro e uma pergunta rápida a cada 2 minutos', modeLog: 'Já fiz', modeLogDesc: 'Só registrar o que aconteceu',
    next: 'Continuar', start: 'Começar', timerHint: 'Fique na situação e repare no que acontece. Não precisa esperar o desconforto baixar.', checkQ: 'Como está o desconforto agora?', checkSaved: 'Registrado', finish: 'Terminei', curve: 'Desconforto ao longo da sessão',
    happenedQ: 'Aconteceu o que você temia?', yes: 'Sim', partly: 'Em parte', no: 'Não', probAfterQ: 'E agora, quão provável parece?', learnedQ: 'O que aprendi', learnedPh: 'Ex.: "Senti enjoo e passou", "consegui ficar até o fim"…',
    save: 'Salvar sessão', resultTitle: 'Previsão vs. realidade', predicted: 'Antes', nowProb: 'Agora', happened: 'Aconteceu?', doneBody: 'Cada vez que você testa uma previsão, o cérebro aprende algo novo — mesmo quando o desconforto não baixa.', backToLadder: 'Voltar aos degraus',
    min: 'min', fear: 'Previsão', learned: 'Aprendi', tabSteps: "Degraus", tabGuide: "Guia", ready: "Escada pronta", add: "Adicionar", reorderHint: "Use as setas para mudar a ordem.", duration: 'Duração',
  },
  en: {
    sBefore: 'Before', sDuring: 'During', sAfter: 'After',
    predictTitle: 'Your prediction', predictHint: "The goal isn't to wait for anxiety to drop — it's to test what the fear says will happen.",
    fearQ: 'What do you fear will happen?', fearPh: 'E.g. "I\'ll throw up", "I won\'t cope"…', probQ: 'How likely does it feel?',
    howQ: 'How do you want to do it?', modeNow: "I'm doing it now", modeNowDesc: 'Timer and a quick question every 2 minutes', modeLog: 'Already done', modeLogDesc: 'Just log what happened',
    next: 'Continue', start: 'Start', timerHint: "Stay in the situation and notice what happens. You don't need to wait for the discomfort to drop.", checkQ: 'How is the discomfort right now?', checkSaved: 'Logged', finish: "I'm done", curve: 'Discomfort during the session',
    happenedQ: 'Did what you feared happen?', yes: 'Yes', partly: 'Partly', no: 'No', probAfterQ: 'And now, how likely does it feel?', learnedQ: 'What I learned', learnedPh: 'E.g. "I felt sick and it passed", "I managed to stay to the end"…',
    save: 'Save session', resultTitle: 'Prediction vs. reality', predicted: 'Before', nowProb: 'Now', happened: 'Did it happen?', doneBody: 'Every time you test a prediction, your brain learns something new — even when the discomfort doesn\'t drop.', backToLadder: 'Back to the steps',
    min: 'min', fear: 'Prediction', learned: 'Learned', tabSteps: "Steps", tabGuide: "Guide", ready: "Ready-made", add: "Add", reorderHint: "Use the arrows to change the order.", duration: 'Duration',
  },
  es: {
    sBefore: 'Antes', sDuring: 'Durante', sAfter: 'Después',
    predictTitle: 'Tu predicción', predictHint: 'El objetivo no es esperar a que baje la ansiedad, sino poner a prueba lo que el miedo dice que va a pasar.',
    fearQ: '¿Qué temes que pase?', fearPh: 'Ej.: "Voy a vomitar", "no lo voy a aguantar"…', probQ: '¿Qué tan probable te parece?',
    howQ: '¿Cómo quieres hacerlo?', modeNow: 'Lo estoy haciendo ahora', modeNowDesc: 'Temporizador y una pregunta rápida cada 2 minutos', modeLog: 'Ya lo hice', modeLogDesc: 'Solo registrar lo que pasó',
    next: 'Continuar', start: 'Empezar', timerHint: 'Quédate en la situación y fíjate en lo que pasa. No hace falta esperar a que baje el malestar.', checkQ: '¿Cómo está el malestar ahora?', checkSaved: 'Registrado', finish: 'He terminado', curve: 'Malestar durante la sesión',
    happenedQ: '¿Pasó lo que temías?', yes: 'Sí', partly: 'En parte', no: 'No', probAfterQ: 'Y ahora, ¿qué tan probable te parece?', learnedQ: 'Lo que aprendí', learnedPh: 'Ej.: "Sentí náuseas y se pasaron", "pude quedarme hasta el final"…',
    save: 'Guardar sesión', resultTitle: 'Predicción vs. realidad', predicted: 'Antes', nowProb: 'Ahora', happened: '¿Pasó?', doneBody: 'Cada vez que pones a prueba una predicción, el cerebro aprende algo nuevo, aunque el malestar no baje.', backToLadder: 'Volver a los pasos',
    min: 'min', fear: 'Predicción', learned: 'Aprendí', tabSteps: "Pasos", tabGuide: "Guía", ready: "Escalera lista", add: "Añadir", reorderHint: "Usa las flechas para cambiar el orden.", duration: 'Duración',
  },
  fr: {
    sBefore: 'Avant', sDuring: 'Pendant', sAfter: 'Après',
    predictTitle: 'Ta prédiction', predictHint: "Le but n'est pas d'attendre que l'anxiété baisse, mais de mettre à l'épreuve ce que la peur annonce.",
    fearQ: "Qu'est-ce que tu crains qu'il arrive ?", fearPh: 'Ex. : « Je vais vomir », « je ne vais pas tenir »…', probQ: 'À quel point cela te semble probable ?',
    howQ: 'Comment veux-tu faire ?', modeNow: 'Je le fais maintenant', modeNowDesc: 'Minuteur et une petite question toutes les 2 minutes', modeLog: 'Déjà fait', modeLogDesc: 'Juste noter ce qui s\'est passé',
    next: 'Continuer', start: 'Commencer', timerHint: "Reste dans la situation et observe ce qui se passe. Pas besoin d'attendre que l'inconfort baisse.", checkQ: "Où en est l'inconfort maintenant ?", checkSaved: 'Noté', finish: "J'ai fini", curve: 'Inconfort pendant la séance',
    happenedQ: 'Ce que tu craignais est-il arrivé ?', yes: 'Oui', partly: 'En partie', no: 'Non', probAfterQ: 'Et maintenant, à quel point cela te semble probable ?', learnedQ: "Ce que j'ai appris", learnedPh: 'Ex. : « J\'ai eu la nausée et c\'est passé », « j\'ai pu rester jusqu\'au bout »…',
    save: 'Enregistrer la séance', resultTitle: 'Prédiction vs réalité', predicted: 'Avant', nowProb: 'Maintenant', happened: 'Arrivé ?', doneBody: "Chaque fois que tu mets une prédiction à l'épreuve, le cerveau apprend quelque chose de nouveau — même si l'inconfort ne baisse pas.", backToLadder: 'Retour aux étapes',
    min: 'min', fear: 'Prédiction', learned: 'Appris', tabSteps: "Étapes", tabGuide: "Guide", ready: "Échelle prête", add: "Ajouter", reorderHint: "Utilise les flèches pour changer l'ordre.", duration: 'Durée',
  },
  de: {
    sBefore: 'Vorher', sDuring: 'Währenddessen', sAfter: 'Nachher',
    predictTitle: 'Deine Vorhersage', predictHint: 'Es geht nicht darum, zu warten, bis die Angst sinkt – sondern zu prüfen, was die Angst vorhersagt.',
    fearQ: 'Was befürchtest du?', fearPh: 'Z. B. „Ich muss mich übergeben", „ich halte das nicht aus"…', probQ: 'Wie wahrscheinlich fühlt es sich an?',
    howQ: 'Wie möchtest du vorgehen?', modeNow: 'Ich mache es jetzt', modeNowDesc: 'Timer und alle 2 Minuten eine kurze Frage', modeLog: 'Schon gemacht', modeLogDesc: 'Nur eintragen, was passiert ist',
    next: 'Weiter', start: 'Starten', timerHint: 'Bleib in der Situation und achte darauf, was passiert. Du musst nicht warten, bis das Unbehagen sinkt.', checkQ: 'Wie stark ist das Unbehagen gerade?', checkSaved: 'Eingetragen', finish: 'Fertig', curve: 'Unbehagen während der Übung',
    happenedQ: 'Ist eingetreten, was du befürchtet hast?', yes: 'Ja', partly: 'Teilweise', no: 'Nein', probAfterQ: 'Und jetzt – wie wahrscheinlich fühlt es sich an?', learnedQ: 'Was ich gelernt habe', learnedPh: 'Z. B. „Mir war übel und es ging vorbei", „ich bin bis zum Ende geblieben"…',
    save: 'Übung speichern', resultTitle: 'Vorhersage vs. Realität', predicted: 'Vorher', nowProb: 'Jetzt', happened: 'Eingetreten?', doneBody: 'Jedes Mal, wenn du eine Vorhersage prüfst, lernt dein Gehirn etwas Neues – auch wenn das Unbehagen nicht sinkt.', backToLadder: 'Zurück zu den Schritten',
    min: 'Min.', fear: 'Vorhersage', learned: 'Gelernt', tabSteps: "Schritte", tabGuide: "Leitfaden", ready: "Vorlage", add: "Hinzufügen", reorderHint: "Ändere die Reihenfolge mit den Pfeilen.", duration: 'Dauer',
  },
  it: {
    sBefore: 'Prima', sDuring: 'Durante', sAfter: 'Dopo',
    predictTitle: 'La tua previsione', predictHint: "L'obiettivo non è aspettare che l'ansia scenda, ma mettere alla prova ciò che la paura dice che succederà.",
    fearQ: 'Cosa temi che succeda?', fearPh: 'Es.: "Vomiterò", "non ce la farò"…', probQ: 'Quanto ti sembra probabile?',
    howQ: 'Come vuoi farlo?', modeNow: 'Lo sto facendo ora', modeNowDesc: 'Timer e una domanda veloce ogni 2 minuti', modeLog: "L'ho già fatto", modeLogDesc: 'Solo registrare cosa è successo',
    next: 'Continua', start: 'Inizia', timerHint: 'Resta nella situazione e nota cosa succede. Non serve aspettare che il disagio scenda.', checkQ: "Com'è il disagio adesso?", checkSaved: 'Registrato', finish: 'Ho finito', curve: 'Disagio durante la sessione',
    happenedQ: 'È successo ciò che temevi?', yes: 'Sì', partly: 'In parte', no: 'No', probAfterQ: 'E adesso, quanto ti sembra probabile?', learnedQ: 'Cosa ho imparato', learnedPh: 'Es.: "Ho sentito nausea ed è passata", "ce l\'ho fatta a restare fino alla fine"…',
    save: 'Salva sessione', resultTitle: 'Previsione vs realtà', predicted: 'Prima', nowProb: 'Ora', happened: 'Successo?', doneBody: 'Ogni volta che metti alla prova una previsione, il cervello impara qualcosa di nuovo, anche quando il disagio non scende.', backToLadder: 'Torna ai passi',
    min: 'min', fear: 'Previsione', learned: 'Imparato', tabSteps: "Passi", tabGuide: "Guida", ready: "Scala pronta", add: "Aggiungi", reorderHint: "Usa le frecce per cambiare l'ordine.", duration: 'Durata',
  },
  nl: {
    sBefore: 'Vooraf', sDuring: 'Tijdens', sAfter: 'Daarna',
    predictTitle: 'Je voorspelling', predictHint: 'Het doel is niet wachten tot de angst zakt – maar testen wat de angst zegt dat er gebeurt.',
    fearQ: 'Wat vrees je dat er gebeurt?', fearPh: 'Bijv. "Ik ga overgeven", "ik hou het niet vol"…', probQ: 'Hoe waarschijnlijk voelt het?',
    howQ: 'Hoe wil je het doen?', modeNow: 'Ik doe het nu', modeNowDesc: 'Timer en elke 2 minuten een korte vraag', modeLog: 'Al gedaan', modeLogDesc: 'Alleen noteren wat er gebeurde',
    next: 'Verder', start: 'Starten', timerHint: 'Blijf in de situatie en merk op wat er gebeurt. Je hoeft niet te wachten tot het ongemak zakt.', checkQ: 'Hoe is het ongemak nu?', checkSaved: 'Genoteerd', finish: 'Klaar', curve: 'Ongemak tijdens de sessie',
    happenedQ: 'Gebeurde wat je vreesde?', yes: 'Ja', partly: 'Deels', no: 'Nee', probAfterQ: 'En nu, hoe waarschijnlijk voelt het?', learnedQ: 'Wat ik leerde', learnedPh: 'Bijv. "Ik was misselijk en het ging over", "ik bleef tot het einde"…',
    save: 'Sessie opslaan', resultTitle: 'Voorspelling vs. werkelijkheid', predicted: 'Vooraf', nowProb: 'Nu', happened: 'Gebeurd?', doneBody: 'Elke keer dat je een voorspelling test, leren je hersenen iets nieuws – ook als het ongemak niet zakt.', backToLadder: 'Terug naar de stappen',
    min: 'min', fear: 'Voorspelling', learned: 'Geleerd', tabSteps: "Stappen", tabGuide: "Uitleg", ready: "Kant-en-klaar", add: "Toevoegen", reorderHint: "Gebruik de pijlen om de volgorde te wijzigen.", duration: 'Duur',
  },
  pl: {
    sBefore: 'Przed', sDuring: 'W trakcie', sAfter: 'Po',
    predictTitle: 'Twoja prognoza', predictHint: 'Celem nie jest czekanie, aż lęk opadnie — tylko sprawdzenie, co według lęku ma się wydarzyć.',
    fearQ: 'Czego się obawiasz?', fearPh: 'Np. „Zwymiotuję", „nie wytrzymam"…', probQ: 'Jak bardzo wydaje się to prawdopodobne?',
    howQ: 'Jak chcesz to zrobić?', modeNow: 'Robię to teraz', modeNowDesc: 'Minutnik i krótkie pytanie co 2 minuty', modeLog: 'Już zrobione', modeLogDesc: 'Tylko zapisać, co się wydarzyło',
    next: 'Dalej', start: 'Start', timerHint: 'Zostań w sytuacji i obserwuj, co się dzieje. Nie trzeba czekać, aż dyskomfort spadnie.', checkQ: 'Jaki jest teraz dyskomfort?', checkSaved: 'Zapisano', finish: 'Kończę', curve: 'Dyskomfort w trakcie sesji',
    happenedQ: 'Czy obawa się spełniła?', yes: 'Tak', partly: 'Częściowo', no: 'Nie', probAfterQ: 'A teraz — jak bardzo wydaje się to prawdopodobne?', learnedQ: 'Mój wniosek', learnedPh: 'Np. „Były mdłości i minęły", „udało się zostać do końca"…',
    save: 'Zapisz sesję', resultTitle: 'Prognoza a rzeczywistość', predicted: 'Przed', nowProb: 'Teraz', happened: 'Spełniło się?', doneBody: 'Za każdym razem, gdy sprawdzasz prognozę, mózg uczy się czegoś nowego — nawet gdy dyskomfort nie spada.', backToLadder: 'Wróć do kroków',
    min: 'min', fear: 'Prognoza', learned: 'Wniosek', tabSteps: "Kroki", tabGuide: "Przewodnik", ready: "Gotowa drabina", add: "Dodaj", reorderHint: "Zmieniaj kolejność strzałkami.", duration: 'Czas',
  },
  ru: {
    sBefore: 'До', sDuring: 'Во время', sAfter: 'После',
    predictTitle: 'Твой прогноз', predictHint: 'Цель — не ждать, пока тревога спадёт, а проверить, что, по словам страха, должно случиться.',
    fearQ: 'Чего ты опасаешься?', fearPh: 'Напр.: «Меня вырвет», «я не выдержу»…', probQ: 'Насколько это кажется вероятным?',
    howQ: 'Как хочешь это сделать?', modeNow: 'Делаю сейчас', modeNowDesc: 'Таймер и короткий вопрос каждые 2 минуты', modeLog: 'Уже сделано', modeLogDesc: 'Просто записать, что произошло',
    next: 'Дальше', start: 'Начать', timerHint: 'Оставайся в ситуации и замечай, что происходит. Не нужно ждать, пока дискомфорт снизится.', checkQ: 'Какой сейчас дискомфорт?', checkSaved: 'Записано', finish: 'Завершить', curve: 'Дискомфорт во время сессии',
    happenedQ: 'Опасение сбылось?', yes: 'Да', partly: 'Частично', no: 'Нет', probAfterQ: 'А теперь — насколько это кажется вероятным?', learnedQ: 'Мой вывод', learnedPh: 'Напр.: «Подташнивало, и это прошло», «получилось остаться до конца»…',
    save: 'Сохранить сессию', resultTitle: 'Прогноз и реальность', predicted: 'До', nowProb: 'Сейчас', happened: 'Сбылось?', doneBody: 'Каждый раз, когда ты проверяешь прогноз, мозг узнаёт что-то новое — даже если дискомфорт не снижается.', backToLadder: 'Назад к шагам',
    min: 'мин', fear: 'Прогноз', learned: 'Вывод', tabSteps: "Шаги", tabGuide: "Справка", ready: "Готовая лестница", add: "Добавить", reorderHint: "Меняй порядок стрелками.", duration: 'Длительность',
  },
};

export function exposureText(lang: Lang): T {
  return TXT[lang] ?? TXT.en;
}
export const EXPOSURE_TEXT_LANGS = Object.keys(TXT) as Lang[];
