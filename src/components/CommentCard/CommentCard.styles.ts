import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flexDirection: 'row',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    gap: 10,
                },
                avatar: {
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                },
                content: {
                    flex: 1,
                },
                header: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                },
                displayName: {
                    fontSize: 14,
                    fontFamily: 'Manrope_600SemiBold',
                    color: colors.black,
                },
                time: {
                    fontSize: 12,
                    color: colors.gray,
                    fontFamily: 'Manrope_400Regular',
                },
                text: {
                    fontSize: 14,
                    lineHeight: 20,
                    marginTop: 4,
                    color: colors.black,
                    fontFamily: 'Manrope_400Regular',
                },
            }),
        []
    );
};
