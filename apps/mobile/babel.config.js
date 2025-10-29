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
            'lucide-react': '../../apps/mobile/src/lucide-react-compat',
            '@/components/ui/dialog': '../../apps/mobile/src/components-ui-compat/dialog',
            '@/components/ui/card': '../../apps/mobile/src/components-ui-compat/card',
            '@/components/ui/button': '../../apps/mobile/src/components-ui-compat/button',
            '@/components/ui/input': '../../apps/mobile/src/components-ui-compat/input',
            '@/components/ui/badge': '../../apps/mobile/src/components-ui-compat/badge',
            '@/components/ui/avatar': '../../apps/mobile/src/components-ui-compat/avatar',
            '@/components/ui/label': '../../apps/mobile/src/components-ui-compat/label',
            '@/components/ui/alert': '../../apps/mobile/src/components-ui-compat/alert',
            '@/components/ui/textarea': '../../apps/mobile/src/components-ui-compat/textarea',
          },
        },
      ],
    ],
  };
};
