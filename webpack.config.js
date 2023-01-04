import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'


export default {
    mode   : 'production',
    entry  : [
        './lib/index.js',
        './src/assets/scss/geoportal-leaflet-routing.scss',
    ],
    output : {
        path      : path.resolve('./dist'),
        publicPath: 'dist/',
        filename  : '[name].js',
    },
    plugins: [new MiniCssExtractPlugin({
        filename: "[name].css" // change this RELATIVE to your output.path!
    })],
    module : {
        rules: [
            {
                test   : /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use    : [
                    MiniCssExtractPlugin.loader,
                    {
                        loader : 'css-loader',
                        options: {
                            url     : true,
                            esModule: false
                        }
                    },
                    {
                        loader : 'postcss-loader',
                        options: {
                            sourceMap     : true,
                            postcssOptions: {
                                path: 'postcss.config.js'
                            }
                        }
                    },

                    {
                        loader: 'sass-loader', options: {sourceMap: true}
                    }
                ],
            },
            {
                test: /\.(svg|jpg|png|gif)$/,
                use : [{
                    loader : 'file-loader',
                    options: {
                        publicPath: 'img',
                        outputPath: 'img',
                        name      : '[name].[ext]',
                        esModule  : false
                    }
                }],
            },

            {
                test: /\.m?js/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
                type   : "javascript/auto",
                resolve: {
                    fullySpecified: false,
                },
            },
            // {
            //     test: /\.m?js/,
            //     resolve: {
            //         fullySpecified: false,
            //     },
            // },
        ]
    },
}
