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
