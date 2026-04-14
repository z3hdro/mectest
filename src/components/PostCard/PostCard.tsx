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
