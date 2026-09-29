/**
 * Runs before first paint so the stored or system theme applies with no flash.
 * Kept tiny and dependency-free because it blocks rendering.
 */
const script = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
