const error_missing = (params) => {
    return {
        status: false,
        message: `Required parameters: ${params}`,
    };
};

module.exports = {
    error_missing
}