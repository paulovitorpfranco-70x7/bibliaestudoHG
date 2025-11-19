# Arquitetura Limpa e Escalável para o BibliaEstudoHG

Este documento reorganiza o app atual em uma arquitetura limpa, modular e preparada para crescimento, sem alterar o comportamento já existente (modo Strong, Dexie/IndexedDB, persistência de capítulo, modais, notas e barra de ações).

---

## 1. Estrutura Final de Pastas
```
app/
  main.tsx              # bootstrap, providers globais
  router.tsx            # rotas internas (Reader, Notes, Settings)
core/
  config/appConfig.ts   # constantes globais e feature flags
  errors/index.ts       # erros customizados das camadas inferiores
  utils/
    formatting.ts
    promises.ts
  hooks/useIsomorphicLayoutEffect.ts
  providers/ThemeProvider.tsx
  events/eventBus.ts
  state/StoreProvider.tsx
  types/result.ts       # helpers Either/Result
  services/logger.ts
  services/telemetry.ts
shared/
  constants/strong.ts
  styles/tokens.ts
  components/form/
  components/layout/
  components/feedback/
  components/overlays/
  hooks/
  utils/
ui/
  components/
    Reader/
      ReaderLayout.tsx
      ReaderToolbar.tsx
      ReaderModalHost.tsx
    StrongTag/StrongTag.tsx
    Notes/
      NoteCard.tsx
    Primitives/
      Button.tsx
      Icon.tsx
  modals/
    StrongDefinitionModal.tsx
    NotesModal.tsx
  navigation/InternalTabs.tsx
features/
  reader/
    index.ts
    ui/ReaderScreen.tsx
    controllers/useReaderController.ts
    hooks/useReaderActions.ts
    hooks/useReaderShortcuts.ts
    adapters/
      readerDexieAdapter.ts
      readerDTO.ts
    domain/
      entities/Chapter.ts
      valueObjects/Verse.ts
      repositories/ReaderRepository.ts
      services/ReaderService.ts
    data/
      datasources/ChapterDataSource.ts
      repositories/ReaderRepositoryDexie.ts
      mappers/ChapterMapper.ts
      factories/readerFactory.ts
  notes/
    ... (estrutura similar)
  settings/
    ...
domain/
  entities/
  valueObjects/
  services/
  events/
  repositories/
data/
  dexie/
    bibleDb.ts
    tables.ts
    migrations.ts
  sources/
  repositories/
infra/
  dexie/dexieClient.ts   # instancia singleton Dexie
  storage/indexedDbGateway.ts
  analytics/
  telemetry/

```

### Responsabilidades (resumo)
- **app/**: bootstrapping, roteamento, providers globais.
- **core/**: utilitários puros, contratos genéricos, serviços cross-cutting.
- **domain/**: entidades imutáveis, eventos, regras de negócio.
- **data/**: implementação concreta de repositórios/datasources e mapeadores para Dexie.
- **features/**: boundary layer, combinando domain + data + UI específica de cada caso de uso (ex.: reader, notes).
- **ui/**: componentes puramente visuais (stateless), modais e navegação.
- **shared/**: tokens de design, componentes reusáveis, helpers UI-friendly.
- **infra/**: gateways externos (Dexie, analytics, storage).

### Fluxo de Dependências
```
ui ──> features (controllers/hooks) ──> domain ──> core
                      │                    ▲
                      ▼                    │
                  data (adapters) ──> infra ┘
```
- A camada **features** orquestra UI (componentes puros) e lógica (controllers/hooks). Ela depende de **domain** para contratos e de **data** para implementações concretas.
- **Data** conhece **infra** (Dexie) e devolve objetos do **domain** via mappers/adapters.
- **Domain** depende apenas de **core** para utilidades genéricas.

---

## 2. Contratos e Interfaces Entre Camadas
```ts
// domain/repositories/ReaderRepository.ts
export interface ReaderRepository {
  getChapter(reference: ChapterReference): Promise<Result<Chapter>>;
  saveReadingState(state: ReaderState): Promise<void>;
  streamNotes(chapterId: string): AsyncIterable<Note[]>;
}

// domain/services/ReaderService.ts
export class ReaderService {
  constructor(private repo: ReaderRepository) {}

  async loadChapter(ref: ChapterReference) {
    return this.repo.getChapter(ref);
  }

  async persistState(state: ReaderState) {
    await this.repo.saveReadingState(state);
  }
}
```
- Cada **controller** (camada feature) recebe o `ReaderService` via factory. Isso permite mockar facilmente em testes.

---

## 3. Dexie Reorganizado
### Instância única
```ts
// infra/dexie/dexieClient.ts
import Dexie, { Table } from 'dexie';
import { BibleChapterRow, NoteRow } from '../../data/dexie/tables';

class BibleDexie extends Dexie {
  chapters!: Table<BibleChapterRow, number>;
  notes!: Table<NoteRow, string>;

  constructor() {
    super('bibleHG');
    this.version(1).stores({
      chapters: '&id, book, chapter',
      notes: '&id, chapterId'
    });
  }
}

export const bibleDexie = new BibleDexie();
```

### DataSource + Repository
```ts
// data/dexie/datasources/ChapterDataSource.ts
export interface ChapterDataSource {
  fetchChapterRow(ref: ChapterReference): Promise<BibleChapterRow | undefined>;
  upsertChapter(row: BibleChapterRow): Promise<void>;
}

// data/dexie/datasources/ChapterDexieDataSource.ts
export class ChapterDexieDataSource implements ChapterDataSource {
  constructor(private db = bibleDexie) {}

  fetchChapterRow(ref: ChapterReference) {
    return this.db.chapters.get(`${ref.book}-${ref.chapter}`);
  }

  upsertChapter(row: BibleChapterRow) {
    return this.db.chapters.put(row);
  }
}

// data/repositories/ReaderRepositoryDexie.ts
export class ReaderRepositoryDexie implements ReaderRepository {
  constructor(
    private chapterSource: ChapterDataSource,
    private mapper: ChapterMapper
  ) {}

  async getChapter(ref: ChapterReference) {
    const row = await this.chapterSource.fetchChapterRow(ref);
    return row ? ok(this.mapper.toDomain(row)) : err(new ChapterNotFoundError(ref));
  }

  saveReadingState(state: ReaderState) {
    return this.chapterSource.upsertChapter(this.mapper.fromDomain(state));
  }

  streamNotes(chapterId: string) {
    return makeDexieLiveQuery(this.db.notes.where({ chapterId }));
  }
}
```

### Adapter Domain ↔ Data
```ts
// features/reader/adapters/readerDexieAdapter.ts
export const buildReaderRepository = () => {
  const chapterSource = new ChapterDexieDataSource();
  const mapper = new ChapterMapper();
  return new ReaderRepositoryDexie(chapterSource, mapper);
};

// features/reader/adapters/readerFactory.ts
export const createReaderService = () => new ReaderService(buildReaderRepository());
```

---

## 4. ReaderScreen Desacoplado
### UI pura
```tsx
// features/reader/ui/ReaderScreen.tsx
import { ReaderLayout } from '@/ui/components/Reader/ReaderLayout';
import { ReaderToolbar } from '@/ui/components/Reader/ReaderToolbar';
import { StrongTag } from '@/ui/components/StrongTag/StrongTag';
import { useReaderController } from '../controllers/useReaderController';

export function ReaderScreen() {
  const {
    verses,
    strongMode,
    activeNote,
    onToggleStrong,
    onSelectStrong,
    onNoteAction,
    modals
  } = useReaderController();

  return (
    <ReaderLayout
      toolbar={<ReaderToolbar strongMode={strongMode} onToggleStrong={onToggleStrong} />}
      verses={verses}
      renderVerse={(verse) => (
        <p>
          {verse.words.map((word) => (
            <StrongTag key={word.id} word={word} strongMode={strongMode} onPress={onSelectStrong} />
          ))}
        </p>
      )}
      modals={<ReaderModalHost {...modals} />}
      activeNote={activeNote}
      onNoteAction={onNoteAction}
    />
  );
}
```

### Controller + Hooks
```ts
// features/reader/controllers/useReaderController.ts
import { useReaderStore } from '../state/readerStore';
import { useReaderActions } from '../hooks/useReaderActions';
import { useReaderShortcuts } from '../hooks/useReaderShortcuts';

export function useReaderController() {
  const state = useReaderStore((s) => ({
    verses: s.verses,
    strongMode: s.preferences.strongMode,
    activeNote: s.activeNote,
    modals: s.modals
  }));
  const actions = useReaderActions();
  useReaderShortcuts(actions);
  return { ...state, ...actions };
}
```

### Hooks inteligentes
```ts
// features/reader/hooks/useReaderActions.ts
export function useReaderActions() {
  const service = useReaderService(); // injeta ReaderService
  const setState = useReaderStore((s) => s.setState);
  const [isPending, startTransition] = useTransition();

  const loadChapter = useEffectEvent(async (ref: ChapterReference) => {
    const result = await service.loadChapter(ref);
    result.match({
      ok: (chapter) => setState((s) => ({ ...s, verses: chapter.verses })),
      err: (error) => publishToast(error.message)
    });
  });

  const onToggleStrong = () => setState((s) => ({
    ...s,
    preferences: { ...s.preferences, strongMode: !s.preferences.strongMode }
  }));

  const onSelectStrong = (word: StrongWord) => setState((s) => ({
    ...s,
    modals: { ...s.modals, strong: { word } }
  }));

  const onNoteAction = (payload: NoteActionPayload) => startTransition(() => {
    // dispara actions async (salvar nota, abrir modal, etc.)
  });

  return { loadChapter, onToggleStrong, onSelectStrong, onNoteAction, isPending };
}
```

### Estado (Zustand + imutabilidade)
```ts
// features/reader/state/readerStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ReaderState {
  verses: Verse[];
  preferences: { strongMode: boolean };
  activeNote?: Note;
  modals: { strong?: { word: StrongWord }; notes?: { noteId?: string } };
  setState: (fn: (draft: ReaderState) => void) => void;
}

export const useReaderStore = create<ReaderState>()(immer((set) => ({
  verses: [],
  preferences: { strongMode: true },
  modals: {},
  setState: (recipe) => set((draft) => recipe(draft))
})));
```

---

## 5. Padronização de Modais, Navegação e Utilitários
- **Modais**: `ui/components/overlays/ModalRoot.tsx` recebe `ModalDescriptor[]` (id, props, Component). A camada feature apenas publica `modals` no store.
- **Navegação interna**: `app/router.tsx` usa `createBrowserRouter`. Dentro do Reader, `ui/navigation/InternalTabs` gerencia tabs (Notas, Referências) via contexto local para evitar re-render.
- **Utilitários**: `core/utils/promises.ts` (`withTimeout`, `retryAsync`), `shared/utils/formatStrong.ts` para converter número Strong.

---

## 6. Serviços, Adaptadores e Hooks Globais
- **Services**: `core/services/logger.ts`, `core/services/telemetry.ts` expostos via contexto e injetados nos hooks.
- **Adaptadores**: cada feature possui `adapters/*` que conectam domain/data. Ex.: `readerDexieAdapter.ts` monta repositório Dexie e injeta no controller.
- **Hooks globais**: `shared/hooks/useModalManager`, `shared/hooks/usePersistentState` (usa IndexedDB via infra) para reutilizar persistência de capítulo.

---

## 7. Diagrama Textual
```
[ReaderScreen UI]
  ⇅ props/events
[useReaderController]
  ⇅ zustand store (state slice)
[useReaderActions]
  ⇅
[ReaderService]
  ⇅
[ReaderRepositoryDexie] --(Dexie rows)--> [ChapterDexieDataSource] --(infra)--> [bibleDexie]
```

---

## 8. Plano de Migração Passo a Passo
1. **Preparar base**: criar pastas `app`, `core`, `shared`, `ui`, `domain`, `data`, `features`, `infra` sem mover arquivos.
2. **Mover infra Dexie**: extrair configuração atual para `infra/dexie/dexieClient.ts` e exportar instância.
3. **Criar domain entities**: converter modelos atuais (capítulo, versículo, nota) em objetos imutáveis (`Object.freeze`) em `domain/entities`.
4. **Extrair mappers**: mover lógica de conversão Dexie→UI para `data/mappers` retornando entidades domain.
5. **Criar contratos**: definir `ReaderRepository`, `NotesRepository`, `SettingsRepository` em `domain/repositories`.
6. **Implementar repositories**: mover código Dexie existente para `data/repositories/*` implementando interfaces.
7. **Factories/Adapters**: criar `features/*/adapters` para instanciar services com repositories Dexie.
8. **Criar store Zustand**: substituir estados locais do Reader por `features/reader/state/readerStore.ts`.
9. **Separar UI**: mover JSX da tela para `ui/components/Reader/*` deixando `ReaderScreen` consumir componentes puros.
10. **Extrair hooks**: criar `useReaderController`, `useReaderActions`, `useReaderShortcuts` replicando lógica atual.
11. **Padronizar modais**: mover componentes para `ui/modals`, substituir chamadas diretas por estado `modals` no store.
12. **Persistência capítulo**: encapsular leitura/escrita no novo `ReaderService` para manter compatibilidade.
13. **Atualizar imports**: garantir que cada camada referencia apenas camadas permitidas.
14. **Adicionar testes unitários** para services e repositories (mock Dexie).

---

## 9. Checklist Final de Migração
- [ ] Estrutura de pastas criada conforme árvore acima.
- [ ] Dexie isolado em `infra/dexie/dexieClient.ts` + datasources.
- [ ] Contratos domain definidos (repositories, services, entities imutáveis).
- [ ] Repositories Dexie implementam contratos e usam mappers.
- [ ] Factories/adapters expostos em `features/*/adapters`.
- [ ] ReaderScreen usa componentes puros + controller/hook.
- [ ] Zustand store centraliza estado do leitor e preferências.
- [ ] Modais e notas usam padronização `ModalDescriptor`.
- [ ] Navegação interna configurada em `app/router.tsx`.
- [ ] Hooks globais e serviços core disponíveis via providers.
- [ ] Todos os testes (unit/integration) atualizados.
- [ ] Deploy validado garantindo persistência Dexie e modo Strong.

---

Com essa arquitetura você terá um app desacoplado, escalável e simples de evoluir mantendo compatibilidade com React 19, Dexie e todos os recursos já implementados.
