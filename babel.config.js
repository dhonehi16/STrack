module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@/api': './src/api',
          '@/components': './src/components',
          '@/navigation': './src/navigation',
          '@/types': './src/types',
          '@/utils': './src/utils',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
  ],
};
