/* global jest */
// Configuração dos testes: AsyncStorage em memória (o módulo nativo não existe no Jest).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
