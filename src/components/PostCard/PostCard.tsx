import {FC, memo} from "react";
import {View, Text, Image, Pressable} from 'react-native';

import {colors, PostTier} from "@/constants";
import {DonateCurtain, Icon, LikeButton} from "@/components";
import {COMMENT_ICON_SIZE} from "./PostCard.constants";
import {useStyles} from "./PostCard.styles";
import {PostCardProps} from "./PostCard.types";
import { useTogglePost } from "@/hooks";

export const PostCard: FC<PostCardProps> = memo(({post, onPress}) => {
    const styles = useStyles();

    const likeMutation = useTogglePost(post.id);

    const isPaid = post.tier === PostTier.Paid

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

                <View style={styles.imageWrapper}>
                    {isPaid && (
                        <DonateCurtain />
                    )}
                    <Image
                        source={{uri: post.coverUrl}}
                        style={styles.postImage}
                    />
                </View>

            </Pressable>

            {isPaid ? (
                <View style={styles.skeleton}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonDescription} />
                </View>
            ) : (
                <View style={styles.info}>
                    <Text style={styles.title}>{post.title}</Text>
                    <Text style={styles.description}>{post.preview}</Text>
                </View>
            )}

            {!isPaid && (
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
            )}

        </View>
    );
});

PostCard.displayName = 'PostCard';
