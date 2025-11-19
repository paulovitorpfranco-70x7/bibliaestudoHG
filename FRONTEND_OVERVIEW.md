# Visão geral do frontend

Este documento resume a arquitetura atual do app "Bíblia de Estudo" para que você possa continuar o desenvolvimento no VS Code / Copilot / GPT Codex com contexto já organizado.

## Stack e entrada
- **Stack:** React 19 + TypeScript + Vite + Dexie (IndexedDB) + classes utilitárias estilo Tailwind.
- **Scripts principais:** `npm run dev`, `npm run build`, `npm run preview` (ver `package.json`).
- **Entrada:** `index.tsx` renderiza `<App />` dentro do `#root` com `React.StrictMode`.
- **Organização principal:**
  - `/app` mantém o `App.tsx` e orquestra navegação/tema/bootstrap.
  - `/core` possui hooks transversais (`useAppBootstrap`, `useTheme`).
  - `/domain` define modelos e contratos (`BibleRepository`).
  - `/data` implementa datasources/repositórios Dexie.
  - `/features` abriga telas e controllers especializados (auth, home, reader, notes, loading).
  - `/shared` expõe providers/hooks para injetar dependências.
  - `/infra` contém o Dexie (`infra/database/bibleDb.ts`) e factories/container.

## Fluxo do `App`
Arquivo: `app/App.tsx`.
- Gerencia o estado da tela corrente (`login`, `home`, `reader`, `notes`).
- Mantém o tema via `core/theme/useTheme` (persistência em `localStorage` + classe `dark`).
- Usa `core/bootstrap/useAppBootstrap` (que delega ao datasource Dexie) para preparar os dados locais. Enquanto popula, mostra `LoadingScreen` com progresso.
- Injeta o `BibleRepositoryProvider` com a instância criada em `infra/container` para que features consumam a camada de domínio.
- Alterna entre componentes de tela passando callbacks de navegação e `darkMode`.

### Telas existentes
| Tela | Arquivo | Destaques |
| --- | --- | --- |
| Login | `features/auth/screens/LoginScreen.tsx` | Tela full-screen com efeitos animados; botões de login dummy apenas chamam `onLoginSuccess`. |
| Home | `features/home/screens/HomeScreen.tsx` | Painel com cards chamativos, atalho para Leitura e Notas, botão de tema, contagem de notas via hook `useHomeMetrics` (usa repositório). |
| Leitor | `features/reader/screens/ReaderScreen.tsx` | Usa `useReaderController` + `ReaderView` para desacoplar lógica/UI do modo Strong. |
| Notas | `features/notes/screens/NotesScreen.tsx` | CRUD local usando `useNotesController` (repositório) com editor inline e lista responsiva. |
| Loading | `features/loading/screens/LoadingScreen.tsx` | Mostra progresso da carga inicial e barra de progresso quando semeando. |

## Componentes chave do leitor
Arquivos: `features/reader/hooks/useReaderController.ts` + `features/reader/components/ReaderView.tsx`.

1. **Persistência de posição:** guarda `currentBookId`/`currentChapter` no `localStorage` via helper interno do controller.
2. **Fonte de dados:** o controller usa `BibleRepository.watchBookById/watchChapter` com `dexie-react-hooks` para observar mudanças.
3. **Renderização dos versículos:**
   - Quando o "modo Strong" está ativo, percorre palavra por palavra (`verse.text.split(' ')`).
   - Usa o array `verse.strongs` (posições + códigos) para transformar cada palavra clicável (`renderVerseText`).
   - Um clique abre `StrongsModal` para o código selecionado.
4. **Toolbar contextual:** clicar no versículo ativa `VerseActionToolbar` com ações de copiar/favoritar/anotar/compartilhar.
5. **Navegação:**
   - Botões Laterais `IconChevronLeft/Right` avançam/regredem capítulos respeitando `bookData.chapterCount`.
   - Botão central abre `BookChapterSelector` (modal com filtro AT/NT e grid de capítulos).
6. **Floating action:** botão circular inferior alterna `strongsMode` (icone `Αω`).

## Modal Strong
Arquivo: `features/reader/components/modals/StrongsModal.tsx`.
- Usa o `BibleRepository` para buscar o código via `useLiveQuery` com `searchStrongEntry`.
- Mostra o código, forma original (RTL quando hebraico) e transliteração.
- Blocos de métricas exibem ocorrências total/AT/NT.
- Lista opcional de versículos relacionados com CTA para "ver todas as ocorrências".
- Mantém `backdrop` com blur e bloqueia propagação de clique para fechar.

## Seletor de livros/capítulos
Arquivo: `features/reader/components/selector/BookChapterSelector.tsx`.
- Modal de tela cheia (`fixed inset-0`).
- Toggle AT/NT filtra livros usando `BibleRepository.watchBooksByTestament` + `useLiveQuery`.
- `BookGrid` destaca o livro corrente, `ChapterGrid` mostra botões numerados responsivos.
- Usa `onSelect(bookId, chapter)` para atualizar o leitor e fecha o modal.

## Notas rápidas
Arquivo: `features/notes/screens/NotesScreen.tsx`.
- `useNotesController` centraliza estado da tela, `useLiveQuery` carrega notas ordenadas por `updatedAt` via repositório.
- Botão flutuante `+` abre modo de edição inline.
- `persistNote` diferencia `save` vs `add` chamando `BibleRepository`.
- Confirmação nativa para exclusão permanece na UI.

## Barra de ações do versículo
Arquivo: `features/reader/components/toolbar/VerseActionToolbar.tsx`.
- Renderiza popover sobre o versículo ativo.
- `handleCopy` usa `navigator.clipboard`; feedback visual troca ícone por `IconCheck` por 2s.
- Estrutura pronta para favoritar/anotar/compartilhar (por enquanto apenas UI).

## Estrutura de dados Dexie
Arquivo: `infra/database/bibleDb.ts` + `data/datasources/BibleDexieDatasource.ts`.
- Tabelas: `books`, `chapters`, `strongs`, `notes`.
- `populate` limpa e carrega livros, dicionário Strong e capítulos da tradução ARC (`infra/database/loadArcSource.ts`).
- `BibleDexieDatasource` expõe métodos/queries consumidos pelo `BibleRepositoryImpl`, que por sua vez é injetado nas telas.
- O bootstrap (`core/bootstrap/useAppBootstrap`) usa o datasource para checar `isPopulated`/`populate` e envia progresso para o `LoadingScreen`.

## Próximos passos sugeridos
1. **Implementar áudio/pronúncia no modal:** conectar `IconVolume2` a um TTS ou arquivo de áudio.
2. **Persistir favoritos/anotações por versículo:** criar tabela Dexie adicional ou campos em `notes`.
3. **Pesquisar por código Strong:** criar tela/overlay que consome o repositório (`getStrongEntries` ou filtro incremental).
4. **Sincronizar com backend:** quando existir API, substituir `Dexie` por camada que sincroniza dados remotos mantendo cache offline.

Mantenha este arquivo atualizado ao evoluir o frontend para que futuras iterações tenham contexto imediato.
