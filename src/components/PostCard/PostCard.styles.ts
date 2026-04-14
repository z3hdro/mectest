import {useMemo} from "react";
import {Dimensions, StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    marginBottom: 16,
                    backgroundColor: colors.white,
                    paddingVertical: 16,
                },
                userRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                },
                avatar: {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                },
                userName: {
                    fontSize: 15,
                    lineHeight: 20,
                    fontFamily: 'Manrope_600SemiBold',
                },
                imageWrapper: {
                    width: '100%',
                    height: Dimensions.get("window").width,
                    position: 'relative',
                },
                postImage: {
                    width: '100%',
                    aspectRatio: 1,
                    zIndex: 5
                },
                info: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                },
                title: {
                    fontSize: 18,
                    lineHeight: 26,
                    fontFamily: 'Manrope_700Bold',
                    color: colors.dark
                },
                description: {
                    fontSize: 15,
                    lineHeight: 20,
                    fontFamily: 'Manrope_500Medium',
                    color: colors.dark
                },
                statsRow: {
                    flexDirection: 'row',
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    gap: 16,
                },
                chip: {
                    padding: 6,
                    paddingRight: 12,
                    backgroundColor: colors.chipBackground,
                    borderRadius: 9999,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4
                },
                stat: {
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.disabledGray,
                    fontFamily: 'Manrope_700Bold',
                },
                skeleton: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                },
                skeletonTitle: {
                    height: 26,
                    width: '40%',
                    backgroundColor: colors.skeleton,
                    borderRadius: 22,
                },
                skeletonDescription: {
                    height: 40,
                    width: '100%',
                    backgroundColor: colors.skeleton,
                    borderRadius: 22,
                },
            }),
        []
    );
};
