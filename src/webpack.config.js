module.exports = {
    module: {
        rules: [
            {
                test: /\.dxf$/,
                use: "raw-loader", // Legge i file come stringa di testo
            },
        ],
    },
};