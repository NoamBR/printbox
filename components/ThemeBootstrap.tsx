// Pre-hydration inline script. If user has a saved preference, honor it.
// Otherwise leave the SSR default (light) untouched.
export default function ThemeBootstrap() {
  const code = `(function(){try{var t=localStorage.getItem('pb.theme');if(t==='dark'||t==='light'||t==='sage'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
