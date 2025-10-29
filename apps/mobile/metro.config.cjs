// Learn more https://docs.expo.dev/guides/customizing-metro
// Using .cjs extension to force CommonJS even if parent has type: module
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for module resolution in monorepo
// Prioritize local node_modules to avoid Metro export issues
config.resolver = config.resolver || {};
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

// Explicitly map lucide-react-native to root node_modules so Metro can find it
// This ensures the package is resolvable and watchable
config.resolver.extraNodeModules = config.resolver.extraNodeModules || {};
config.resolver.extraNodeModules['lucide-react-native'] = path.resolve(__dirname, '../../node_modules/lucide-react-native');

// Add resolver alias to redirect lucide-react to lucide-react-native
// This is used by Metro bundler - intercepts ALL lucide-react imports
config.resolver.alias = config.resolver.alias || {};
config.resolver.alias['lucide-react'] = path.resolve(__dirname, 'src/lucide-react-compat');

// Add alias for @radix-ui packages to prevent them from loading
// Redirect to stub modules since these are web-only
// Note: Metro aliases should point to file paths without extension
// Metro will automatically try .ts, .tsx, .js extensions
const radixUiStubs = {
  '@radix-ui/react-slot': path.resolve(__dirname, 'src/components-ui-compat/react-slot-stub'),
  '@radix-ui/react-dialog': path.resolve(__dirname, 'src/components-ui-compat/react-dialog-stub'),
  '@radix-ui/react-tooltip': path.resolve(__dirname, 'src/components-ui-compat/react-tooltip-stub'),
  '@radix-ui/react-toggle': path.resolve(__dirname, 'src/components-ui-compat/react-toggle-stub'),
  '@radix-ui/react-toggle-group': path.resolve(__dirname, 'src/components-ui-compat/react-toggle-group-stub'),
  '@radix-ui/react-toast': path.resolve(__dirname, 'src/components-ui-compat/react-toast-stub'),
  '@radix-ui/react-avatar': path.resolve(__dirname, 'src/components-ui-compat/react-avatar-stub'),
  '@radix-ui/react-label': path.resolve(__dirname, 'src/components-ui-compat/react-label-stub'),
  '@radix-ui/react-slider': path.resolve(__dirname, 'src/components-ui-compat/react-slider-stub'),
  '@radix-ui/react-select': path.resolve(__dirname, 'src/components-ui-compat/react-select-stub'),
  '@radix-ui/react-switch': path.resolve(__dirname, 'src/components-ui-compat/react-switch-stub'),
  '@radix-ui/react-radio-group': path.resolve(__dirname, 'src/components-ui-compat/react-radio-group-stub'),
};

// Apply aliases - Metro will use these to redirect imports
// Metro will automatically try .ts, .tsx, .js, .jsx extensions when resolving
Object.assign(config.resolver.alias, radixUiStubs);

// Force @tanstack/react-query to use our shim which re-exports from legacy build
// The modern ESM build has issues with .js extensions in imports (files missing)
config.resolver.alias['@tanstack/react-query'] = path.resolve(__dirname, 'src/shims/tanstack-react-query');

// Add alias for UI components to redirect to React Native compatible versions
// This prevents the web-only versions from being loaded
const clientSrcPath = path.resolve(__dirname, '../../client/src');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/button')] = path.resolve(__dirname, 'src/components-ui-compat/button');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/input')] = path.resolve(__dirname, 'src/components-ui-compat/input');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/card')] = path.resolve(__dirname, 'src/components-ui-compat/card');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/dialog')] = path.resolve(__dirname, 'src/components-ui-compat/dialog');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/badge')] = path.resolve(__dirname, 'src/components-ui-compat/badge');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/avatar')] = path.resolve(__dirname, 'src/components-ui-compat/avatar');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/label')] = path.resolve(__dirname, 'src/components-ui-compat/label');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/alert')] = path.resolve(__dirname, 'src/components-ui-compat/alert');
config.resolver.alias[path.resolve(clientSrcPath, 'components/ui/textarea')] = path.resolve(__dirname, 'src/components-ui-compat/textarea');

// Custom resolveRequest to intercept @radix-ui imports BEFORE Metro tries node_modules
// This ensures aliases are checked even when Metro resolves dependencies before Babel transforms
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, realModuleName, platform, moduleName) => {
  // Use realModuleName (the actual import path) not moduleName (which may be transformed)
  const moduleToResolve = realModuleName || moduleName;
  
  // Handle @tanstack/react-query - force it to use the react-native source
  if (moduleToResolve === '@tanstack/react-query') {
    const reactQueryPath = path.resolve(__dirname, '../../node_modules/@tanstack/react-query/src/index.ts');
    const fs = require('fs');
    if (fs.existsSync(reactQueryPath)) {
      return {
        filePath: reactQueryPath,
        type: 'sourceFile',
      };
    }
  }
  
  // Check if this is a Radix UI import and we have an alias for it
  if (moduleToResolve && moduleToResolve.startsWith('@radix-ui/')) {
    const stubPath = radixUiStubs[moduleToResolve];
    if (stubPath) {
      // Check if file exists - Metro will try extensions automatically
      const fs = require('fs');
      const possiblePaths = [
        stubPath + '.ts',
        stubPath + '.tsx',
        stubPath + '.js',
        stubPath + '.jsx',
      ];
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          return {
            filePath: filePath,
            type: 'sourceFile',
          };
        }
      }
    }
  }
  
  // Check lucide-react alias
  if (moduleToResolve === 'lucide-react') {
    const lucidePath = path.resolve(__dirname, 'src/lucide-react-compat.ts');
    const fs = require('fs');
    if (fs.existsSync(lucidePath)) {
      return {
        filePath: lucidePath,
        type: 'sourceFile',
      };
    }
  }
  
  // Explicitly handle lucide-react-native using extraNodeModules path
  // This ensures Metro can resolve and track it properly
  if (moduleToResolve === 'lucide-react-native') {
    // Use the extraNodeModules path we configured
    const packagePath = config.resolver.extraNodeModules?.['lucide-react-native'] 
      || path.resolve(__dirname, '../../node_modules/lucide-react-native');
    
    const fs = require('fs');
    const packageJsonPath = path.join(packagePath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      // Use react-native field first, then module, then main
      const entryPoint = packageJson['react-native'] || packageJson.module || packageJson.main;
      if (entryPoint) {
        const fullPath = path.resolve(packagePath, entryPoint);
        if (fs.existsSync(fullPath)) {
          // Return the resolved path - Metro will handle watching via watchFolders
          return {
            filePath: fullPath,
            type: 'sourceFile',
          };
        }
      }
    }
    
    // If explicit resolution fails, try default resolver
    if (originalResolveRequest) {
      try {
        return originalResolveRequest(context, realModuleName, platform, moduleName);
      } catch (e) {
        // If that also fails, throw a helpful error
        throw new Error(`Unable to resolve lucide-react-native. Tried: ${packagePath}`);
      }
    }
  }
  
  // For all other modules, use default resolver
  // Metro's default resolver will check nodeModulesPaths and extraNodeModules
  if (originalResolveRequest) {
    return originalResolveRequest(context, realModuleName, platform, moduleName);
  }
  
  // If no original resolver, try Metro's default resolution
  try {
    return context.resolveRequest(context, realModuleName, platform, moduleName);
  } catch (e) {
    // If Metro's default fails, throw the error
    throw e;
  }
};

// Block web-only packages from being resolved
// This ensures our aliases always take precedence
config.resolver.blockList = config.resolver.blockList || [];

// Block lucide-react (web version uses styled-components which causes .S errors)
// Use path boundary to avoid matching lucide-react-native
const lucideReactPath = path.resolve(__dirname, '../../node_modules/lucide-react');
const escapedLucideReactPath = lucideReactPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Only match the lucide-react directory (and files within it), not lucide-react-native
// The (?:$|/) ensures we match either end of string or a path separator after lucide-react
const lucideReactBlock = new RegExp(`${escapedLucideReactPath}(?:$|/).*`);
config.resolver.blockList.push(lucideReactBlock);

// Block Radix UI packages (web-only, use styled-components)
const radixUiBlock = new RegExp(
  path.resolve(__dirname, '../../node_modules/@radix-ui').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*'
);
config.resolver.blockList.push(radixUiBlock);

// Enable symlinks for monorepo
// Include root directory so Metro can watch files in root node_modules
// Metro needs watchFolders to include directories containing node_modules it uses
config.watchFolders = [
  path.resolve(__dirname), // Mobile app directory
  path.resolve(__dirname, '../..'), // Root directory (for root node_modules)
];

// Set project root to mobile app directory
// This ensures Metro uses the correct base path for file tracking
config.projectRoot = path.resolve(__dirname);

module.exports = config;
