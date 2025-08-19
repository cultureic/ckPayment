const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

// Load environment variables from .env file
require('dotenv').config();

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  target: "web",
  mode: isDevelopment ? "development" : "production",
  entry: {
    cdkPay: path.join(__dirname, "src", "SDK", "ckPay.js")
  },
  devtool: isDevelopment ? "source-map" : "source-map",
  optimization: {
    minimize: !isDevelopment,
    minimizer: [new TerserPlugin()],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      events: require.resolve("events/"),
      stream: require.resolve("stream-browserify/"),
      util: require.resolve("util/"),
      crypto: false
    },
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, "bundleSDK/"),
    library: '[name]',
    libraryTarget: 'umd',
    clean: true // This will clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      }
    ],
  },
  plugins: [
    new (require("webpack")).EnvironmentPlugin([
      ...Object.keys(process.env).filter((key) => key.includes("CANISTER") || key.includes("DFX")),
    ]),
    new (require("webpack")).ProvidePlugin({
      Buffer: [require.resolve("buffer/"), "Buffer"],
      process: require.resolve("process/browser"),
    }),
  ],
};
