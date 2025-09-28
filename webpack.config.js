const deepmerge = require('deepmerge');
const path = require('path');
const { isPlainObject } = require('is-plain-object');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const merge = (target, source) =>
    deepmerge(target, source, { isMergeableObject: v => isPlainObject(v) || v instanceof Array });

const common = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
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
    merge(common, {
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
    }),

    // Content Script for ChatGPT
    merge(common, {
        entry: './src/front/index.ts',
        output: {
            filename: 'content-chatgpt.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }),

    // Background script
    merge(common, {
        entry: './src/worker/index.ts',
        output: {
            filename: 'background-worker.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }),

    // Extension popup
    merge(common, {
        entry: './src/popup/index.tsx',
        output: {
            filename: 'popup.js',
            path: path.resolve(__dirname, 'dist'),
        },

        module: {
            rules: [
                {
                    test: /\.module\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                esModule: false,
                                modules: { localIdentName: '[name]--[local]--[hash:base64:5]' },
                            },
                        },
                    ],
                }
            ]
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: 'popup.css',
            })
        ]
    })
];
