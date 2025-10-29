module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['../..'],
          alias: {
            '@': '../../client/src',
            '@stocksprout/shared': '../../packages/shared/src',
            '@stocksprout/hooks': '../../packages/hooks/src',
            '@stocksprout/components': '../../packages/components/src',
            'wouter': '../../apps/mobile/src/navigation/wouter-compat',
          },
        },
      ],
    ],
  };
};
