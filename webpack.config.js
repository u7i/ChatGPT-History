const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const common = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    optimization: {
        minimize: false
    },
    target: ['web']
}

module.exports = [
    {
        entry: './src/dummy.js',
        output: {
            filename: 'ignore.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            new CopyWebpackPlugin({
                patterns: [{ from: 'public' }]
            })
        ],
    },

    // Content Script for ChatGPT
    {
        entry: './src/front/index.ts',
        output: {
            filename: 'content-chatgpt.js',
            path: path.resolve(__dirname, 'dist'),
        },
        ...common
    },

    // Background script
    {
        entry: './src/worker/index.ts',
        output: {
            filename: 'background-worker.js',
            path: path.resolve(__dirname, 'dist'),
        },
        ...common
    },

    // Extension popup
    {
        entry: './src/popup/index.tsx',
        output: {
            filename: 'popup.js',
            path: path.resolve(__dirname, 'dist'),
        },
        ...common
    }
];