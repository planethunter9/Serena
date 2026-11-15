// Textos do tutorial de abertura (coach marks), nas 10 línguas da app.
// Linguagem neutra em género em todas as línguas.
//
// Cada passo tem um alvo (CoachTarget com o mesmo nome) ou nenhum: sem alvo,
// o balão aparece ao centro (boas-vindas e despedida).

import type { Lang } from '../i18n/i18n';

export type TutorialStepId =
  | 'welcome'
  | 'pillars'
  | 'home-plan'
  | 'header-actions'
  | 'support-now'
  | 'support-techniques'
  | 'calendar-card'
  | 'resources-list'
  | 'tabbar'
  | 'end';

type StepText = { title: string; text: string };
type UI = { skip: string; next: string; back: string; done: string; replay: string; replayDesc: string };
type Pack = { ui: UI; steps: Record<TutorialStepId, StepText> };

const PACKS: Record<Lang, Pack> = {
  pt: {
    ui: { skip: 'Saltar', next: 'Seguinte', back: 'Anterior', done: 'Começar', replay: 'Ver o tutorial outra vez', replayDesc: 'Uma visita rápida aos ecrãs principais' },
    steps: {
      welcome: { title: 'Olá! Esta é a Serena', text: 'Uma visita rápida de um minuto pelos ecrãs principais. Podes saltar quando quiseres.' },
      pillars: { title: 'Os teus pilares', text: 'Prática, Repetição e Aproximação. Vão-se enchendo à medida que praticas — é o teu progresso à vista.' },
      'home-plan': { title: 'O teu plano', text: 'As tarefas da semana ficam aqui. Toca em editar para escolher as tuas ou partir das sugestões.' },
      'header-actions': { title: "Definições", text: "Aqui tens o teu perfil e as conquistas, e mudas a língua, o tema, a privacidade e a cópia de segurança." },
      'support-now': { title: 'Num momento difícil', text: 'No separador Apoio começa por aqui, em "Agora mesmo", quando surgir um gatilho ou uma onda de ansiedade.' },
      'support-techniques': { title: 'Técnicas para acalmar', text: 'Respiração, varrimento corporal e frases positivas. Pratica-as em dias calmos para estarem prontas quando precisares.' },
      'calendar-card': { title: 'Calendário', text: 'Marca os dias: a vermelho os ataques ou comportamentos de segurança, a verde os dias com exposição.' },
      'resources-list': { title: 'Recursos', text: 'Lições, exercícios, planos, registos e linhas de apoio. Podes reordenar a lista ao teu gosto.' },
      tabbar: { title: 'Navegação', text: 'Usa esta barra para mudar entre Início, Apoio, Calendário e Recursos.' },
      end: { title: 'Tudo pronto', text: 'Vai ao teu ritmo — cada passo pequeno conta. Podes rever este tutorial em Definições.' },
    },
  },
  'pt-BR': {
    ui: { skip: 'Pular', next: 'Próximo', back: 'Anterior', done: 'Começar', replay: 'Ver o tutorial de novo', replayDesc: 'Uma visita rápida às telas principais' },
    steps: {
      welcome: { title: 'Olá! Esta é a Serena', text: 'Uma visita rápida de um minuto pelas telas principais. Você pode pular quando quiser.' },
      pillars: { title: 'Seus pilares', text: 'Prática, Repetição e Aproximação. Eles vão se enchendo conforme você pratica — é o seu progresso à vista.' },
      'home-plan': { title: 'Seu plano', text: 'As tarefas da semana ficam aqui. Toque em editar para escolher as suas ou partir das sugestões.' },
      'header-actions': { title: "Configurações", text: "Aqui ficam o seu perfil e as conquistas, e você muda o idioma, o tema, a privacidade e o backup." },
      'support-now': { title: 'Num momento difícil', text: 'Na aba Apoio, comece por aqui, em "Agora mesmo", quando surgir um gatilho ou uma onda de ansiedade.' },
      'support-techniques': { title: 'Técnicas para acalmar', text: 'Respiração, escaneamento corporal e frases positivas. Pratique em dias calmos para estarem prontas quando precisar.' },
      'calendar-card': { title: 'Calendário', text: 'Marque os dias: em vermelho as crises ou comportamentos de segurança, em verde os dias com exposição.' },
      'resources-list': { title: 'Recursos', text: 'Lições, exercícios, planos, registros e linhas de apoio. Você pode reordenar a lista como quiser.' },
      tabbar: { title: 'Navegação', text: 'Use esta barra para alternar entre Início, Apoio, Calendário e Recursos.' },
      end: { title: 'Tudo pronto', text: 'Vá no seu ritmo — cada pequeno passo conta. Você pode rever este tutorial em Configurações.' },
    },
  },
  en: {
    ui: { skip: 'Skip', next: 'Next', back: 'Back', done: 'Get started', replay: 'Show the tour again', replayDesc: 'A quick tour of the main screens' },
    steps: {
      welcome: { title: 'Hi! This is Serena', text: 'A quick one-minute tour of the main screens. You can skip at any time.' },
      pillars: { title: 'Your pillars', text: 'Practice, Repetition and Approach. They fill up as you practise — your progress at a glance.' },
      'home-plan': { title: 'Your plan', text: 'Your tasks for the week live here. Tap edit to pick your own or start from the suggestions.' },
      'header-actions': { title: "Settings", text: "Your profile and achievements live here, and you can change the language, theme, privacy and backup." },
      'support-now': { title: 'In a hard moment', text: 'In the Support tab, start here under "Right now" when a trigger or a wave of anxiety hits.' },
      'support-techniques': { title: 'Calming techniques', text: 'Breathing, body scan and positive phrases. Practise them on calm days so they are ready when you need them.' },
      'calendar-card': { title: 'Calendar', text: 'Mark your days: red for attacks or safety behaviours, green for days with exposure.' },
      'resources-list': { title: 'Resources', text: 'Lessons, exercises, plans, logs and helplines. You can reorder the list however you like.' },
      tabbar: { title: 'Navigation', text: 'Use this bar to switch between Home, Support, Calendar and Resources.' },
      end: { title: 'All set', text: 'Go at your own pace — every small step counts. You can replay this tour in Settings.' },
    },
  },
  es: {
    ui: { skip: 'Saltar', next: 'Siguiente', back: 'Anterior', done: 'Empezar', replay: 'Ver el tutorial otra vez', replayDesc: 'Un recorrido rápido por las pantallas principales' },
    steps: {
      welcome: { title: '¡Hola! Esto es Serena', text: 'Un recorrido rápido de un minuto por las pantallas principales. Puedes saltarlo cuando quieras.' },
      pillars: { title: 'Tus pilares', text: 'Práctica, Repetición y Acercamiento. Se van llenando a medida que practicas: tu progreso a la vista.' },
      'home-plan': { title: 'Tu plan', text: 'Aquí están las tareas de la semana. Toca editar para elegir las tuyas o partir de las sugerencias.' },
      'header-actions': { title: "Ajustes", text: "Aquí están tu perfil y tus logros, y cambias el idioma, el tema, la privacidad y la copia de seguridad." },
      'support-now': { title: 'En un momento difícil', text: 'En la pestaña Apoyo, empieza por aquí, en "Ahora mismo", cuando aparezca un detonante o una ola de ansiedad.' },
      'support-techniques': { title: 'Técnicas para calmarte', text: 'Respiración, escaneo corporal y frases positivas. Practícalas en días tranquilos para tenerlas listas cuando las necesites.' },
      'calendar-card': { title: 'Calendario', text: 'Marca los días: en rojo las crisis o conductas de seguridad, en verde los días con exposición.' },
      'resources-list': { title: 'Recursos', text: 'Lecciones, ejercicios, planes, registros y líneas de ayuda. Puedes reordenar la lista a tu gusto.' },
      tabbar: { title: 'Navegación', text: 'Usa esta barra para cambiar entre Inicio, Apoyo, Calendario y Recursos.' },
      end: { title: 'Todo listo', text: 'Ve a tu ritmo: cada pequeño paso cuenta. Puedes volver a ver este tutorial en Ajustes.' },
    },
  },
  fr: {
    ui: { skip: 'Passer', next: 'Suivant', back: 'Précédent', done: 'Commencer', replay: 'Revoir le tutoriel', replayDesc: 'Un tour rapide des écrans principaux' },
    steps: {
      welcome: { title: 'Bonjour ! Voici Serena', text: 'Un tour rapide d\'une minute des écrans principaux. Tu peux passer à tout moment.' },
      pillars: { title: 'Tes piliers', text: 'Pratique, Répétition et Approche. Ils se remplissent au fil de ta pratique : tes progrès en un coup d\'œil.' },
      'home-plan': { title: 'Ton plan', text: 'Les tâches de la semaine sont ici. Touche modifier pour choisir les tiennes ou partir des suggestions.' },
      'header-actions': { title: "Réglages", text: "Ici, tu trouves ton profil et tes réussites, et tu changes la langue, le thème, la confidentialité et la sauvegarde." },
      'support-now': { title: 'Dans un moment difficile', text: 'Dans l\'onglet Soutien, commence ici, dans « Maintenant », quand un déclencheur ou une vague d\'anxiété arrive.' },
      'support-techniques': { title: 'Techniques pour s\'apaiser', text: 'Respiration, scan corporel et phrases positives. Entraîne-toi les jours calmes pour qu\'elles soient prêtes le moment venu.' },
      'calendar-card': { title: 'Calendrier', text: 'Marque tes journées : en rouge les crises ou comportements de sécurité, en vert les jours avec exposition.' },
      'resources-list': { title: 'Ressources', text: 'Leçons, exercices, plans, journaux et lignes d\'écoute. Tu peux réorganiser la liste comme tu veux.' },
      tabbar: { title: 'Navigation', text: 'Utilise cette barre pour passer entre Accueil, Soutien, Calendrier et Ressources.' },
      end: { title: 'C\'est prêt', text: 'Avance à ton rythme : chaque petit pas compte. Tu peux revoir ce tutoriel dans les Réglages.' },
    },
  },
  de: {
    ui: { skip: 'Überspringen', next: 'Weiter', back: 'Zurück', done: 'Los geht\'s', replay: 'Tour erneut ansehen', replayDesc: 'Ein kurzer Rundgang durch die wichtigsten Bildschirme' },
    steps: {
      welcome: { title: 'Hallo! Das ist Serena', text: 'Ein kurzer Rundgang von einer Minute durch die wichtigsten Bildschirme. Du kannst jederzeit überspringen.' },
      pillars: { title: 'Deine Säulen', text: 'Übung, Wiederholung und Annäherung. Sie füllen sich, während du übst – dein Fortschritt auf einen Blick.' },
      'home-plan': { title: 'Dein Plan', text: 'Hier stehen deine Aufgaben für die Woche. Tippe auf Bearbeiten, um eigene zu wählen oder mit Vorschlägen zu starten.' },
      'header-actions': { title: "Einstellungen", text: "Hier findest du dein Profil und deine Erfolge und änderst Sprache, Design, Datenschutz und Sicherung." },
      'support-now': { title: 'In einem schweren Moment', text: 'Im Tab Hilfe beginnst du hier unter „Jetzt gerade“, wenn ein Auslöser oder eine Angstwelle kommt.' },
      'support-techniques': { title: 'Techniken zum Beruhigen', text: 'Atmung, Body-Scan und positive Sätze. Übe sie an ruhigen Tagen, damit sie bereit sind, wenn du sie brauchst.' },
      'calendar-card': { title: 'Kalender', text: 'Markiere deine Tage: rot für Attacken oder Sicherheitsverhalten, grün für Tage mit Exposition.' },
      'resources-list': { title: 'Ressourcen', text: 'Lektionen, Übungen, Pläne, Einträge und Hilfetelefone. Du kannst die Liste beliebig umsortieren.' },
      tabbar: { title: 'Navigation', text: 'Mit dieser Leiste wechselst du zwischen Start, Hilfe, Kalender und Ressourcen.' },
      end: { title: 'Alles bereit', text: 'Geh in deinem Tempo – jeder kleine Schritt zählt. Du kannst diese Tour in den Einstellungen wiederholen.' },
    },
  },
  it: {
    ui: { skip: 'Salta', next: 'Avanti', back: 'Indietro', done: 'Inizia', replay: 'Rivedi il tutorial', replayDesc: 'Un giro veloce delle schermate principali' },
    steps: {
      welcome: { title: 'Ciao! Questa è Serena', text: 'Un giro veloce di un minuto tra le schermate principali. Puoi saltarlo quando vuoi.' },
      pillars: { title: 'I tuoi pilastri', text: 'Pratica, Ripetizione e Avvicinamento. Si riempiono man mano che fai pratica: i tuoi progressi a colpo d\'occhio.' },
      'home-plan': { title: 'Il tuo piano', text: 'Qui trovi le attività della settimana. Tocca modifica per scegliere le tue o partire dai suggerimenti.' },
      'header-actions': { title: "Impostazioni", text: "Qui trovi il tuo profilo e i traguardi, e cambi lingua, tema, privacy e backup." },
      'support-now': { title: 'In un momento difficile', text: 'Nella scheda Supporto, inizia da qui, in "Proprio ora", quando arriva un fattore scatenante o un\'ondata d\'ansia.' },
      'support-techniques': { title: 'Tecniche per calmarsi', text: 'Respirazione, body scan e frasi positive. Esercitati nei giorni tranquilli, così saranno pronte quando servono.' },
      'calendar-card': { title: 'Calendario', text: 'Segna i giorni: in rosso gli attacchi o i comportamenti protettivi, in verde i giorni con esposizione.' },
      'resources-list': { title: 'Risorse', text: 'Lezioni, esercizi, piani, registri e linee di ascolto. Puoi riordinare l\'elenco come preferisci.' },
      tabbar: { title: 'Navigazione', text: 'Usa questa barra per passare tra Home, Supporto, Calendario e Risorse.' },
      end: { title: 'Tutto pronto', text: 'Procedi con calma: ogni piccolo passo conta. Puoi rivedere questo tutorial nelle Impostazioni.' },
    },
  },
  nl: {
    ui: { skip: 'Overslaan', next: 'Volgende', back: 'Vorige', done: 'Beginnen', replay: 'Rondleiding opnieuw bekijken', replayDesc: 'Een korte rondleiding langs de belangrijkste schermen' },
    steps: {
      welcome: { title: 'Hoi! Dit is Serena', text: 'Een korte rondleiding van een minuut langs de belangrijkste schermen. Je kunt altijd overslaan.' },
      pillars: { title: 'Je pijlers', text: 'Oefenen, Herhalen en Benaderen. Ze vullen zich terwijl je oefent – je voortgang in één oogopslag.' },
      'home-plan': { title: 'Je plan', text: 'Hier staan je taken voor de week. Tik op bewerken om je eigen taken te kiezen of met suggesties te beginnen.' },
      'header-actions': { title: "Instellingen", text: "Hier vind je je profiel en je successen, en wijzig je taal, thema, privacy en back-up." },
      'support-now': { title: 'In een moeilijk moment', text: 'Begin op het tabblad Steun hier, bij "Nu meteen", als er een trigger of een golf van angst komt.' },
      'support-techniques': { title: 'Technieken om te kalmeren', text: 'Ademhaling, bodyscan en positieve zinnen. Oefen ze op rustige dagen, zodat ze klaarstaan als je ze nodig hebt.' },
      'calendar-card': { title: 'Kalender', text: 'Markeer je dagen: rood voor aanvallen of veiligheidsgedrag, groen voor dagen met blootstelling.' },
      'resources-list': { title: 'Bronnen', text: 'Lessen, oefeningen, plannen, logboeken en hulplijnen. Je kunt de lijst naar wens ordenen.' },
      tabbar: { title: 'Navigatie', text: 'Gebruik deze balk om te wisselen tussen Start, Steun, Kalender en Bronnen.' },
      end: { title: 'Klaar', text: 'Ga in je eigen tempo – elke kleine stap telt. Je kunt deze rondleiding opnieuw bekijken in Instellingen.' },
    },
  },
  pl: {
    ui: { skip: 'Pomiń', next: 'Dalej', back: 'Wstecz', done: 'Zaczynamy', replay: 'Obejrzyj samouczek ponownie', replayDesc: 'Krótki przegląd głównych ekranów' },
    steps: {
      welcome: { title: 'Cześć! To jest Serena', text: 'Krótki, minutowy przegląd głównych ekranów. W każdej chwili można go pominąć.' },
      pillars: { title: 'Twoje filary', text: 'Praktyka, Powtarzanie i Zbliżanie się. Wypełniają się wraz z ćwiczeniami – postępy widoczne od razu.' },
      'home-plan': { title: 'Twój plan', text: 'Tutaj są zadania na ten tydzień. Dotknij „edytuj”, aby wybrać własne lub zacząć od propozycji.' },
      'header-actions': { title: "Ustawienia", text: "Tutaj jest profil i osiągnięcia; można też zmienić język, motyw, prywatność i kopię zapasową." },
      'support-now': { title: 'W trudnej chwili', text: 'W zakładce Wsparcie zacznij tutaj, w sekcji „Właśnie teraz”, gdy pojawi się wyzwalacz lub fala lęku.' },
      'support-techniques': { title: 'Techniki uspokajające', text: 'Oddychanie, skanowanie ciała i pozytywne zdania. Ćwicz je w spokojne dni, aby były gotowe, gdy będą potrzebne.' },
      'calendar-card': { title: 'Kalendarz', text: 'Zaznaczaj dni: na czerwono ataki lub zachowania zabezpieczające, na zielono dni z ekspozycją.' },
      'resources-list': { title: 'Zasoby', text: 'Lekcje, ćwiczenia, plany, zapiski i telefony zaufania. Listę można dowolnie uporządkować.' },
      tabbar: { title: 'Nawigacja', text: 'Ten pasek pozwala przełączać się między ekranami Początek, Wsparcie, Kalendarz i Zasoby.' },
      end: { title: 'Wszystko gotowe', text: 'Działaj we własnym tempie – liczy się każdy mały krok. Samouczek można obejrzeć ponownie w Ustawieniach.' },
    },
  },
  ru: {
    ui: { skip: 'Пропустить', next: 'Далее', back: 'Назад', done: 'Начать', replay: 'Показать обучение снова', replayDesc: 'Короткий обзор основных экранов' },
    steps: {
      welcome: { title: 'Привет! Это Serena', text: 'Короткий обзор основных экранов на одну минуту. Его можно пропустить в любой момент.' },
      pillars: { title: 'Твои опоры', text: 'Практика, Повторение и Приближение. Они заполняются по мере практики — прогресс сразу виден.' },
      'home-plan': { title: 'Твой план', text: 'Здесь задачи на неделю. Нажми «изменить», чтобы выбрать свои или начать с подсказок.' },
      'header-actions': { title: "Настройки", text: "Здесь твой профиль и достижения, а также язык, тема, конфиденциальность и резервная копия." },
      'support-now': { title: 'В трудный момент', text: 'Во вкладке «Поддержка» начни отсюда, с раздела «Прямо сейчас», когда появляется триггер или волна тревоги.' },
      'support-techniques': { title: 'Техники успокоения', text: 'Дыхание, сканирование тела и позитивные фразы. Практикуй их в спокойные дни, чтобы они были под рукой, когда понадобятся.' },
      'calendar-card': { title: 'Календарь', text: 'Отмечай дни: красным — приступы или защитное поведение, зелёным — дни с экспозицией.' },
      'resources-list': { title: 'Ресурсы', text: 'Уроки, упражнения, планы, записи и линии помощи. Список можно упорядочить как удобно.' },
      tabbar: { title: 'Навигация', text: 'С помощью этой панели можно переключаться между Главной, Поддержкой, Календарём и Ресурсами.' },
      end: { title: 'Всё готово', text: 'Двигайся в своём темпе — важен каждый маленький шаг. Это обучение можно посмотреть снова в Настройках.' },
    },
  },
};

// Ordem dos passos do tutorial.
export const TUTORIAL_ORDER: TutorialStepId[] = [
  'welcome', 'pillars', 'home-plan', 'header-actions', 'support-now', 'support-techniques', 'calendar-card', 'resources-list', 'tabbar', 'end',
];

// Passos sem elemento a realçar (balão ao centro).
export const TUTORIAL_NO_TARGET: TutorialStepId[] = ['welcome', 'end'];

export function tutorialPack(lang: Lang): Pack {
  return PACKS[lang] ?? PACKS.en;
}

export const TUTORIAL_LANGS = Object.keys(PACKS) as Lang[];
