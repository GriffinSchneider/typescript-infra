// Our Yarn/Lerna workspace setup symlinks @griffins/ packages and installs dependencies
// in a single top-level node_modules folder. Unfortunately, react-native doesn't support
// symlinks. So, we'll copy the entire node_modules folder from the top level into the
// mobile/ folder, resolving symlinks along the way.

import Rsync from 'rsync';
import path from 'path';

const r = new Rsync()
  .archive()
  .set('copy-links')
  .delete()
  .exclude('@griffins/mobile')
  .source(path.join(__dirname, '../../../node_modules'))
  .destination(path.join(__dirname, '../../mobile'));

console.log('Injecting mobile node_modules...');
r.execute(err => {
  if (err) { throw err; }
  console.log('Mobile node_modules injected.');
});
