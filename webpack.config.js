const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { execSync } = require("child_process");

const isDevelopment = process.env.NODE_ENV !== "production";

// Build ckPayment-web3 first
class BuildCkPaymentPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync('BuildCkPaymentPlugin', (compilation, callback) => {
      console.log('🔨 Building ckPayment-web3...');
      try {
        execSync('npm run build', { 
          cwd: path.join(__dirname, 'ckPayment-web3'),
          stdio: 'inherit'
        });
        console.log('✅ ckPayment-web3 build completed');
        callback();
      } catch (error) {
        console.error('❌ ckPayment-web3 build failed:', error.message);
        callback(error);
      }
    });
    
    compiler.hooks.watchRun.tapAsync('BuildCkPaymentPlugin', (compilation, callback) => {
      console.log('🔨 Rebuilding ckPayment-web3...');
      try {
        execSync('npm run build', { 
          cwd: path.join(__dirname, 'ckPayment-web3'),
          stdio: 'inherit'
        });
        console.log('✅ ckPayment-web3 rebuild completed');
        callback();
      } catch (error) {
        console.error('❌ ckPayment-web3 rebuild failed:', error.message);
        callback(error);
      }
    });
  }
}

module.exports = {
  target: "web",
  mode: isDevelopment ? "development" : "production",
  entry: {
    // Use the built ckPayment-web3 as main entry
    index: path.join(__dirname, "src", "SDK", "ckPay.js")
  },
  devtool: isDevelopment ? "source-map" : false,
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
      crypto: false // Add this to handle the crypto warning
    },
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, "dist"),
    library: '[name]',
    libraryTarget: 'umd'
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
                // Explicit config if not finding postcss.config.js
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
      // Add image file loader
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      },
      // Add font file loader
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
    new BuildCkPaymentPlugin(),
    new webpack.EnvironmentPlugin([
      ...Object.keys(process.env).filter((key) => key.includes("CANISTER") || key.includes("DFX")),
    ]),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve("buffer/"), "Buffer"],
      process: require.resolve("process/browser"),
    }),
    new CopyPlugin({
      patterns: [
        // Copy the entire ckPayment-web3 build to dist (excluding the conflicting index.html)
        {
          from: "ckPayment-web3/dist",
          to: ".",
          noErrorOnMissing: false,
          globOptions: {
            ignore: ["**/index.html"]
          }
        },
        // Copy the index.html specifically and modify it to include our SDK bundle
        {
          from: "ckPayment-web3/dist/index.html",
          to: "index.html",
          noErrorOnMissing: false,
        },
        // Copy .ic-assets.json if exists
        {
          from: "ckPayment-web3/dist/.ic-assets.json*",
          to: ".ic-assets.json5",
          noErrorOnMissing: true,
        }
      ],
    }),
  ],
  devServer: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },
    },
    static: path.resolve(__dirname, "ckPayment-web3/dist"),
    hot: true,
    watchFiles: [path.resolve(__dirname, "ckPayment-web3")],
    liveReload: true,
  },
};