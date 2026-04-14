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
