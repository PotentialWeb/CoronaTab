import { compile } from '../src/buildtime/compiler'
import * as puppeteer from 'puppeteer'
import * as chokidar from 'chokidar'
import * as fs from 'fs-extra'
import { shell } from 'execa'
import * as nanoid from 'nanoid'
import Utilities from '../src/shared/utils'
import { config } from 'dotenv'
config()

interface PreviewConfig {
  path?: string
  protocol?: 'https:' | 'http:'
}

class Preview {
  browser: puppeteer.Browser
  page: puppeteer.Page
  watcher: chokidar.FSWatcher
  reprocessPromise: Promise<any>
  constructor (public config: PreviewConfig = {}) {
    this.setup()
  }

  setup () {
    this.checkConfig()
    this.setupWatcher()
  }

  checkConfig () {
    //
  }

  setupWatcher () {
    this.watcher = chokidar.watch([
      './src/runtime',
      './src/shared'
    ])
  }

  async start () {
    await Promise.all([
      this.launchBrowser(),
      this.startWatcher()
    ])

    await this.reprocess()
  }

  async reprocess () {
    if (this.reprocessPromise) return this.reprocessPromise
    this.reprocessPromise = this.compile().then(() => this.injectCode())
    await this.reprocessPromise
    this.reprocessPromise = null
  }

  async startWatcher () {
    await new Promise(r => {
      setTimeout(r, 1000)
      this.watcher.on('ready', r)
    })
    const reprocess = () => {
      console.log('Changes detected, reprocessing')
      return this.reprocess()
    }
    this.watcher.on('change', () => reprocess())
    this.watcher.on('add', () => reprocess())
    this.watcher.on('unlink', () => reprocess())
  }

  async launchBrowser () {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      devtools: false,
      args: [
      ]
    })
    this.page = (await this.browser.pages())[0]

    await this.page.goto(`https://cloudflareworkers.com/#:coronatab.app${this.config.path || '/'}`, { waitUntil: 'networkidle2' })
    await this.page.bringToFront()
  }

  async compile () {
    console.log('Compiling code')
    await compile(this.config)
  }

  async injectCode () {
    console.log('Injecting code')
    const cmd = async (char: string, alt: boolean = false) => {
      const cmdKey = process.platform === 'darwin' ? 'MetaLeft' : 'ControlLeft'
      await this.page.keyboard.down(cmdKey)
      if (alt) {
        await this.page.keyboard.down('AltLeft')
      }
      await this.page.keyboard.down(char)
      await this.page.keyboard.up(char)
      await this.page.keyboard.up(cmdKey)
      if (alt) {
        await this.page.keyboard.up('AltLeft')
      }

    }

    const enterInputValue = async (selectors: string[], value: string) => {
      await this.page.evaluate((selectors, value) => {
        let el: any = document
        for (const selector of selectors) {
          el = el.querySelector(selector)
        }
        el.value = value
        const event = new Event('input', { bubbles: true })
        el.dispatchEvent(event)
      }, selectors, value)
    }

    const code = (await fs.readFile(`./dist/worker.js`)).toString('utf-8')
    const editor = `.monaco-editor`
    const placeholder = nanoid()
    const stepDelay = 100

    await this.page.click(editor)
    await cmd('a')
    await this.page.type(editor, placeholder)
    if (process.platform === 'darwin') {
      await cmd('f', true)
    } else {
      await cmd('h')
    }
    await Utilities.delay(stepDelay)
    await enterInputValue(['.monaco-findInput', 'input'], placeholder)
    await enterInputValue(['.replace-input', 'input'], code)
    await Utilities.delay(stepDelay)
    await this.page.click('.replace-all')
    await this.page.click('.close-fw')
    await this.page.keyboard.press('Escape')
    await this.page.evaluate(() => {
      document.querySelector('iframe[src*="devtools"]')['contentDocument'].querySelector('.console-main-toolbar').shadowRoot.querySelector('[aria-label="Clear console"]').click()
    })
    await cmd('s')
  }

}

shell('killall Chromium')
new Preview().start()
