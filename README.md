# Serena

Serena é uma aplicação móvel de apoio a quem vive com **emetofobia** (o medo de vomitar). Combina educação, ferramentas para usar no momento de ansiedade, exercícios baseados em técnicas de terapia, e acompanhamento do progresso ao longo do tempo.

> **Aviso:** a Serena é uma ferramenta de apoio e educação. **Não é um dispositivo médico** e não substitui a avaliação, o diagnóstico ou o tratamento por um profissional de saúde. Em caso de crise, procura ajuda profissional.

---

## Funcionalidades

- **Contas e sincronização na cloud** — registo/início de sessão com Supabase; os dados de cada utilizador ficam guardados e sincronizados, com funcionamento offline.
- **Onboarding personalizado** — a pessoa escolhe as vertentes da sua emetofobia, o que a fobia lhe tira, como a afeta e o que quer recuperar. Tudo editável mais tarde.
- **Início** — um contador de dias sem ataques/comportamentos, registo rápido de ataques (ansiedade/pânico/comportamento) e da intensidade do medo, técnicas de calma (respiração 4-4, varrimento corporal, pensamento positivo) e sons ambiente (acalmar e dormir).
- **Progresso** — estatísticas e gráfico da evolução do medo ao longo do tempo.
- **Calendário** — marca os dias com ataques ou comportamentos.
- **Recursos**
  - *Lições* — conteúdo educativo sobre a fobia e a recuperação.
  - *Exercícios* — exposição gradual com escala SUDS (0–10) e reestruturação cognitiva.
  - *Jogos* — dessensibilização a palavras e um quiz "verdade ou mito".
  - *Exposição não planeada*, *Perfil do medo*, *Comportamentos de segurança*.
  - *Lembretes de prática*, *Objetivos*, *Diário*, *Conquistas*.
- **Perfil** — foto, nome, username, bio e controlo do que aparece.
- **Definições** — tema claro/escuro, idioma (Português/Inglês) e política de privacidade.

## Tecnologias

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 54)
- [Expo Router](https://docs.expo.dev/router/introduction/) (navegação)
- [Supabase](https://supabase.com/) (autenticação e base de dados)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (armazenamento local)
- `expo-audio`, `expo-notifications`, `expo-image-picker`, `expo-glass-effect`

## Como executar (desenvolvimento)

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão LTS)
- App **Expo Go** instalada no telemóvel
- Um projeto [Supabase](https://supabase.com/) (gratuito)

### Passos

1. Clonar o repositório e instalar as dependências:
   ```bash
   git clone https://github.com/rald91/Serena.git
   cd Serena
   npm install
   ```

2. Configurar o Supabase:
   - Cria um projeto no Supabase.
   - No **SQL Editor**, cria a tabela de perfis (ver `supabase-setup.sql`).
   - Em **Project Settings → API**, copia o *Project URL* e a chave *anon public*.
   - Copia o ficheiro de exemplo e preenche com as tuas chaves:
     ```bash
     cp src/lib/supabaseConfig.example.ts src/lib/supabaseConfig.ts
     ```

3. Arrancar a app:
   ```bash
   npx expo start -c
   ```
   Lê o QR code com a câmara do iPhone (abre na Expo Go).

## Estrutura do projeto

```
src/
├── app/            # Rotas (Expo Router)
├── auth/           # Autenticação (Supabase)
├── components/     # Ecrãs e componentes de interface
├── data/           # Conteúdo (lições, opções, exercícios, jogos)
├── i18n/           # Traduções (PT/EN)
├── lib/            # Cliente Supabase e sincronização
├── notifications/  # Notificações locais
├── storage/        # Armazenamento local por utilizador
└── theme/          # Cores e tema (claro/escuro)
```

## Estado

Em desenvolvimento. Foco atual: emetofobia. A arquitetura de conteúdo está preparada para, no futuro, suportar outras fobias.

## Licença

Ver o ficheiro [LICENSE](LICENSE).
