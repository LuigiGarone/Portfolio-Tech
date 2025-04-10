const { build } = require('electron-builder');

(async () => {
  try {
    await build({
      config: {
        appId: 'com.tuaorganizzazione.estrazionepasqua',
        productName: 'Estrazione Vincitore Pasqua',
        win: {
          target: ['portable'],
          icon: 'icon.ico' // Se hai un'icona
        },
        files: [
          '**/*',
          '!**/*.xlsx',
          '!node_modules',
          '!dist'
        ],
        directories: {
          output: 'dist'
        }
      }
    });
    console.log('Build completata con successo!');
  } catch (error) {
    console.error('Errore durante la build:', error);
  }
})();
