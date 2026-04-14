export const getRelativeTime = (dateString: string): string => {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) {
        return 'только что'
    }

    if (diffMin < 60) {
        return `${diffMin} мин.`
    }

    const diffHours = Math.floor(diffMin / 60);

    if (diffHours < 24) {
        return `${diffHours} ч.`
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays} д.`;
};