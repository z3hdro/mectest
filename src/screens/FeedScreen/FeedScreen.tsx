import {useCallback, useMemo} from "react";
import {FlatList, ListRenderItemInfo, RefreshControl, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';

import {networkService, Post} from '@/services';
import {PostCard, ErrorView, Preloader} from '@/components';
import {keyExtractor} from './FeedScreen.utils';
import {THRESHOLD, GET_POSTS, EDGES} from './FeedScreen.constants';
import { useStyles } from './FeedScreen.styles';

import { NavigationProp } from "./FeedScreen.types";
import {PostTier} from "@/constants";

export const FeedScreen = () => {
    const styles = useStyles();
    const navigation = useNavigation<NavigationProp>();

    const {
        data,
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isRefetching,
        isPending,
    } = useInfiniteQuery({
        initialPageParam: '',
        queryKey: [GET_POSTS],
        queryFn: ({pageParam}) =>
            networkService.getPosts({
                cursor: pageParam || undefined,
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
                onPress={() => {
                    if (item.tier === PostTier.Free) {
                        navigation.navigate('FeedDetailsScreen', {postId: item.id})
                    }
                }}
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
        <SafeAreaView style={styles.container} edges={EDGES}>
            {(isLoading || isPending || isRefetching) && (
                <Preloader style={styles.preloader} />
            )}
            <FlatList
                data={posts}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onEndReached={onEndReached}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={THRESHOLD}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListFooterComponent={ListFooterComponent}
            />
        </SafeAreaView>
    );
};
