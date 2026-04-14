# Post Detail Screen — Design Spec

Экран детальной публикации для Mecenate с real-time обновлениями и интерактивными элементами.

## Решения

- **State management:** только React Query, без MobX
- **Стилизация:** минимальные дизайн-токены — только `colors.ts`, остальное в `*.styles.ts`
- **WebSocket:** подключение только на экране Post Detail, отключение при выходе
- **Real-time архитектура:** WS-события обновляют кэш React Query напрямую через `setQueryData`
- **Таб-фильтры:** не реализуем (нет в дизайне)

---

## 1. Обновление типов и NetworkService

Типы приводятся в соответствие с реальным API (`https://k8s.mectest.ru/test-app/openapi.json`).

### Post и Author

```typescript
type Author = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  subscribersCount: number;
  isVerified: boolean;
};

type Post = {
  id: string;
  title: string;
  body: string;
  preview: string;
  coverUrl: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  tier: PostTierType;
  author: Author;
  createdAt: string;
};
```

### Comment (новый тип)

```typescript
type Comment = {
  id: string;
  postId: string;
  text: string;
  author: Author;
  createdAt: string;
};
```

### Типы ответов API

```typescript
type GetPostsResponse = {
  ok: boolean;
  data: { posts: Post[]; nextCursor: string | null; hasMore: boolean };
};

type PostDetailResponse = {
  ok: boolean;
  data: { post: Post };
};

type LikeResponse = {
  ok: boolean;
  data: { isLiked: boolean; likesCount: number };
};

type CommentsResponse = {
  ok: boolean;
  data: { comments: Comment[]; nextCursor: string | null; hasMore: boolean };
};

type CommentCreatedResponse = {
  ok: boolean;
  data: { comment: Comment };
};

type GetCommentsParams = {
  limit?: number;
  cursor?: string;
};
```

### NetworkService

- `getComments(postId, params: GetCommentsParams)` — типизируется с `CommentsResponse`
- `createComment(postId, text)` — типизируется с `CommentCreatedResponse`
- `getPostById(postId)` — типизируется с `PostDetailResponse`
- `toggleLikePost(postId)` — типизируется с `LikeResponse`
- `getPosts(params)` — обновляется под новый `GetPostsResponse`

### Адаптация существующих компонентов

PostCard и FeedScreen обновляются под новые имена полей: `likesCount`, `commentsCount`, `author.displayName`, `author.avatarUrl`.

---

## 2. Навигация и экран Post Detail

### Навигация

```typescript
type RootStackParamList = {
  FeedScreen: undefined;
  FeedDetailsScreen: { postId: string };
};
```

`RootNavigator` — `FeedDetailsScreen` маппится на `PostDetailScreen` (вместо дубля FeedScreen).

### PostCard — навигация

Обложка и заголовок оборачиваются в `Pressable` → `navigation.navigate('FeedDetailsScreen', { postId: post.id })`. Область статистики (лайки/комментарии) не кликабельна.

### PostDetailScreen

Расположение: `src/screens/PostDetailScreen/`

Получает `postId` из route params. `useQuery` загружает полный пост через `networkService.getPostById(postId)`.

Структура экрана (ScrollView, сверху вниз):
1. **Header** — кнопка «назад» + заголовок поста
2. **Обложка** — полноширинная картинка
3. **Автор** — аватар + displayName
4. **Тело поста** — `post.body` (для paid постов — заглушка)
5. **Кнопка лайка** — иконка сердца + счётчик с анимацией
6. **Комментарии** — список + кнопка «Загрузить ещё» + поле ввода

---

## 3. Лайк с анимацией и haptic feedback

### Мутация

- `useMutation` → `networkService.toggleLikePost(postId)`
- Оптимистичное обновление в `onMutate`: инвертируем `isLiked`, корректируем `likesCount` ±1 через `queryClient.setQueryData`
- `onError` откатывает к предыдущему значению
- WebSocket-событие `like_updated` подтверждает/корректирует реальное значение

### Анимация иконки (Reanimated)

- `useSharedValue` для scale и цвета
- При нажатии: `withSequence(withTiming(1.3, 150ms), withTiming(1, 150ms))` — bounce
- Цвет: `withTiming` переход серый ↔ красный при toggle
- `useAnimatedStyle` применяет transform scale + цвет

### Анимация счётчика

- `useSharedValue` для translateY + opacity
- При изменении: старое значение уезжает вверх с fade out, новое появляется снизу с fade in
- Направление зависит от like/unlike (вверх при +1, вниз при -1)

### Haptic feedback

- `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` при нажатии

### Компонент

`src/components/LikeButton/` — принимает `isLiked`, `likesCount`, `onPress`.

---

## 4. Комментарии

### Загрузка

- `useInfiniteQuery` с ключом `['COMMENTS', postId]`
- Первая страница загружается при входе (limit по умолчанию от API — 20)
- Кнопка «Загрузить ещё» вызывает `fetchNextPage()`, видна только если `hasMore === true`

### Отправка

- TextInput + кнопка отправки внизу экрана
- `useMutation` → `networkService.createComment(postId, text)`
- После успешной отправки — очищаем поле ввода
- WebSocket-событие `comment_added` добавит комментарий в кэш

### CommentCard

`src/components/CommentCard/` — аватар автора + displayName + текст + относительное время.

### Защита от дублей

При получении WS-события `comment_added` — проверка по `id` перед добавлением в кэш.

---

## 5. WebSocket-сервис и real-time интеграция

### Сервис

Расположение: `src/services/websocket/`

```typescript
class WebSocketService {
  private ws: WebSocket | null = null;
  private onEvent: ((event: WsEvent) => void) | null = null;

  connect(token: string, onEvent: (event: WsEvent) => void): void
  disconnect(): void
}
```

- URL: `wss://k8s.mectest.ru/test-app/ws?token=<uuid>`
- Принимает токен и колбэк для событий
- `disconnect()` закрывает соединение, очищает ссылки

### Типы WS-событий

```typescript
type WsLikeEvent = { type: 'like_updated'; postId: string; likesCount: number };
type WsCommentEvent = { type: 'comment_added'; postId: string; comment: Comment };
type WsPingEvent = { type: 'ping' };
type WsEvent = WsLikeEvent | WsCommentEvent | WsPingEvent;
```

### Хук usePostRealtime

Расположение: `src/hooks/usePostRealtime.ts`

- В `useEffect` — `webSocketService.connect(token, handler)`
- Обработка событий:
  - `like_updated` (если `postId` совпадает) → `queryClient.setQueryData` обновляет только `likesCount` в кэше поста (`isLiked` уже корректен из оптимистичного обновления мутации)
  - `comment_added` (если `postId` совпадает) → `queryClient.setQueryData` добавляет комментарий в кэш (с проверкой дублей по `id`)
  - `ping` → игнорируем
- Cleanup: `webSocketService.disconnect()`
- Токен берётся из `networkService.getAuthorizationToken()` (парсим UUID из Bearer строки)

---

## 6. Структура файлов

### Новые файлы

```
src/services/websocket/
  WebSocketService.ts
  types.ts
  index.ts

src/screens/PostDetailScreen/
  PostDetailScreen.tsx
  PostDetailScreen.styles.ts
  PostDetailScreen.constants.ts
  index.ts

src/components/LikeButton/
  LikeButton.tsx
  LikeButton.styles.ts
  LikeButton.types.ts
  index.ts

src/components/CommentCard/
  CommentCard.tsx
  CommentCard.styles.ts
  CommentCard.types.ts
  index.ts

src/hooks/
  usePostRealtime.ts
  index.ts
```

### Изменяемые файлы

- `src/types/post.ts` — обновление Post, Author, новые типы ответов
- `src/types/navigation.ts` — параметр postId для FeedDetailsScreen
- `src/services/network/types.ts` — типы ответов API
- `src/services/network/network.ts` — типизация методов
- `src/services/index.ts` — реэкспорт websocket
- `src/components/PostCard/PostCard.tsx` — Pressable на обложку, новые имена полей
- `src/components/PostCard/PostCard.types.ts` — обновлённый Post
- `src/components/index.ts` — экспорт LikeButton, CommentCard
- `src/navigation/RootNavigator/RootNavigator.tsx` — PostDetailScreen вместо дубля FeedScreen
- `src/App.tsx` — добавить QueryClientProvider

---

## API Reference

- **Swagger:** `https://k8s.mectest.ru/test-app/openapi.json`
- **WS docs:** `https://k8s.mectest.ru/test-app/docs`
- **Auth:** Bearer token (любой UUID)
- **Base URL:** настраивается через `expo-constants` extra или `process.env.BASE_URL`
