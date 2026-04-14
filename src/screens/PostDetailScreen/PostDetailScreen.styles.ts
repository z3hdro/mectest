import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    backgroundColor: colors.white,
                },
                scrollContent: {
                    paddingBottom: 100,
                },
                header: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                },
                backButton: {
                    fontSize: 24,
                },
                headerTitle: {
                    fontSize: 18,
                    fontFamily: 'Manrope_700Bold',
                    flex: 1,
                },
                coverImage: {
                    width: '100%',
                    aspectRatio: 1,
                },
                authorRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 10,
                },
                authorAvatar: {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                },
                authorName: {
                    fontSize: 16,
                    fontFamily: 'Manrope_600SemiBold',
                },
                info: {
                    paddingHorizontal: 16,
                    alignItems: 'flex-start',
                    gap: 12,
                },
                title: {
                    fontFamily: 'Manrope_700Bold',
                    fontSize: 18,
                    lineHeight: 26,
                    color: colors.dark
                },
                body: {
                    paddingHorizontal: 16,
                    fontSize: 15,
                    lineHeight: 20,
                    color: colors.dark,
                    fontFamily: 'Manrope_500Medium',
                },
                paidPlaceholder: {
                    paddingHorizontal: 16,
                    paddingVertical: 24,
                    fontSize: 15,
                    color: colors.gray,
                    textAlign: 'center',
                    fontFamily: 'Manrope_400Regular',
                },
                likeSection: {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    gap: 4,
                },
                commentsSection: {
                    paddingTop: 16,
                },
                commentsSectionTitle: {
                    fontSize: 16,
                    fontFamily: 'Manrope_700Bold',
                    paddingHorizontal: 16,
                    marginBottom: 8,
                },
                loadMoreButton: {
                    paddingVertical: 12,
                    alignItems: 'center',
                },
                loadMoreText: {
                    fontSize: 14,
                    color: colors.gray,
                    fontFamily: 'Manrope_500Medium',
                },
                inputRow: {
                    position: 'absolute',
                    bottom: 24,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: colors.white,
                    borderTopWidth: 1,
                    borderTopColor: colors.lightGray,
                    gap: 8,
                },
                textInput: {
                    flex: 1,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.white,
                    paddingHorizontal: 16,
                    fontSize: 15,
                    lineHeight: 20,
                    fontFamily: 'Manrope_500Medium',
                    borderWidth: 2,
                    borderColor: colors.chipBackground,
                },
                sendButton: {
                    padding: 8,
                },
                sendButtonText: {
                    fontSize: 14,
                    fontFamily: 'Manrope_600SemiBold',
                    color: colors.black,
                },
                sendButtonDisabled: {
                    opacity: 0.3,
                },
                centered: {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
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
            }),
        []
    );
};
