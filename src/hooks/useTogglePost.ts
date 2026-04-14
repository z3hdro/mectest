import {InfiniteData, useMutation, useQueryClient} from "@tanstack/react-query";
import {GetPostsResponse, networkService, PostDetailResponse} from "@/services";
import {POST_DETAIL_KEY} from "@/constants";
import {GET_POSTS} from "@/screens/FeedScreen/FeedScreen.constants";

export const useTogglePost = (postId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => networkService.toggleLikePost(postId),
        onMutate: async () => {
            await queryClient.cancelQueries({queryKey: [POST_DETAIL_KEY, postId]});
            await queryClient.cancelQueries({queryKey: [GET_POSTS]});

            const previousDetail = queryClient.getQueryData<PostDetailResponse>([POST_DETAIL_KEY, postId]);
            const previousPosts = queryClient.getQueryData<InfiniteData<GetPostsResponse>>([GET_POSTS]);

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
                                            isLiked: !post.isLiked,
                                            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
                                        }
                                        : post,
                                ),
                            },
                        })),
                    };
                },
            );

            return {previousDetail, previousPosts};
        },
        onError: (_err, _vars, context) => {
            if (context?.previousDetail) {
                queryClient.setQueryData([POST_DETAIL_KEY, postId], context.previousDetail);
            }
            if (context?.previousPosts) {
                queryClient.setQueryData([GET_POSTS], context.previousPosts);
            }
        },
    });
}