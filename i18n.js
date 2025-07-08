const path = require('path')

module.exports = {
    // setup some locales - other locales default to en silently
    locales: ['en', 'de'],
    
    // where to store json files - defaults to './locales' relative to modules directory
    directory: path.join(__dirname, 'locales'),
  
    // control mode on directory creation - defaults to NULL which defaults to umask of process user. Setting has no effect on win.
    directoryPermissions: '755',
    
  }