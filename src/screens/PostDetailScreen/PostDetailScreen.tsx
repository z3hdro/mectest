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
