const path = require("path");

module.exports = {
    entry: "./src/DXFViewer.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "DXFViewer.js",
        library: "DXFViewer",
        libraryTarget: "umd", // Modulo universale: compatibile con CommonJS, AMD e browser globali
        globalObject: "this",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    resolve: {
        extensions: [".js"],
    },
    mode: "production",
};