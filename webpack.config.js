import path  from 'path'
import MiniCssExtractPlugin  from 'mini-css-extract-plugin'


export default {
    mode  : 'production',
    entry : [
        './lib/index.js',
        './src/assets/scss/geoportal-leaflet-routing.scss',
    ],
    output: {
        path         : path.resolve('./dist'),
        publicPath   : 'dist/',
        filename     : '[name].js',
        // libraryTarget: 'umd'
    },
    plugins: [new MiniCssExtractPlugin({
        filename: "[name].css" // change this RELATIVE to your output.path!
    })],
    module: {
        rules: [
            /*{
                test   : /\.(png|jpg|gif|svg)$/,
                loader : 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]',
                    outputPath: 'assets/images/',
                    publicPath: 'assets/images/'
                }
            },*/
            {
                test   : /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use    : [
                    // {
                    //     loader: 'file-loader',
                    //     options: { outputPath: 'assets/', name: '[name].[ext]?[hash]'}
                    // },
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: true,
                            esModule: false
                        }
                    },
                    {
                        loader : 'postcss-loader',
                        options: {
                            sourceMap: true,
                            postcssOptions   : {
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
                test:/\.(svg|jpg|png|gif)$/,
                use: [{
                    loader:'file-loader',
                    options: {
                        publicPath: 'img',
                        outputPath: 'img',
                        name: '[name].[ext]',
                        esModule: false
                    }
                }],
            },
        ]
    },
}
