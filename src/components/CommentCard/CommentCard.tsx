import {FC, memo} from "react";
import {View, Text, Image} from "react-native";

import { getRelativeTime } from "./CommentCard.utils";
import {useStyles} from "./CommentCard.styles";
import {CommentCardProps} from "./CommentCard.types";

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
