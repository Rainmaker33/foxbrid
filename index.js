const chokidar = require('chokidar')
const DebridLinkWatcher = require('./lib/watchers/debrid-link')
const Aria2Downloader = require('./lib/downloaders/aria2')

const {
  DEBRID_LINK_API_KEY,
  ARIA2_URL,
  ARIA2_SECRET,
  WATCH_DIR = '/watch',
  WATCH_RATE = 5000
} = process.env

if (!DEBRID_LINK_API_KEY) {
  console.log('[!] DEBRID_LINK_API_KEY env var is not set')

  process.exit(-1)
}

if (!ARIA2_URL) {
  console.log('[!] ARIA2_URL env var is not set')

  process.exit(-1)
}

if (!ARIA2_SECRET) {
  console.log('[!] ARIA2_SECRET env var is not set')

  process.exit(-1)
}

// Create a downloader instance
const downloader = new Aria2Downloader(ARIA2_URL, ARIA2_SECRET)

// Create a watcher instance
const watcher = new DebridLinkWatcher(DEBRID_LINK_API_KEY, downloader.download, downloader.status)

// Watch for new torrent files
console.log(`[+] Watching '${WATCH_DIR}' for new torrents`)

chokidar
  .watch([
    `${WATCH_DIR}/*.magnet`,
    `${WATCH_DIR}/*.torrent`
  ], {
    awaitWriteFinish: true,
    ignored: '/(^|[/\\])../'
  })
  .on('add', path => {
    watcher.addFile(path)
  })

// Check the torrent watch list every "WATCH_RATE" ms
setInterval(() => watcher.checkWatchList(), WATCH_RATE)
