const path = require("path");
module.exports = {
    context: __dirname,
    entry: "./src/main.ts",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/"
    },
    mode: "development",

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader"
                }
            },
            {
                test: /\.wgsl$/,
                use: {
                    loader: "ts-shader-loader"
                }
            }
        ]
    },
    
    resolve: {
        extensions: [".ts"],
        alias: {
            "@engine": path.resolve(__dirname, 'src/engine/'),
            "@renderer": path.resolve(__dirname, 'src/engine/renderer/'),
            "@math": path.resolve(__dirname, 'src/engine/math/src/index.js'),
        },
    }
}