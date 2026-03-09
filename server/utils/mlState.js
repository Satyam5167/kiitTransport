let latestAllocation = null;

export const setLatestAllocation = (data) => {
    latestAllocation = data;
};

export const getLatestAllocation = () => {
    return latestAllocation;
};