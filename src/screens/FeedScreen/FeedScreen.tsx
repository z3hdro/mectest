import {useCallback, useMemo} from "react";
import {FlatList, ListRenderItemInfo, RefreshControl, Text} from 'react-native';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {networkService, Post} from "@/services";
import {RootStackParamList} from "@/types";
import {PostCard, ErrorView} from '@/components';
import {keyExtractor} from "./FeedScreen.utils";
import {THRESHOLD, GET_POSTS} from "./FeedScreen.constants";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FeedScreen'>;

export const FeedScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const {
        data,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isRefetching,
    } = useInfiniteQuery({
        initialPageParam: '',
        queryKey: [GET_POSTS],
        queryFn: ({pageParam}) =>
            networkService.getPosts({
                cursor: pageParam,
            }),
        getNextPageParam: (lastPage) => lastPage.data.nextCursor,
    });

    const posts = data?.pages.flatMap((p) => p.data.posts) ?? [];

    const ListFooterComponent = useMemo(
        () => (isFetchingNextPage ? <Text>Loading...</Text> : null),
        [isFetchingNextPage],
    );

    const renderItem = useCallback(
        ({item}: ListRenderItemInfo<Post>) => (
            <PostCard
                post={item}
                onPress={() => navigation.navigate('FeedDetailsScreen', {postId: item.id})}
            />
        ),
        [navigation],
    );

    const onEndReached = useCallback(() => {
        if (hasNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage]);

    if (isError) {
        return <ErrorView onRetry={refetch} />;
    }

    return (
        <FlatList
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReached={onEndReached}
            onEndReachedThreshold={THRESHOLD}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            ListFooterComponent={ListFooterComponent}
        />
    );
};
