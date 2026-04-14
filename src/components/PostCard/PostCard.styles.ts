import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    marginBottom: 16,
                },
                userRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
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
                postImage: {
                    width: '100%',
                    aspectRatio: 1,
                },
                preview: {
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    fontSize: 14,
                    lineHeight: 20,
                    color: colors.black,
                    fontFamily: 'Manrope_400Regular',
                },
                statsRow: {
                    flexDirection: 'row',
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    gap: 16,
                },
                stat: {
                    fontSize: 14,
                    color: colors.gray,
                    fontFamily: 'Manrope_400Regular',
                },
            }),
        []
    );
};
