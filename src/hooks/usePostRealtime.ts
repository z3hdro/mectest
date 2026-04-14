import {useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import {networkService, webSocketService, PostDetailResponse, CommentsResponse, Comment} from '@/services';
import {WsEvent} from '@/services/websocket/types';
import {POST_DETAIL_KEY, COMMENTS_KEY} from '@/screens/PostDetailScreen/PostDetailScreen.constants';

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
