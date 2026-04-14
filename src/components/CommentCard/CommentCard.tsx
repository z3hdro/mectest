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
