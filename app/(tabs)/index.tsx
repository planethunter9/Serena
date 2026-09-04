import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// A lista de fobias. Cada uma tem o nome científico e uma descrição.
// Mais tarde podes acrescentar/remover à vontade — é só editar aqui.
const FOBIAS = [
  { id: 'aracnofobia', nome: 'Aracnofobia', descricao: 'medo de aranhas' },
  { id: 'acrofobia', nome: 'Acrofobia', descricao: 'medo de alturas' },
  { id: 'aerofobia', nome: 'Aerofobia', descricao: 'medo de andar de avião' },
  { id: 'claustrofobia', nome: 'Claustrofobia', descricao: 'medo de espaços fechados' },
  { id: 'fobia_social', nome: 'Fobia social', descricao: 'medo de situações sociais' },
  { id: 'tripanofobia', nome: 'Tripanofobia', descricao: 'medo de agulhas' },
  { id: 'cinofobia', nome: 'Cinofobia', descricao: 'medo de cães' },
  { id: 'amaxofobia', nome: 'Amaxofobia', descricao: 'medo de transportes' },
  { id: 'emetofobia', nome: 'Emetofobia', descricao: 'medo de vomitar' },
];

export default function HomeScreen() {
  // "estado": guarda qual a fobia que o utilizador escolheu.
  // Começa a null (nada escolhido). Ao tocar numa opção, muda.
  const [fobiaEscolhida, setFobiaEscolhida] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Qual é o teu medo?</Text>
        <Text style={styles.subtitulo}>
          Escolhe por onde queres começar. Podes mudar mais tarde.
        </Text>

        {/* Percorremos a lista e criamos um botão para cada fobia */}
        {FOBIAS.map((fobia) => {
          const selecionada = fobiaEscolhida === fobia.id;
          return (
            <Pressable
              key={fobia.id}
              onPress={() => setFobiaEscolhida(fobia.id)}
              style={[
                styles.opcao,
                selecionada && styles.opcaoSelecionada,
              ]}
            >
              <View style={styles.opcaoTextos}>
                <Text
                  style={[
                    styles.opcaoNome,
                    selecionada && styles.opcaoNomeSelecionado,
                  ]}
                >
                  {fobia.nome}
                </Text>
                <Text style={styles.opcaoDescricao}>{fobia.descricao}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Botão de continuar: só fica "ativo" quando há algo escolhido */}
      <Pressable
        style={[
          styles.botao,
          !fobiaEscolhida && styles.botaoDesativado,
        ]}
        disabled={!fobiaEscolhida}
        onPress={() => {
          // Por agora só mostra no terminal. Depois liga ao próximo ecrã.
          console.log('Fobia escolhida:', fobiaEscolhida);
        }}
      >
        <Text style={styles.botaoTexto}>Continuar</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  scroll: {
    padding: 24,
    gap: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 15,
    color: '#9aa0aa',
    marginBottom: 16,
  },
  opcao: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#1a1d26',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  opcaoSelecionada: {
    borderColor: '#6c8cff',
    backgroundColor: '#232a3d',
  },
  opcaoTextos: {
    gap: 3,
  },
  opcaoNome: {
    fontSize: 17,
    color: '#e6e8ec',
  },
  opcaoNomeSelecionado: {
    color: '#ffffff',
    fontWeight: '600',
  },
  opcaoDescricao: {
    fontSize: 13,
    color: '#9aa0aa',
  },
  botao: {
    margin: 24,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#6c8cff',
    alignItems: 'center',
  },
  botaoDesativado: {
    backgroundColor: '#2a2d38',
  },
  botaoTexto: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});