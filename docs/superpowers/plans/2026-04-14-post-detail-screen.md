# Post Detail Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Post Detail screen with animated likes, lazy-loaded comments, and WebSocket real-time updates.

**Architecture:** React Query for all server state + cache updates from WebSocket events. WebSocket connects on Post Detail mount, disconnects on unmount. Optimistic updates for likes via useMutation + setQueryData.

**Tech Stack:** React Native, Expo, TypeScript, React Query, Reanimated, expo-haptics, React Navigation native stack

**Spec:** `docs/superpowers/specs/2026-04-14-post-detail-screen-design.md`

---

## File Map

### New files
| File | Responsibility |
|------|----------------|
| `src/services/websocket/types.ts` | WS event type definitions |
| `src/services/websocket/WebSocketService.ts` | WS connection class |
| `src/services/websocket/index.ts` | Barrel export |
| `src/components/LikeButton/LikeButton.types.ts` | LikeButton prop types |
| `src/components/LikeButton/LikeButton.styles.ts` | LikeButton styles |
| `src/components/LikeButton/LikeButton.tsx` | Animated like button with haptics |
| `src/components/LikeButton/index.ts` | Barrel export |
| `src/components/CommentCard/CommentCard.types.ts` | CommentCard prop types |
| `src/components/CommentCard/CommentCard.styles.ts` | CommentCard styles |
| `src/components/CommentCard/CommentCard.tsx` | Comment display component |
| `src/components/CommentCard/index.ts` | Barrel export |
| `src/hooks/usePostRealtime.ts` | Hook: WS connect/disconnect + cache updates |
| `src/hooks/index.ts` | Barrel export |
| `src/screens/PostDetailScreen/PostDetailScreen.constants.ts` | Query keys |
| `src/screens/PostDetailScreen/PostDetailScreen.styles.ts` | Screen styles |
| `src/screens/PostDetailScreen/PostDetailScreen.tsx` | Post Detail screen |
| `src/screens/PostDetailScreen/index.ts` | Barrel export |

### Modified files
| File | Changes |
|------|---------|
| `src/services/network/types.ts` | Replace all types with API-aligned versions |
| `src/services/network/network.ts` | Add return types to all methods, update getComments signature |
| `src/services/index.ts` | Add websocket re-export |
| `src/types/navigation.ts` | Add postId param to FeedDetailsScreen |
| `src/constants/colors.ts` | Add red, lightGray colors |
| `src/components/PostCard/PostCard.tsx` | Update field names, add Pressable navigation |
| `src/components/PostCard/PostCard.types.ts` | Add onPress prop |
| `src/components/PostCard/PostCard.styles.ts` | Add pressable styles |
| `src/components/index.ts` | Export LikeButton, CommentCard |
| `src/screens/FeedScreen/FeedScreen.tsx` | Pass onPress to PostCard, update field usage |
| `src/screens/FeedScreen/FeedScreen.utils.ts` | Update Post import |
| `src/navigation/RootNavigator/RootNavigator.tsx` | Import PostDetailScreen, add QueryClientProvider |
| `src/App.tsx` | Wrap with QueryClientProvider |

---

### Task 1: Update types to match real API

**Files:**
- Modify: `src/services/network/types.ts`
- Modify: `src/types/post.ts`

- [ ] **Step 1: Replace network types**

Replace the entire content of `src/services/network/types.ts`:

```typescript
import {PostTierType} from "@/types";

export type Author = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    subscribersCount: number;
    isVerified: boolean;
};

export type Post = {
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

export type Comment = {
    id: string;
    postId: string;
    text: string;
    author: Author;
    createdAt: string;
};

export type GetPostsParams = {
    limit?: number;
    cursor?: string;
    tier?: PostTierType;
    simulate_error?: boolean;
};

export type GetPostsResponse = {
    ok: boolean;
    data: {
        posts: Post[];
        nextCursor: string | null;
        hasMore: boolean;
    };
};

export type PostDetailResponse = {
    ok: boolean;
    data: {
        post: Post;
    };
};

export type LikeResponse = {
    ok: boolean;
    data: {
        isLiked: boolean;
        likesCount: number;
    };
};

export type GetCommentsParams = {
    limit?: number;
    cursor?: string;
};

export type CommentsResponse = {
    ok: boolean;
    data: {
        comments: Comment[];
        nextCursor: string | null;
        hasMore: boolean;
    };
};

export type CommentCreatedResponse = {
    ok: boolean;
    data: {
        comment: Comment;
    };
};
```

- [ ] **Step 2: Verify post.ts still works**

`src/types/post.ts` only exports `PostTierType` which depends on `PostTier` enum — no changes needed. Verify by running:

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: type errors in components that reference old field names (`likes`, `comments`, `author.name`, `author.avatar`) — this is correct, we fix them in later tasks.

- [ ] **Step 3: Commit**

```bash
git add src/services/network/types.ts
git commit -m "feat: update API types to match real Mecenate API

Align Post, Author, Comment types with OpenAPI spec. Add response
types for post detail, likes, and comments endpoints."
```

---

### Task 2: Update NetworkService with proper typing

**Files:**
- Modify: `src/services/network/network.ts`

- [ ] **Step 1: Add return types and update getComments**

Replace the five API methods in `src/services/network/network.ts` (lines 80–108) with properly typed versions:

```typescript
  public getPosts = async (params: GetPostsParams) => {
    const res = await this.authorizedClient.get<GetPostsResponse>('/posts', {
      params,
    });

    return res.data;
  };

  public getPostById = async (postId: string) => {
    const res = await this.authorizedClient.get<PostDetailResponse>(`/posts/${postId}`);
    return res.data;
  };

  public toggleLikePost = async (postId: string) => {
    const res = await this.authorizedClient.post<LikeResponse>(`/posts/${postId}/like`);
    return res.data;
  };

  public getComments = async (postId: string, params?: GetCommentsParams) => {
    const res = await this.authorizedClient.get<CommentsResponse>(`/posts/${postId}/comments`, {
      params,
    });
    return res.data;
  };

  public createComment = async (postId: string, text: string) => {
    const res = await this.authorizedClient.post<CommentCreatedResponse>(`/posts/${postId}/comments`, {
      text,
    });
    return res.data;
  };
```

Also update the import line at the top to include all types:

```typescript
import {GetPostsResponse, GetPostsParams, PostDetailResponse, LikeResponse, CommentsResponse, CommentCreatedResponse, GetCommentsParams} from "@/services";
```

- [ ] **Step 2: Add getToken public method**

Add this method to the `NetworkService` class (used by WebSocket to get the raw UUID token):

```typescript
  public getToken(): string | null {
    return this.token;
  }
```

- [ ] **Step 3: Commit**

```bash
git add src/services/network/network.ts
git commit -m "feat: add return types to NetworkService methods

Type all API methods with proper response types. Update getComments
to accept pagination params. Add getToken for WebSocket auth."
```

---

### Task 3: Update colors and add QueryClientProvider

**Files:**
- Modify: `src/constants/colors.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add colors**

Add `red` and `lightGray` to `src/constants/colors.ts`:

```typescript
export const colors = {
    white: '#FFFFFF',
    gray: '#b4b4b4',
    lightGray: '#f0f0f0',
    black: '#000000',
    red: '#FF3B30',
}
```

- [ ] **Step 2: Wrap App with QueryClientProvider**

Replace `src/App.tsx`:

```typescript
import * as React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RootNavigator} from "@/navigation";
import {Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, useFonts} from "@expo-google-fonts/manrope";

const queryClient = new QueryClient();

export function App() {
  let [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/constants/colors.ts src/App.tsx
git commit -m "feat: add QueryClientProvider and extend color palette

Wrap app in QueryClientProvider. Add red and lightGray to colors."
```

---

### Task 4: Update PostCard for new types and navigation

**Files:**
- Modify: `src/components/PostCard/PostCard.types.ts`
- Modify: `src/components/PostCard/PostCard.tsx`
- Modify: `src/components/PostCard/PostCard.styles.ts`
- Modify: `src/screens/FeedScreen/FeedScreen.tsx`
- Modify: `src/screens/FeedScreen/FeedScreen.utils.ts`

- [ ] **Step 1: Update PostCard types**

Replace `src/components/PostCard/PostCard.types.ts`:

```typescript
import {Post} from "@/services";

export type PostCardProps = {
    post: Post;
    onPress: () => void;
}
```

- [ ] **Step 2: Update PostCard component**

Replace `src/components/PostCard/PostCard.tsx`:

```typescript
import {FC, memo} from "react";
import {View, Text, Image, Pressable} from 'react-native';

import {PostTier} from "@/constants";
import {useStyles} from "./PostCard.styles";
import {PostCardProps} from "./PostCard.types";

export const PostCard: FC<PostCardProps> = memo(({post, onPress}) => {
    const styles = useStyles();

    return (
        <View style={styles.container}>
            <Pressable onPress={onPress}>
                <View style={styles.userRow}>
                    <Image
                        source={{uri: post.author.avatarUrl}}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{post.author.displayName}</Text>
                </View>

                <Image
                    source={{uri: post.coverUrl}}
                    style={styles.postImage}
                />
            </Pressable>

            {post.tier === PostTier.Paid ? (
                <Text style={styles.preview}>🔒 Подпишитесь, чтобы увидеть пост</Text>
            ) : (
                <Text style={styles.preview}>{post.preview}</Text>
            )}

            <View style={styles.statsRow}>
                <Text style={styles.stat}>❤️ {post.likesCount}</Text>
                <Text style={styles.stat}>💬 {post.commentsCount}</Text>
            </View>
        </View>
    );
});

PostCard.displayName = 'PostCard';
```

- [ ] **Step 3: Update PostCard styles**

Replace `src/components/PostCard/PostCard.styles.ts`:

```typescript
import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    marginBottom: 16,
                },
                userRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                },
                avatar: {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                },
                userName: {
                    fontSize: 15,
                    lineHeight: 20,
                    fontFamily: 'Manrope_600SemiBold',
                },
                postImage: {
                    width: '100%',
                    aspectRatio: 1,
                },
                preview: {
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    fontSize: 14,
                    lineHeight: 20,
                    color: colors.black,
                    fontFamily: 'Manrope_400Regular',
                },
                statsRow: {
                    flexDirection: 'row',
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    gap: 16,
                },
                stat: {
                    fontSize: 14,
                    color: colors.gray,
                    fontFamily: 'Manrope_400Regular',
                },
            }),
        []
    );
};
```

- [ ] **Step 4: Update FeedScreen to pass onPress and use navigation**

Replace `src/screens/FeedScreen/FeedScreen.tsx`:

```typescript
import {useCallback, useMemo} from "react";
import {FlatList, ListRenderItemInfo, RefreshControl, Text} from 'react-native';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {networkService, Post} from "@/services";
import {RootStackParamList} from "@/types";
import {PostCard, ErrorView} from '@/components';
import {keyExtractor} from "./FeedScreen.utils";
import {THRESHOLD, GET_POSTS} from "./FeedScreen.constants";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FeedScreen'>;

export const FeedScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const {
        data,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isRefetching,
    } = useInfiniteQuery({
        initialPageParam: '',
        queryKey: [GET_POSTS],
        queryFn: ({pageParam}) =>
            networkService.getPosts({
                cursor: pageParam,
            }),
        getNextPageParam: (lastPage) => lastPage.data.nextCursor,
    });

    const posts = data?.pages.flatMap((p) => p.data.posts) ?? [];

    const ListFooterComponent = useMemo(
        () => (isFetchingNextPage ? <Text>Loading...</Text> : null),
        [isFetchingNextPage],
    );

    const renderItem = useCallback(
        ({item}: ListRenderItemInfo<Post>) => (
            <PostCard
                post={item}
                onPress={() => navigation.navigate('FeedDetailsScreen', {postId: item.id})}
            />
        ),
        [navigation],
    );

    const onEndReached = useCallback(() => {
        if (hasNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage]);

    if (isError) {
        return <ErrorView onRetry={refetch} />;
    }

    return (
        <FlatList
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReached={onEndReached}
            onEndReachedThreshold={THRESHOLD}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            ListFooterComponent={ListFooterComponent}
        />
    );
};
```

- [ ] **Step 5: Update FeedScreen utils import**

No change needed — `keyExtractor` uses `Post` from `@/services` which still exports `Post`. Verify:

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Update navigation types**

Replace `src/types/navigation.ts`:

```typescript
export type RootStackParamList = {
    FeedScreen: undefined;
    FeedDetailsScreen: { postId: string };
};
```

- [ ] **Step 7: Commit**

```bash
git add src/components/PostCard/ src/screens/FeedScreen/ src/types/navigation.ts
git commit -m "feat: update PostCard for new API types and add navigation

PostCard now uses avatarUrl, displayName, likesCount, commentsCount.
Cover and author row are pressable, navigating to FeedDetailsScreen
with postId. Stats row remains non-interactive."
```

---

### Task 5: Create WebSocket service

**Files:**
- Create: `src/services/websocket/types.ts`
- Create: `src/services/websocket/WebSocketService.ts`
- Create: `src/services/websocket/index.ts`
- Modify: `src/services/index.ts`

- [ ] **Step 1: Create WS event types**

Create `src/services/websocket/types.ts`:

```typescript
import {Comment} from "@/services/network/types";

export type WsLikeEvent = {
    type: 'like_updated';
    postId: string;
    likesCount: number;
};

export type WsCommentEvent = {
    type: 'comment_added';
    postId: string;
    comment: Comment;
};

export type WsPingEvent = {
    type: 'ping';
};

export type WsEvent = WsLikeEvent | WsCommentEvent | WsPingEvent;
```

- [ ] **Step 2: Create WebSocketService class**

Create `src/services/websocket/WebSocketService.ts`:

```typescript
import {WsEvent} from "./types";

const WS_URL = 'wss://k8s.mectest.ru/test-app/ws';

export class WebSocketService {
    private ws: WebSocket | null = null;
    private onEvent: ((event: WsEvent) => void) | null = null;

    connect(token: string, onEvent: (event: WsEvent) => void): void {
        this.disconnect();
        this.onEvent = onEvent;

        this.ws = new WebSocket(`${WS_URL}?token=${token}`);

        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const parsed = JSON.parse(event.data as string) as WsEvent;
                this.onEvent?.(parsed);
            } catch {
                // ignore malformed messages
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }
        this.onEvent = null;
    }
}

export const webSocketService = new WebSocketService();
```

- [ ] **Step 3: Create barrel export**

Create `src/services/websocket/index.ts`:

```typescript
export {webSocketService, WebSocketService} from './WebSocketService';
export * from './types';
```

- [ ] **Step 4: Update services barrel export**

Replace `src/services/index.ts`:

```typescript
export * from './network'
export * from './websocket'
```

- [ ] **Step 5: Commit**

```bash
git add src/services/websocket/ src/services/index.ts
git commit -m "feat: add WebSocket service for real-time events

WebSocketService class connects to WS endpoint with token auth,
parses like_updated, comment_added, and ping events. Singleton
instance exported for use in hooks."
```

---

### Task 6: Create usePostRealtime hook

**Files:**
- Create: `src/hooks/usePostRealtime.ts`
- Create: `src/hooks/index.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/usePostRealtime.ts`:

```typescript
import {useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import {networkService, webSocketService, PostDetailResponse, CommentsResponse, Comment} from '@/services';
import {WsEvent} from '@/services/websocket/types';

const POST_DETAIL_KEY = 'POST_DETAIL';
const COMMENTS_KEY = 'COMMENTS';

export const usePostRealtime = (postId: string) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = networkService.getToken();
        if (!token) return;

        const handler = (event: WsEvent) => {
            if (event.type === 'like_updated' && event.postId === postId) {
                queryClient.setQueryData<PostDetailResponse>(
                    [POST_DETAIL_KEY, postId],
                    (old) => {
                        if (!old) return old;
                        return {
                            ...old,
                            data: {
                                ...old.data,
                                post: {
                                    ...old.data.post,
                                    likesCount: event.likesCount,
                                },
                            },
                        };
                    },
                );
            }

            if (event.type === 'comment_added' && event.postId === postId) {
                queryClient.setQueryData<{ pages: CommentsResponse[]; pageParams: string[] }>(
                    [COMMENTS_KEY, postId],
                    (old) => {
                        if (!old) return old;

                        const allComments = old.pages.flatMap((p) => p.data.comments);
                        const isDuplicate = allComments.some((c: Comment) => c.id === event.comment.id);
                        if (isDuplicate) return old;

                        const firstPage = old.pages[0];
                        return {
                            ...old,
                            pages: [
                                {
                                    ...firstPage,
                                    data: {
                                        ...firstPage.data,
                                        comments: [event.comment, ...firstPage.data.comments],
                                    },
                                },
                                ...old.pages.slice(1),
                            ],
                        };
                    },
                );
            }
        };

        webSocketService.connect(token, handler);

        return () => {
            webSocketService.disconnect();
        };
    }, [postId, queryClient]);
};
```

- [ ] **Step 2: Create barrel export**

Create `src/hooks/index.ts`:

```typescript
export {usePostRealtime} from './usePostRealtime';
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add usePostRealtime hook for WebSocket integration

Connects WebSocket on mount, disconnects on unmount. Updates React
Query cache for like_updated (likesCount) and comment_added (prepend
to first page with duplicate check) events."
```

---

### Task 7: Create LikeButton component

**Files:**
- Create: `src/components/LikeButton/LikeButton.types.ts`
- Create: `src/components/LikeButton/LikeButton.styles.ts`
- Create: `src/components/LikeButton/LikeButton.tsx`
- Create: `src/components/LikeButton/index.ts`

- [ ] **Step 1: Create types**

Create `src/components/LikeButton/LikeButton.types.ts`:

```typescript
export type LikeButtonProps = {
    isLiked: boolean;
    likesCount: number;
    onPress: () => void;
};
```

- [ ] **Step 2: Create styles**

Create `src/components/LikeButton/LikeButton.styles.ts`:

```typescript
import {useMemo} from "react";
import {StyleSheet} from "react-native";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                },
                iconContainer: {
                    padding: 4,
                },
                countContainer: {
                    overflow: 'hidden',
                    height: 20,
                },
                countText: {
                    fontSize: 16,
                    lineHeight: 20,
                    fontFamily: 'Manrope_600SemiBold',
                },
            }),
        []
    );
};
```

- [ ] **Step 3: Create LikeButton component**

Create `src/components/LikeButton/LikeButton.tsx`:

```typescript
import {FC, useCallback, useEffect} from 'react';
import {Pressable, Text} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {colors} from '@/constants';
import {useStyles} from './LikeButton.styles';
import {LikeButtonProps} from './LikeButton.types';

export const LikeButton: FC<LikeButtonProps> = ({isLiked, likesCount, onPress}) => {
    const styles = useStyles();

    const scale = useSharedValue(1);
    const liked = useSharedValue(isLiked ? 1 : 0);
    const countTranslateY = useSharedValue(0);
    const countOpacity = useSharedValue(1);

    useEffect(() => {
        liked.value = withTiming(isLiked ? 1 : 0, {duration: 200});
    }, [isLiked, liked]);

    useEffect(() => {
        countOpacity.value = withSequence(
            withTiming(0, {duration: 100}),
            withTiming(1, {duration: 200}),
        );
        countTranslateY.value = withSequence(
            withTiming(-10, {duration: 100}),
            withTiming(10, {duration: 0}),
            withTiming(0, {duration: 200}),
        );
    }, [likesCount, countOpacity, countTranslateY]);

    const handlePress = useCallback(() => {
        scale.value = withSequence(
            withTiming(1.3, {duration: 150}),
            withTiming(1, {duration: 150}),
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [onPress, scale]);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{scale: scale.value}],
    }));

    const iconColorStyle = useAnimatedStyle(() => ({
        color: interpolateColor(liked.value, [0, 1], [colors.gray, colors.red]),
    }));

    const countAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: countTranslateY.value}],
        opacity: countOpacity.value,
    }));

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <Animated.Text style={[{fontSize: 24}, iconColorStyle]}>
                    {isLiked ? '❤️' : '🤍'}
                </Animated.Text>
            </Animated.View>
            <Animated.View style={[styles.countContainer, countAnimatedStyle]}>
                <Text style={styles.countText}>{likesCount}</Text>
            </Animated.View>
        </Pressable>
    );
};

LikeButton.displayName = 'LikeButton';
```

- [ ] **Step 4: Create barrel export**

Create `src/components/LikeButton/index.ts`:

```typescript
export {LikeButton} from './LikeButton';
```

- [ ] **Step 5: Commit**

```bash
git add src/components/LikeButton/
git commit -m "feat: add LikeButton with Reanimated animation and haptics

Scale bounce on press, color transition gray/red, counter slides
with fade on value change. Uses expo-haptics for tactile feedback."
```

---

### Task 8: Create CommentCard component

**Files:**
- Create: `src/components/CommentCard/CommentCard.types.ts`
- Create: `src/components/CommentCard/CommentCard.styles.ts`
- Create: `src/components/CommentCard/CommentCard.tsx`
- Create: `src/components/CommentCard/index.ts`

- [ ] **Step 1: Create types**

Create `src/components/CommentCard/CommentCard.types.ts`:

```typescript
import {Comment} from "@/services";

export type CommentCardProps = {
    comment: Comment;
};
```

- [ ] **Step 2: Create styles**

Create `src/components/CommentCard/CommentCard.styles.ts`:

```typescript
import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flexDirection: 'row',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    gap: 10,
                },
                avatar: {
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                },
                content: {
                    flex: 1,
                },
                header: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                },
                displayName: {
                    fontSize: 14,
                    fontFamily: 'Manrope_600SemiBold',
                    color: colors.black,
                },
                time: {
                    fontSize: 12,
                    color: colors.gray,
                    fontFamily: 'Manrope_400Regular',
                },
                text: {
                    fontSize: 14,
                    lineHeight: 20,
                    marginTop: 4,
                    color: colors.black,
                    fontFamily: 'Manrope_400Regular',
                },
            }),
        []
    );
};
```

- [ ] **Step 3: Create CommentCard component**

Create `src/components/CommentCard/CommentCard.tsx`:

```typescript
import {FC, memo} from "react";
import {View, Text, Image} from "react-native";

import {useStyles} from "./CommentCard.styles";
import {CommentCardProps} from "./CommentCard.types";

const getRelativeTime = (dateString: string): string => {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'только что';
    if (diffMin < 60) return `${diffMin} мин.`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ч.`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} д.`;
};

export const CommentCard: FC<CommentCardProps> = memo(({comment}) => {
    const styles = useStyles();

    return (
        <View style={styles.container}>
            <Image source={{uri: comment.author.avatarUrl}} style={styles.avatar} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.displayName}>{comment.author.displayName}</Text>
                    <Text style={styles.time}>{getRelativeTime(comment.createdAt)}</Text>
                </View>
                <Text style={styles.text}>{comment.text}</Text>
            </View>
        </View>
    );
});

CommentCard.displayName = 'CommentCard';
```

- [ ] **Step 4: Create barrel export**

Create `src/components/CommentCard/index.ts`:

```typescript
export {CommentCard} from './CommentCard';
```

- [ ] **Step 5: Update components barrel**

Replace `src/components/index.ts`:

```typescript
export * from './ErrorView'
export * from './PostCard'
export * from './Preloader'
export * from './LikeButton'
export * from './CommentCard'
```

- [ ] **Step 6: Commit**

```bash
git add src/components/CommentCard/ src/components/index.ts
git commit -m "feat: add CommentCard component with relative time

Displays comment author avatar, name, relative timestamp, and text.
Export LikeButton and CommentCard from components barrel."
```

---

### Task 9: Create PostDetailScreen

**Files:**
- Create: `src/screens/PostDetailScreen/PostDetailScreen.constants.ts`
- Create: `src/screens/PostDetailScreen/PostDetailScreen.styles.ts`
- Create: `src/screens/PostDetailScreen/PostDetailScreen.tsx`
- Create: `src/screens/PostDetailScreen/index.ts`

- [ ] **Step 1: Create constants**

Create `src/screens/PostDetailScreen/PostDetailScreen.constants.ts`:

```typescript
export const POST_DETAIL_KEY = 'POST_DETAIL';
export const COMMENTS_KEY = 'COMMENTS';
```

- [ ] **Step 2: Create styles**

Create `src/screens/PostDetailScreen/PostDetailScreen.styles.ts`:

```typescript
import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    backgroundColor: colors.white,
                },
                scrollContent: {
                    paddingBottom: 100,
                },
                header: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                },
                backButton: {
                    fontSize: 24,
                },
                headerTitle: {
                    fontSize: 18,
                    fontFamily: 'Manrope_700Bold',
                    flex: 1,
                },
                coverImage: {
                    width: '100%',
                    aspectRatio: 1,
                },
                authorRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 10,
                },
                authorAvatar: {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                },
                authorName: {
                    fontSize: 16,
                    fontFamily: 'Manrope_600SemiBold',
                },
                body: {
                    paddingHorizontal: 16,
                    fontSize: 15,
                    lineHeight: 22,
                    color: colors.black,
                    fontFamily: 'Manrope_400Regular',
                },
                paidPlaceholder: {
                    paddingHorizontal: 16,
                    paddingVertical: 24,
                    fontSize: 15,
                    color: colors.gray,
                    textAlign: 'center',
                    fontFamily: 'Manrope_400Regular',
                },
                likeSection: {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                },
                commentsSection: {
                    paddingTop: 16,
                },
                commentsSectionTitle: {
                    fontSize: 16,
                    fontFamily: 'Manrope_700Bold',
                    paddingHorizontal: 16,
                    marginBottom: 8,
                },
                loadMoreButton: {
                    paddingVertical: 12,
                    alignItems: 'center',
                },
                loadMoreText: {
                    fontSize: 14,
                    color: colors.gray,
                    fontFamily: 'Manrope_500Medium',
                },
                inputRow: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: colors.white,
                    borderTopWidth: 1,
                    borderTopColor: colors.lightGray,
                    gap: 8,
                },
                textInput: {
                    flex: 1,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.lightGray,
                    paddingHorizontal: 16,
                    fontSize: 14,
                    fontFamily: 'Manrope_400Regular',
                },
                sendButton: {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                },
                sendButtonText: {
                    fontSize: 14,
                    fontFamily: 'Manrope_600SemiBold',
                    color: colors.black,
                },
                sendButtonDisabled: {
                    opacity: 0.3,
                },
                centered: {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            }),
        []
    );
};
```

- [ ] **Step 3: Create PostDetailScreen component**

Create `src/screens/PostDetailScreen/PostDetailScreen.tsx`:

```typescript
import {useCallback, useState} from 'react';
import {View, Text, Image, ScrollView, Pressable, TextInput, ActivityIndicator} from 'react-native';
import {useQuery, useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';

import {networkService, PostDetailResponse, Comment} from '@/services';
import {RootStackParamList} from '@/types';
import {PostTier} from '@/constants';
import {LikeButton, CommentCard, ErrorView} from '@/components';
import {usePostRealtime} from '@/hooks';

import {POST_DETAIL_KEY, COMMENTS_KEY} from './PostDetailScreen.constants';
import {useStyles} from './PostDetailScreen.styles';

type DetailRouteProp = RouteProp<RootStackParamList, 'FeedDetailsScreen'>;

export const PostDetailScreen = () => {
    const styles = useStyles();
    const navigation = useNavigation();
    const route = useRoute<DetailRouteProp>();
    const {postId} = route.params;
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');

    usePostRealtime(postId);

    const {data: postData, isLoading: isPostLoading, isError: isPostError, refetch: refetchPost} = useQuery({
        queryKey: [POST_DETAIL_KEY, postId],
        queryFn: () => networkService.getPostById(postId),
    });

    const {
        data: commentsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: [COMMENTS_KEY, postId],
        initialPageParam: '',
        queryFn: ({pageParam}) =>
            networkService.getComments(postId, {cursor: pageParam || undefined}),
        getNextPageParam: (lastPage) => lastPage.data.nextCursor,
    });

    const likeMutation = useMutation({
        mutationFn: () => networkService.toggleLikePost(postId),
        onMutate: async () => {
            await queryClient.cancelQueries({queryKey: [POST_DETAIL_KEY, postId]});
            const previous = queryClient.getQueryData<PostDetailResponse>([POST_DETAIL_KEY, postId]);

            queryClient.setQueryData<PostDetailResponse>(
                [POST_DETAIL_KEY, postId],
                (old) => {
                    if (!old) return old;
                    const post = old.data.post;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            post: {
                                ...post,
                                isLiked: !post.isLiked,
                                likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
                            },
                        },
                    };
                },
            );

            return {previous};
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData([POST_DETAIL_KEY, postId], context.previous);
            }
        },
    });

    const commentMutation = useMutation({
        mutationFn: (text: string) => networkService.createComment(postId, text),
        onSuccess: () => {
            setCommentText('');
        },
    });

    const handleSendComment = useCallback(() => {
        const trimmed = commentText.trim();
        if (!trimmed) return;
        commentMutation.mutate(trimmed);
    }, [commentText, commentMutation]);

    const post = postData?.data.post;
    const comments: Comment[] = commentsData?.pages.flatMap((p) => p.data.comments) ?? [];

    if (isPostLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isPostError || !post) {
        return <ErrorView onRetry={refetchPost} />;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>←</Text>
                    </Pressable>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {post.title}
                    </Text>
                </View>

                <Image source={{uri: post.coverUrl}} style={styles.coverImage} />

                <View style={styles.authorRow}>
                    <Image source={{uri: post.author.avatarUrl}} style={styles.authorAvatar} />
                    <Text style={styles.authorName}>{post.author.displayName}</Text>
                </View>

                {post.tier === PostTier.Paid ? (
                    <Text style={styles.paidPlaceholder}>
                        🔒 Подпишитесь, чтобы увидеть пост
                    </Text>
                ) : (
                    <Text style={styles.body}>{post.body}</Text>
                )}

                <View style={styles.likeSection}>
                    <LikeButton
                        isLiked={post.isLiked}
                        likesCount={post.likesCount}
                        onPress={() => likeMutation.mutate()}
                    />
                </View>

                <View style={styles.commentsSection}>
                    <Text style={styles.commentsSectionTitle}>
                        Комментарии ({post.commentsCount})
                    </Text>

                    {comments.map((comment) => (
                        <CommentCard key={comment.id} comment={comment} />
                    ))}

                    {hasNextPage && (
                        <Pressable
                            style={styles.loadMoreButton}
                            onPress={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                        >
                            <Text style={styles.loadMoreText}>
                                {isFetchingNextPage ? 'Загрузка...' : 'Загрузить ещё'}
                            </Text>
                        </Pressable>
                    )}
                </View>
            </ScrollView>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Написать комментарий..."
                    value={commentText}
                    onChangeText={setCommentText}
                    maxLength={500}
                />
                <Pressable
                    style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                    onPress={handleSendComment}
                    disabled={!commentText.trim() || commentMutation.isPending}
                >
                    <Text style={styles.sendButtonText}>Отправить</Text>
                </Pressable>
            </View>
        </View>
    );
};
```

- [ ] **Step 4: Create barrel export**

Create `src/screens/PostDetailScreen/index.ts`:

```typescript
export {PostDetailScreen} from './PostDetailScreen';
```

- [ ] **Step 5: Commit**

```bash
git add src/screens/PostDetailScreen/
git commit -m "feat: add PostDetailScreen with likes, comments, and real-time

Full post view with animated like button (optimistic updates),
paginated comments with load-more, comment input, and WebSocket
real-time integration via usePostRealtime hook."
```

---

### Task 10: Wire up navigation and final integration

**Files:**
- Modify: `src/navigation/RootNavigator/RootNavigator.tsx`

- [ ] **Step 1: Update RootNavigator**

Replace `src/navigation/RootNavigator/RootNavigator.tsx`:

```typescript
import React from 'react'
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator, NativeStackNavigationOptions} from "@react-navigation/native-stack";

import {Preloader} from '@/components'
import {RootStackParamList} from "@/types";
import {FeedScreen} from "@/screens/FeedScreen";
import {PostDetailScreen} from "@/screens/PostDetailScreen";

import {useStyles} from './RootNavigator.styles'

const Stack = createNativeStackNavigator<RootStackParamList>()

const customOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animationTypeForReplace: 'push',
}

export const RootNavigator = () => {
    const styles = useStyles()

    return (
        <NavigationContainer fallback={<Preloader style={styles.preloader} />}>
            <Stack.Navigator screenOptions={customOptions}>
                <Stack.Screen name="FeedScreen" component={FeedScreen} />
                <Stack.Screen name="FeedDetailsScreen" component={PostDetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/navigation/RootNavigator/RootNavigator.tsx
git commit -m "feat: wire PostDetailScreen into navigation

FeedDetailsScreen now routes to PostDetailScreen with postId param.
Complete integration of feed -> detail -> real-time updates flow."
```

---

### Task 11: Sync query keys between PostDetailScreen and usePostRealtime

The hook `usePostRealtime.ts` defines its own `POST_DETAIL_KEY` and `COMMENTS_KEY` constants, and so does `PostDetailScreen.constants.ts`. They must use the same values.

**Files:**
- Modify: `src/hooks/usePostRealtime.ts`

- [ ] **Step 1: Import constants from PostDetailScreen**

In `src/hooks/usePostRealtime.ts`, replace the local constant declarations:

```typescript
const POST_DETAIL_KEY = 'POST_DETAIL';
const COMMENTS_KEY = 'COMMENTS';
```

with an import:

```typescript
import {POST_DETAIL_KEY, COMMENTS_KEY} from '@/screens/PostDetailScreen/PostDetailScreen.constants';
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePostRealtime.ts
git commit -m "fix: share query key constants between hook and screen

Import POST_DETAIL_KEY and COMMENTS_KEY from PostDetailScreen
constants to ensure cache updates target the correct queries."
```

---

### Task 12: Run app and smoke test

- [ ] **Step 1: Start the dev server**

```bash
npx expo start
```

- [ ] **Step 2: Manual smoke test checklist**

Open the app on a simulator or device and verify:

1. Feed loads with posts (avatarUrl, displayName, likesCount, commentsCount visible)
2. Tapping post cover navigates to Post Detail screen
3. Post Detail shows full post content, cover, author
4. Like button animates (scale bounce, color change) and shows haptic feedback
5. Like count updates optimistically on press
6. Comments load on Post Detail screen
7. "Загрузить ещё" button loads more comments
8. Sending a comment clears the input
9. WebSocket events update likes count and add new comments in real-time
10. Back button returns to feed

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address smoke test findings"
```
