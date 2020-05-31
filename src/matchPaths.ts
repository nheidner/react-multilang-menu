export default (...paths: [string, string]): boolean => {
    for (const key in paths) {
        if (typeof paths[key] !== 'string') {
            return false;
        }
        // remove traling slash and convert to lower case
        paths[key] = paths[key].replace(/\/$/, '').toLowerCase();
    }
    return paths[0].localeCompare(paths[1]) === 0;
};
