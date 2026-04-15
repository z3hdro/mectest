import {useCallback, useState} from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    Pressable,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {InfiniteData, useQuery, useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigation, useRoute} from '@react-navigation/native';

import {networkService, Comment, PostDetailResponse, GetPostsResponse} from '@/services';
import {POST_DETAIL_KEY, COMMENTS_KEY, colors} from '@/constants';
import {GET_POSTS} from '@/screens/FeedScreen/FeedScreen.constants';
import {LikeButton, CommentCard, ErrorView, Icon} from '@/components';
import {usePostRealtime, useTogglePost} from '@/hooks';
import {EDGES, MAX_COMMENT_LENGTH, COMMENT_ICON_SIZE, SEND_ICON_SIZE} from "./PostDetailsScreen.constants";
import {useStyles} from './PostDetailScreen.styles';
import { DetailRouteProp } from "./PostDetailScreen.types";

export const PostDetailScreen = () => {
    const styles = useStyles();
    const navigation = useNavigation();
    const route = useRoute<DetailRouteProp>();
    const {postId} = route.params;
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');

    usePostRealtime(postId);

    const likeMutation = useTogglePost(postId);

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

    const {mutate: mutateComment, isPending: commentMutateIsPending} = useMutation({
        mutationFn: (text: string) => networkService.createComment(postId, text),
        onSuccess: () => {
            setCommentText('');

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
                                commentsCount: old.data.post.commentsCount + 1,
                            },
                        },
                    };
                },
            );

            queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
                [GET_POSTS],
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: {
                                ...page.data,
                                posts: page.data.posts.map((post) =>
                                    post.id === postId
                                        ? {
                                            ...post,
                                            commentsCount: post.commentsCount + 1,
                                        }
                                        : post,
                                ),
                            },
                        })),
                    };
                },
            );
        },
    });

    const handleSendComment = useCallback(() => {
        const trimmed = commentText.trim();

        if (!trimmed) {
            return
        }

        mutateComment(trimmed);
    }, [commentText, mutateComment]);

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
        <SafeAreaView style={styles.container} edges={EDGES}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Pressable onPress={navigation.goBack}>
                        <Text style={styles.backButton}>←</Text>
                    </Pressable>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {post.title}
                    </Text>
                </View>

                <View style={styles.authorRow}>
                    <Image source={{uri: post.author.avatarUrl}} style={styles.authorAvatar} />
                    <Text style={styles.authorName}>{post.author.displayName}</Text>
                </View>

                <Image source={{uri: post.coverUrl}} style={styles.coverImage} />

                <View style={styles.info}>
                    <Text style={styles.title}>{post.title}</Text>
                    <Text style={styles.body}>{post.body}</Text>
                </View>

                <View style={styles.statsRow}>
                    <LikeButton
                        isLiked={post.isLiked}
                        likesCount={post.likesCount}
                        onPress={() => likeMutation.mutate()}
                        disabled={likeMutation.isPending}
                    />

                    <View style={styles.chip}>
                        <Icon name={"comment"} width={COMMENT_ICON_SIZE} height={COMMENT_ICON_SIZE} color={colors.disabledGray} />

                        <Text style={styles.stat}>{post.commentsCount}</Text>
                    </View>
                </View>

                <View style={styles.commentsSection}>
                    <Text style={styles.commentsSectionTitle}>
                        {post.commentsCount} {post.commentsCount > 1 ? 'комментария' : 'комментарий'}
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

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputRow}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Ваш комментарий"
                    value={commentText}
                    onChangeText={setCommentText}
                    maxLength={MAX_COMMENT_LENGTH}
                />
                <Pressable
                    style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                    onPress={handleSendComment}
                    disabled={!commentText.trim() || commentMutateIsPending}
                >
                    <Icon name={"send"} width={SEND_ICON_SIZE} height={SEND_ICON_SIZE} />
                </Pressable>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
